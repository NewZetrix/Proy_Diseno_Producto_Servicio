import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { confirmarSalonASalvo } from '../services/emergencias';
import { mensajeDeError } from '../services/api';
import { useSession } from '../context/SessionContext';
import { colors, spacing, typography } from '../constants/theme';

type Props = {
  emergenciaId: number;
  salonId: number;
  nombreSalon: string;
};

export function DocenteEmergenciaScreen({ emergenciaId, salonId, nombreSalon }: Props) {
  const { token } = useSession();
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState<'PENDIENTE' | 'A_SALVO'>('PENDIENTE');
  const requestInFlight = useRef(false);
  const confirmado = estado === 'A_SALVO';

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
    <View style={styles.container}>
      <Text style={styles.badge}>EMERGENCIA ACTIVA</Text>
      <Text style={styles.salonText}>Salón: {nombreSalon}</Text>
      <Text style={styles.instruction}>
        Siga las rutas de evacuación. Una vez que todos sus alumnos estén en la zona segura, presione el botón.
      </Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
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
    marginBottom: spacing.xl,
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