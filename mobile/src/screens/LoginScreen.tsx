import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../constants/theme';
import { useSession } from '../context/SessionContext';
import { login } from '../services/auth';

export function LoginScreen() {
  const { setSession } = useSession();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      const data = await login(correo.trim(), password);
      await setSession({
        token: data.token,
        rol: data.rol,
        nombre: data.nombre,
        id: data.id,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>SafeSchool</Text>
      <Text style={styles.subtitle}>Inicia sesión con tu cuenta del colegio</Text>

      <Text style={styles.label}>Correo</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
        placeholder="correo@ejemplo.com"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        placeholderTextColor={colors.textMuted}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        title="Ingresar"
        onPress={onSubmit}
        loading={loading}
        style={styles.button}
      />
    </KeyboardAvoidingView>
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
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    marginBottom: spacing.md,
    minHeight: 52,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.md,
    fontSize: typography.body,
  },
  button: {
    marginTop: spacing.sm,
  },
});