import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, ScrollView, View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../constants/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSession } from '../context/SessionContext';
import { mensajeDeError } from '../services/api';
import { obtenerSalonesDocente } from '../services/emergencias';
import type { SalonDocenteResponse } from '../services/emergencias';
import { DocenteEmergenciaScreen } from './DocenteEmergenciaScreen';

type Props = NativeStackScreenProps<RootStackParamList, 'ActivarEmergencia'>;

const instructionIcons = ['●', '◆', '➜'];

export function ActivarEmergenciaScreen({ route }: Props) {
  const { emergencia } = route.params;
  const { rol, token } = useSession();
  const [salones, setSalones] = useState<SalonDocenteResponse[]>([]);
  const [loadingSalones, setLoadingSalones] = useState(false);

  useEffect(() => {
    if (rol !== 'DOCENTE' || !token) {
      return;
    }

    let mounted = true;
    setLoadingSalones(true);
    obtenerSalonesDocente(token, emergencia.id)
      .then(datos => {
        if (mounted) {
          setSalones(datos);
        }
      })
      .catch(error => {
        if (mounted) {
          Alert.alert('No se pudieron cargar tus salones', mensajeDeError(error));
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingSalones(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [emergencia.id, rol, token]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
      {rol === 'DOCENTE' && (
        <View style={styles.teacherSection}>
          {loadingSalones ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : salones.length > 0 ? (
            salones.map(salon => (
              <DocenteEmergenciaScreen
                key={`${emergencia.id}-${salon.salonId}`}
                emergenciaId={emergencia.id}
                salonId={salon.salonId}
                nombreSalon={salon.nombreSalon}
                estadoInicial={salon.estado}
                embedded
              />
            ))
          ) : (
            <Text style={styles.noSalonText}>
              No hay salones asignados a tu usuario en esta emergencia.
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
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
  teacherSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  noSalonText: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    textAlign: 'center',
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