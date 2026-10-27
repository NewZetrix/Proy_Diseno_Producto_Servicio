import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../components/PrimaryButton';
import { api, mensajeDeError } from '../services/api';
import { finalizarEmergencia as finalizarEmergenciaApi } from '../services/emergencias';
import { useSession } from '../context/SessionContext';
import { colors, spacing, typography } from '../constants/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';

type SalonEstado = {
  salonId: number;
  nombreSalon: string;
  estado: 'PENDIENTE' | 'A_SALVO';
  horaConfirmacion?: string;
  docenteEncargado: string;
};

type ResumenSalones = {
  emergenciaId: number;
  tipoEmergencia: string;
  totalSalones: number;
  salonesConfirmados: number;
  salonesPendientes: number;
  salones: SalonEstado[];
};

type Props = NativeStackScreenProps<RootStackParamList, 'DirectorEmergencia'>;

export function DirectorEmergenciaScreen({ route, navigation }: Props) {
  const { emergenciaId } = route.params;
  const { token } = useSession();
  const [resumen, setResumen] = useState<ResumenSalones | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalized, setFinalized] = useState(false);

  const fetchResumenSalones = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await api<ResumenSalones>(`/api/emergencias/${emergenciaId}/salones`, {
        token,
      });
      setResumen(data);
    } catch (error) {
      Alert.alert('Error', mensajeDeError(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [emergenciaId, token]);

  const solicitarFinalizacion = () => {
    const pendientes = resumen?.salonesPendientes ?? 0;
    const advertencia = pendientes > 0
      ? `Todavía hay ${pendientes} salón(es) pendientes. `
      : '';
    Alert.alert(
      'Finalizar emergencia',
      `${advertencia}Esta acción cerrará el protocolo y permitirá activar otra emergencia. ¿Deseas continuar?`,
      [
        { text: 'Seguir monitoreando', style: 'cancel' },
        { text: 'Finalizar', style: 'destructive', onPress: confirmarFinalizacion },
      ]
    );
  };

  const confirmarFinalizacion = async () => {
    if (!token || finalizing) return;
    setFinalizing(true);
    try {
      await finalizarEmergenciaApi(token, emergenciaId);
      setFinalized(true);
      Alert.alert('Emergencia finalizada', 'El protocolo se cerró correctamente.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('No se pudo finalizar la emergencia', mensajeDeError(error));
    } finally {
      setFinalizing(false);
    }
  };

  // Actualización periódica cada 5 segundos mientras la emergencia está activa
  useEffect(() => {
    if (finalized) return;

    void fetchResumenSalones();
    const interval = setInterval(() => {
      void fetchResumenSalones();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchResumenSalones, finalized]);

  if (loading && !resumen) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando estado de la emergencia...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.badge}>MONITOREO EN VIVO</Text>
        <Text style={styles.title}>Emergencia: {resumen?.tipoEmergencia}</Text>
        <Text style={styles.counter}>
          Confirmados: {resumen?.salonesConfirmados} de {resumen?.totalSalones} salones
        </Text>
      </View>

      <FlatList
        data={resumen?.salones}
        keyExtractor={(item) => item.salonId.toString()}
        refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            void fetchResumenSalones();
          }}
        />}
        renderItem={({ item }) => {
          const isA_Salvo = item.estado === 'A_SALVO';
          return (
            <View style={[styles.salonCard, { borderLeftColor: isA_Salvo ? '#2e7d32' : '#f57c00' }]}>
              <View style={styles.salonInfo}>
                <Text style={styles.salonName}>{item.nombreSalon}</Text>
                <Text style={styles.docenteText}>Docente: {item.docenteEncargado}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: isA_Salvo ? '#e8f5e9' : '#fff3e0' }]}>
                <Text style={[styles.statusText, { color: isA_Salvo ? '#2e7d32' : '#f57c00' }]}>
                  {isA_Salvo ? 'A SALVO' : 'PENDIENTE'}
                </Text>
              </View>
            </View>
          );
        }}
      />
      <PrimaryButton
        title="FINALIZAR EMERGENCIA"
        onPress={solicitarFinalizacion}
        loading={finalizing}
        variant="danger"
        style={styles.finalizeButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: '#666',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    elevation: 2,
  },
  badge: {
    backgroundColor: colors.danger,
    color: '#fff',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    fontSize: typography.sizes.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
  },
  counter: {
    fontSize: typography.sizes.md,
    color: '#444',
    marginTop: spacing.xs,
  },
  salonCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 6,
    borderLeftWidth: 6,
    elevation: 1,
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    fontSize: typography.sizes.md,
    fontWeight: 'bold',
    color: '#333',
  },
  docenteText: {
    fontSize: typography.sizes.sm,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: typography.sizes.xs,
  },
  finalizeButton: {
    marginTop: spacing.sm,
    minHeight: 60,
  },
});