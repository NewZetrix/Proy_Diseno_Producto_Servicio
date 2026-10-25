import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../constants/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivarEmergencia'>;

const instructionIcons = ['●', '◆', '➜'];

export function ActivarEmergenciaScreen({ route }: Props) {
  const { emergencia } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>EMERGENCIA ACTIVA</Text>
      </View>
      <Text style={styles.title}>Protocolo activo</Text>
      <Text style={styles.subtitle}>
        {emergencia.tipo} · Sigue estas instrucciones:
      </Text>

      <View style={styles.instructions}>
        {emergencia.instrucciones.map((instruccion, index) => (
          <View key={`${emergencia.id}-${index}`} style={styles.instructionRow}>
            <Text style={styles.instructionIcon}>
              {instructionIcons[index % instructionIcons.length]}
            </Text>
            <Text style={styles.instructionText}>{instruccion}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
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
    marginBottom: spacing.xl,
  },
  instructions: {
    gap: spacing.md,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  instructionIcon: {
    width: 40,
    height: 40,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.danger,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginRight: spacing.md,
  },
  instructionText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.md,
    lineHeight: 24,
  },
});