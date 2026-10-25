import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { ApiError, mensajeDeError } from '../services/api';
import { activarEmergencia, obtenerEmergenciaActiva } from '../services/emergencias';
import type { EmergenciaResponse } from '../services/emergencias';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { nombre, rol, token, clearSession } = useSession();
  const [emergenciaActiva, setEmergenciaActiva] = useState<EmergenciaResponse | null>(null);
  const [checkingEmergency, setCheckingEmergency] = useState(true);
  const [activating, setActivating] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'SISMO'>('SISMO');

  useFocusEffect(
    useCallback(() => {
      if ((rol !== 'DOCENTE' && rol !== 'DIRECTOR') || !token) {
        setCheckingEmergency(false);
        setEmergenciaActiva(null);
        return;
      }

      let mounted = true;
      setCheckingEmergency(true);
      obtenerEmergenciaActiva(token)
        .then(emergencia => {
          if (mounted) {
            setEmergenciaActiva(emergencia);
          }
        })
        .catch(error => {
          if (!mounted) return;
          setEmergenciaActiva(null);
          if (!(error instanceof ApiError) || error.status !== 404) {
            Alert.alert('No se pudo consultar la emergencia activa', mensajeDeError(error));
          }
        })
        .finally(() => {
          if (mounted) {
            setCheckingEmergency(false);
          }
        });

      return () => {
        mounted = false;
      };
    }, [rol, token])
  );

  function solicitarConfirmacion() {
    Alert.alert(
      'Confirmar emergencia',
      '¿Deseas activar el protocolo de sismo en tu colegio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive', onPress: confirmarActivacion },
      ]
    );
  }

  async function confirmarActivacion() {
    if (!token) {
      Alert.alert('Sesión requerida', 'Inicia sesión nuevamente para activar una emergencia.');
      return;
    }

    if (activating) {
      return;
    }

    setActivating(true);
    try {
      const emergencia = await activarEmergencia(token, tipoSeleccionado);
      if (rol === 'DIRECTOR') {
        navigation.navigate('DirectorEmergencia', { emergenciaId: emergencia.id });
      } else {
        navigation.navigate('ActivarEmergencia', { emergencia });
      }
    } catch (error) {
      Alert.alert('No se pudo activar la emergencia', mensajeDeError(error));
    } finally {
      setActivating(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio</Text>
      <Text style={styles.subtitle}>
        {nombre} · {rol}
      </Text>

      {(rol === 'DIRECTOR' || rol === 'DOCENTE') && (
        <View style={styles.emergencySection}>
          {emergenciaActiva && rol === 'DIRECTOR' ? (
            <PrimaryButton
              title="MONITOREAR EMERGENCIA ACTIVA"
              onPress={() => navigation.navigate('DirectorEmergencia', {
                emergenciaId: emergenciaActiva.id,
              })}
              variant="danger"
              style={styles.emergencyButton}
            />
          ) : emergenciaActiva && rol === 'DOCENTE' ? (
            <PrimaryButton
              title="ABRIR EMERGENCIA ACTIVA"
              onPress={() => navigation.navigate('ActivarEmergencia', { emergencia: emergenciaActiva })}
              variant="danger"
              style={styles.emergencyButton}
            />
          ) : checkingEmergency ? (
            <Text style={styles.safetyNote}>Buscando una emergencia activa...</Text>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Tipo de emergencia</Text>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: tipoSeleccionado === 'SISMO' }}
                accessibilityLabel="Sismo"
                onPress={() => setTipoSeleccionado('SISMO')}
                disabled={activating}
                style={({ pressed }) => [
                  styles.typeOption,
                  pressed && styles.typeOptionPressed,
                ]}
              >
                <Text style={styles.radio}>{tipoSeleccionado === 'SISMO' ? '●' : '○'}</Text>
                <Text style={styles.typeName}>Sismo</Text>
                <Text style={styles.typeTag}>PMV 1</Text>
              </Pressable>

              <PrimaryButton
                title="🚨  ACTIVAR EMERGENCIA"
                onPress={solicitarConfirmacion}
                loading={activating}
                variant="danger"
                style={styles.emergencyButton}
              />
              <Text style={styles.safetyNote}>
                Se te pedirá confirmar antes de enviar la alerta.
              </Text>
            </>
          )}
        </View>
      )}

      <PrimaryButton
        title="Cerrar sesión"
        variant="danger"
        onPress={() => clearSession()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  emergencySection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  typeOption: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  typeOptionPressed: {
    opacity: 0.8,
  },
  radio: {
    color: colors.danger,
    fontSize: typography.sizes.lg,
    marginRight: spacing.md,
  },
  typeName: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  typeTag: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  emergencyButton: {
    height: 76,
  },
  safetyNote: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});