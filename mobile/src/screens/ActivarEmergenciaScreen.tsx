import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, ScrollView, View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../constants/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSession } from '../context/SessionContext';
import { mensajeDeError } from '../services/api';
import { obtenerSalonesDocente } from '../services/emergencias';
import type { SalonDocenteResponse } from '../services/emergencias';
import { DocenteEmergenciaScreen } from './DocenteEmergenciaScreen';
import { PrimaryButton } from '../components/PrimaryButton';
import { useLecturaEnVoz } from '../hooks/useLecturaEnVoz';
import {
  instruccionesLocales,
  normalizarPasos,
  obtenerInstruccionesProtocolo,
} from '../services/protocolo';
import type { PasoProtocolo } from '../services/protocolo';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivarEmergencia'>;

export function ActivarEmergenciaScreen({ route }: Props) {
  const { emergencia } = route.params;
  const { rol, token } = useSession();
  const [salones, setSalones] = useState<SalonDocenteResponse[]>([]);
  const [loadingSalones, setLoadingSalones] = useState(false);
  const { leyendo, error: errorVoz, alternar } = useLecturaEnVoz();
  const [pasos, setPasos] = useState<PasoProtocolo[]>(() => {
    const iniciales = normalizarPasos(emergencia.instrucciones);
    return iniciales.length > 0 ? iniciales : instruccionesLocales(emergencia.tipo);
  });

  // Refresca los pasos desde el backend; si falla, se mantienen los actuales.
  useEffect(() => {
    let mounted = true;
    obtenerInstruccionesProtocolo(emergencia.tipo, token).then(datos => {
      if (mounted && datos.length > 0) {
        setPasos(datos);
      }
    });
    return () => {
      mounted = false;
    };
  }, [emergencia.tipo, token]);

  useEffect(() => {
    if (rol !== 'DOCENTE' || !token) {
      return;
    }

    let mounted = true;
    setLoadingSalones(true);
    obtenerSalonesDocente(token, emergencia.id)
      .then(datos => {
        if (mounted) {
          setSalones(datos);
        }
      })
      .catch(error => {
        if (mounted) {
          Alert.alert('No se pudieron cargar tus salones', mensajeDeError(error));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingSalones(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [emergencia.id, rol, token]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>EMERGENCIA ACTIVA</Text>
        </View>
        <Text style={styles.title}>Protocolo activo</Text>
        <Text style={styles.subtitle}>
          {emergencia.tipo} · Sigue estas instrucciones:
        </Text>

        <PrimaryButton
          title={leyendo ? '■  Detener lectura' : '🔊  Escuchar instrucciones'}
          variant={leyendo ? 'danger' : 'secondary'}
          onPress={() => alternar(pasos.map(p => p.descripcion))}
          style={styles.voiceButton}
        />
        {errorVoz && (
          <Text style={styles.voiceError}>
            No se pudo reproducir la voz en este dispositivo. Lee los pasos en pantalla.
          </Text>
        )}

        <View style={styles.instructions}>
          {pasos.map(item => (
            <View key={`${emergencia.id}-${item.paso}`} style={styles.instructionRow}>
              <Text style={styles.instructionNumber}>{item.paso}</Text>
              <Text style={styles.instructionText}>{item.descripcion}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {rol === 'DOCENTE' && (
        <View style={styles.teacherFooter}>
          <ScrollView
            style={styles.teacherScroll}
            contentContainerStyle={styles.teacherSection}
          >
            {loadingSalones ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : salones.length > 0 ? (
              salones.map(salon => (
                <DocenteEmergenciaScreen
                  key={`${emergencia.id}-${salon.salonId}`}
                  emergenciaId={emergencia.id}
                  salonId={salon.salonId}
                  nombreSalon={salon.nombreSalon}
                  estadoInicial={salon.estado}
                  embedded
                />
              ))
            ) : (
              <Text style={styles.noSalonText}>
                No hay salones asignados a tu usuario en esta emergencia.
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF5F5',
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: '#FFF5F5',
  },
  statusBadge: {
    alignSelf: 'center',
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginBottom: spacing.lg,
  },
  statusText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  voiceButton: {
    height: 60,
    marginBottom: spacing.md,
  },
  voiceError: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  instructions: {
    gap: spacing.md,
  },
  teacherFooter: {
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.danger,
    padding: spacing.md,
    elevation: 8,
  },
  teacherScroll: {
    maxHeight: 280,
  },
  teacherSection: {
    gap: spacing.md,
  },
  noSalonText: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  instructionNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 40,
    backgroundColor: colors.danger,
    color: colors.surface,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginRight: spacing.md,
  },
  instructionText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.lg,
    lineHeight: 28,
  },
});