import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { activarEmergencia } from '../services/emergencias';
import { mensajeDeError } from '../services/api';
import { useSession } from '../context/SessionContext';
import { colors, spacing, typography } from '../constants/theme';

export function ActivarEmergenciaScreen() {
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const handlePress = () => {
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    ejecutarActivacion();
  };

  const ejecutarActivacion = async () => {
    if (!session?.token) {
      Alert.alert('Error', 'No hay una sesión activa.');
      return;
    }

    setLoading(true);
    try {
      await activarEmergencia(session.token, 'SISMO');
      Alert.alert('¡Alerta Activada!', 'Se ha emitido la señal de emergencia por SISMO.');
      setConfirmando(false);
    } catch (error) {
      Alert.alert('Error', mensajeDeError(error));
      setConfirmando(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel de Control - Emergencias</Text>
      <Text style={styles.subtitle}>
        {confirmando
          ? '¿Está seguro de activar la ALERTA DE SISMO? Toque nuevamente para confirmar.'
          : 'Presione el botón para iniciar la alerta de emergencia en la institución.'}
      </Text>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={confirmando ? '¡CONFIRMAR ACTIVACIÓN!' : 'ACTIVAR EMERGENCIA'}
          onPress={handlePress}
          variant="danger"
          loading={loading}
        />
        {confirmando && (
          <View style={{ marginTop: spacing.md }}>
            <PrimaryButton
              title="Cancelar"
              onPress={() => setConfirmando(false)}
              variant="secondary"
            />
          </View>
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
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
  },
});