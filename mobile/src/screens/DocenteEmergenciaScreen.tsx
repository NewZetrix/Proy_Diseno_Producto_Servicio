import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
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
  const { session } = useSession();
  const [loading, setLoading] = useState(false);
  const [confirmado, setConfirmado] = useState(false);

  const handleConfirmar = async () => {
    if (!session?.token) {
      Alert.alert('Error', 'No hay una sesión activa.');
      return;
    }

    setLoading(true);
    try {
      await confirmarSalonASalvo(session.token, emergenciaId, salonId);
      setConfirmado(true);
      Alert.alert('Reporte Enviado', `El salón ${nombreSalon} ha sido marcado como A SALVO.`);
    } catch (error) {
      Alert.alert('Error', mensajeDeError(error));
    } finally {
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
        <PrimaryButton
          title={confirmado ? '✓ SALÓN A SALVO' : 'SALÓN A SALVO'}
          onPress={handleConfirmar}
          disabled={confirmado}
          variant={confirmado ? 'secondary' : 'primary'}
          loading={loading}
        />
        {confirmado && (
          <Text style={styles.successText}>
            Reporte registrado con éxito en el sistema.
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
    paddingVertical: spacing.xs,
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
  successText: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: 'green',
    fontWeight: 'bold',
  },
});