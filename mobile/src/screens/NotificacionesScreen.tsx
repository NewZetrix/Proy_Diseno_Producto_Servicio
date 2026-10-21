import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import { useSession } from '../context/SessionContext';

export function NotificacionesScreen() {
  const { nombre, clearSession } = useSession();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificaciones</Text>
      <Text style={styles.body}>
        Hola {nombre}. Aquí verás las alertas de tus hijos (se implementa en HU03).
      </Text>

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
    marginBottom: spacing.md,
  },
  body: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
});