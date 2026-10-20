import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import { api } from '../services/api';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const [health, setHealth] = useState<string>('Sin probar');
  const [loading, setLoading] = useState(false);

  async function probarHealth() {
    setLoading(true);
    try {
      const data = await api<{ status: string; servicio: string }>('/api/health');
      setHealth(`${data.status} · ${data.servicio}`);
    } catch (e) {
      setHealth(e instanceof Error ? e.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafeSchool</Text>
      <Text style={styles.subtitle}>Base de navegación móvil</Text>

      <Text style={styles.label}>Estado del backend:</Text>
      <Text style={styles.value}>{health}</Text>

      <PrimaryButton
        title="Probar /api/health"
        onPress={probarHealth}
        loading={loading}
        style={styles.button}
      />

      <PrimaryButton
        title="Ir a pantalla de ejemplo"
        onPress={() => navigation.navigate('Ejemplo')}
        style={styles.button}
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