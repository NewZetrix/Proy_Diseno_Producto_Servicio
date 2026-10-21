import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { api } from '../services/api';

export function HomeScreen() {
  const { nombre, rol, token, clearSession } = useSession();
  const [health, setHealth] = useState<string>('Sin probar');
  const [loading, setLoading] = useState(false);

  async function probarHealth() {
    setLoading(true);
    try {
      const data = await api<{ status: string; servicio: string }>('/api/health', {
        token,
      });
      setHealth(`${data.status} · ${data.servicio}`);
    } catch (e) {
      setHealth(e instanceof Error ? e.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio</Text>
      <Text style={styles.subtitle}>
        {nombre} · {rol}
      </Text>

      <Text style={styles.label}>Estado del backend:</Text>
      <Text style={styles.value}>{health}</Text>

      <PrimaryButton
        title="Probar /api/health"
        onPress={probarHealth}
        loading={loading}
        style={styles.button}
      />

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
  label: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  button: {
    marginBottom: spacing.md,
  },
});