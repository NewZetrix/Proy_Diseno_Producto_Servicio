import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Ejemplo'>;

export function EjemploScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de ejemplo</Text>
      <Text style={styles.body}>
        Esta pantalla solo sirve para verificar la navegación stack de la rama base.
      </Text>

      <PrimaryButton title="Volver" onPress={() => navigation.goBack()} />
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
    fontSize: typography.subtitle,
    fontWeight: '700',
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