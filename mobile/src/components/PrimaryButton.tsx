import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, radii, spacing, typography } from '../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'secondary';
  style?: ViewStyle;
};

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: Props) {
  const esSecundario = variant === 'secondary';
  const backgroundColor =
    variant === 'danger'
      ? colors.danger
      : esSecundario
      ? colors.surface
      : colors.primary;

  const inactivo = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inactivo, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        esSecundario && styles.secondary,
        { backgroundColor, opacity: pressed || inactivo ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={esSecundario ? colors.primary : '#fff'} />
      ) : (
        <Text style={[styles.text, esSecundario && styles.textSecondary]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  secondary: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  text: {
    color: '#fff',
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold as any,
  },
  textSecondary: {
    color: colors.primary,
  },
});