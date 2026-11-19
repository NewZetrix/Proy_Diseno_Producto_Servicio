import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { confirmarSalonASalvo } from '../services/emergencias';
import { mensajeDeError } from '../services/api';
import { obtenerInstruccionesProtocolo, PasoProtocolo } from '../services/protocolo';
import { useSession } from '../context/SessionContext';
import { colors, spacing, typography } from '../constants/theme';

type Props = {
  emergenciaId: number;
  salonId: number;
  nombreSalon: string;
  estadoInicial?: 'PENDIENTE' | 'A_SALVO';
  embedded?: boolean;
  tipoEmergencia?: 'SISMO' | 'INCENDIO' | 'INTRUSO' | string;
};

export function DocenteEmergenciaScreen({
  emergenciaId,
  salonId,
  nombreSalon,
  estadoInicial = 'PENDIENTE',
  embedded = false,
  tipoEmergencia = 'SISMO',
}: Props) {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState<'PENDIENTE' | 'A_SALVO'>(estadoInicial);
  const [pasos, setPasos] = useState<PasoProtocolo[]>([]);
  const [cargandoPasos, setCargandoPasos] = useState(true);
  const [hablando, setHablando] = useState(false);
  const requestInFlight = useRef(false);
  const confirmado = estado === 'A_SALVO';
  const tipoNormalizado = (tipoEmergencia || 'SISMO').toUpperCase();

  useEffect(() => {
    let activo = true;

    const cargarPasos = async () => {
      setCargandoPasos(true);
      const lista = await obtenerInstruccionesProtocolo(tipoNormalizado, token);
      if (activo) {
        setPasos(lista);
        setCargandoPasos(false);
      }
    };

    cargarPasos();

    return () => {
      activo = false;
      Speech.stop();
    };
  }, [tipoNormalizado, token]);

  const handleToggleVoz = () => {
    if (hablando) {
      Speech.stop();
      setHablando(false);
      return;
    }

    if (pasos.length === 0) return;

    const textoPasos = pasos
      .map((item, idx) => {
        const numero = item.orden ?? item.paso ?? idx + 1;
        return `Paso ${numero}: ${item.descripcion}`;
      })
      .join('. ');

    setHablando(true);
    Speech.speak(`Protocolo de ${tipoNormalizado}. ${textoPasos}`, {
      language: 'es-PE',
      rate: 0.95,
      onDone: () => setHablando(false),
      onStopped: () => setHablando(false),
      onError: () => setHablando(false),
    });
  };

  const handleConfirmar = async () => {
    if (!token) {
      Alert.alert('Error', 'No hay una sesión activa.');
      return;
    }

    if (requestInFlight.current || confirmado) {
      return;
    }

    requestInFlight.current = true;
    setLoading(true);
    Speech.stop();
    setHablando(false);

    try {
      const respuesta = await confirmarSalonASalvo(token, emergenciaId, salonId);
      if (respuesta.estado !== 'A_SALVO') {
        throw new Error('El servidor no confirmó el estado A SALVO.');
      }
      setEstado('A_SALVO');
    } catch (error) {
      Alert.alert('Error', mensajeDeError(error));
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        embedded && styles.embeddedContainer,
      ]}
    >
      <Text style={styles.badge}>EMERGENCIA ACTIVA · {tipoNormalizado}</Text>
      <Text style={styles.salonText}>Salón: {nombreSalon}</Text>
      <Text style={styles.instruction}>
        Siga las rutas de evacuación. Una vez que todos sus alumnos estén en la zona segura, presione el botón.
      </Text>

      <Pressable
        onPress={handleToggleVoz}
        accessibilityRole="button"
        accessibilityLabel={
          hablando ? 'Detener lectura en voz de instrucciones' : 'Escuchar instrucciones en voz alta'
        }
        accessibilityState={{ busy: hablando }}
        style={({ pressed }) => [
          styles.voiceButton,
          hablando && styles.voiceButtonActive,
          pressed && styles.voiceButtonPressed,
        ]}
      >
        <Text style={styles.voiceButtonText}>
          {hablando ? '⏹  DETENER LECTURA DE VOZ' : '🔊  ESCUCHAR INSTRUCCIONES'}
        </Text>
      </Pressable>

      <View style={styles.protocolSection}>
        <Text style={styles.protocolTitle}>Pasos del protocolo ({tipoNormalizado})</Text>
        {cargandoPasos ? (
          <ActivityIndicator color={colors.primary} style={styles.protocolLoader} />
        ) : (
          pasos.map((item, index) => {
            const numeroPaso = item.orden ?? item.paso ?? index + 1;
            return (
              <View key={`${numeroPaso}-${index}`} style={styles.stepCard}>
                <Text style={styles.stepNumber}>Paso {numeroPaso}</Text>
                {item.titulo ? <Text style={styles.stepTitle}>{item.titulo}</Text> : null}
                <Text style={styles.stepDescription}>{item.descripcion}</Text>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.actionArea}>
        <Pressable
          onPress={handleConfirmar}
          disabled={confirmado || loading}
          accessibilityRole="button"
          accessibilityLabel={confirmado ? 'Salón a salvo, reporte enviado' : 'Marcar salón a salvo'}
          accessibilityState={{ disabled: confirmado || loading, busy: loading }}
          style={({ pressed }) => [
            styles.confirmButton,
            confirmado && styles.confirmButtonDone,
            pressed && !confirmado && !loading && styles.confirmButtonPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="large" />
          ) : (
            <Text style={styles.confirmButtonText}>
              {confirmado ? '✓  SALÓN A SALVO' : 'SALÓN A SALVO'}
            </Text>
          )}
        </Pressable>
        {confirmado && (
          <Text style={styles.successText}>
            Reporte enviado. El salón quedó registrado como A SALVO.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
  },
  embeddedContainer: {
    flexGrow: 0,
    padding: 0,
    backgroundColor: 'transparent',
  },
  badge: {
    backgroundColor: colors.danger,
    color: '#FFF',
    fontWeight: 'bold',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 4,
    marginBottom: spacing.md,
  },
  salonText: {
    fontSize: typography.sizes.lg,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  instruction: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    color: '#555',
    marginBottom: spacing.md,
  },
  voiceButton: {
    width: '100%',
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.primary,
    marginBottom: spacing.md,
  },
  voiceButtonActive: {
    backgroundColor: '#B45309',
  },
  voiceButtonPressed: {
    opacity: 0.85,
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  protocolSection: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  protocolTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  protocolLoader: {
    marginVertical: spacing.md,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  stepNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: '#1F2937',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: typography.sizes.md,
    color: '#374151',
  },
  actionArea: {
    width: '100%',
  },
  confirmButton: {
    minHeight: 76,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.danger,
    elevation: 4,
  },
  confirmButtonDone: {
    backgroundColor: colors.success,
  },
  confirmButtonPressed: {
    opacity: 0.82,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  successText: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.success,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.md,
  },
});