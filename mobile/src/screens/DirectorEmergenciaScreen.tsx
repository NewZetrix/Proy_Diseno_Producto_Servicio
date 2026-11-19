import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Pressable,
} from 'react-native';
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

function obtenerUbicacionRelativa(item: SalonEstado, index: number): string {
  const texto = `${item.nombreSalon} ${item.docenteEncargado}`.toLowerCase();
  if (texto.includes('piso 1') || texto.includes('1er') || texto.includes('primero')) {
    return '1.er Piso · Zona Central';
  }
  if (texto.includes('piso 2') || texto.includes('2do') || texto.includes('segundo')) {
    return '2.do Piso · Pabellón Norte';
  }
  if (texto.includes('piso 3') || texto.includes('3er') || texto.includes('tercero')) {
    return '3.er Piso · Pabellón Sur';
  }
  const sectores = [
    'Pabellón A · Patio Principal',
    'Pabellón A · Ala Este',
    'Pabellón B · Ala Oeste',
    'Pabellón B · Zona Segura',
  ];
  return sectores[index % sectores.length];
}

export function DirectorEmergenciaScreen({ route, navigation }: Props) {
  const { emergenciaId } = route.params;
  const { token } = useSession();
  const [resumen, setResumen] = useState<ResumenSalones | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [vistaMapa, setVistaMapa] = useState(true);

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

  const salones = resumen?.salones ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.badge}>MONITOREO EN VIVO</Text>
        <Text style={styles.title}>Emergencia: {resumen?.tipoEmergencia}</Text>
        <Text style={styles.counter}>
          Confirmados: {resumen?.salonesConfirmados} de {resumen?.totalSalones} salones
        </Text>

        <View style={styles.modeSwitchRow}>
          <Pressable
            onPress={() => setVistaMapa(true)}
            style={[styles.modeButton, vistaMapa && styles.modeButtonActive]}
          >
            <Text style={[styles.modeButtonText, vistaMapa && styles.modeButtonTextActive]}>
              Plano del colegio
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setVistaMapa(false)}
            style={[styles.modeButton, !vistaMapa && styles.modeButtonActive]}
          >
            <Text style={[styles.modeButtonText, !vistaMapa && styles.modeButtonTextActive]}>
              Lista de salones
            </Text>
          </Pressable>
        </View>
      </View>

      {vistaMapa ? (
        <ScrollView
          style={styles.mapScroll}
          contentContainerStyle={styles.mapContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void fetchResumenSalones();
              }}
            />
          }
        >
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2e7d32' }]} />
              <Text style={styles.legendText}>A SALVO ({resumen?.salonesConfirmados ?? 0})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f57c00' }]} />
              <Text style={styles.legendText}>PENDIENTE ({resumen?.salonesPendientes ?? 0})</Text>
            </View>
          </View>

          <View style={styles.mapGrid}>
            {salones.map((item, index) => {
              const isA_Salvo = item.estado === 'A_SALVO';
              return (
                <View
                  key={item.salonId.toString()}
                  style={[
                    styles.mapTile,
                    {
                      backgroundColor: isA_Salvo ? '#e8f5e9' : '#fff3e0',
                      borderColor: isA_Salvo ? '#2e7d32' : '#f57c00',
                    },
                  ]}
                >
                  <Text style={styles.mapTileTitle} numberOfLines={1}>
                    {item.nombreSalon}
                  </Text>
                  <Text style={styles.mapTileLocation} numberOfLines={1}>
                    {obtenerUbicacionRelativa(item, index)}
                  </Text>
                  <Text style={styles.mapTileTeacher} numberOfLines={1}>
                    {item.docenteEncargado}
                  </Text>
                  <View
                    style={[
                      styles.mapStatusPill,
                      { backgroundColor: isA_Salvo ? '#2e7d32' : '#f57c00' },
                    ]}
                  >
                    <Text style={styles.mapStatusPillText}>
                      {isA_Salvo ? 'A SALVO' : 'PENDIENTE'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
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
      )}

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
  modeSwitchRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeButtonText: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: '#334155',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  mapScroll: {
    flex: 1,
  },
  mapContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: '#334155',
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  mapTile: {
    width: '48%',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.sm,
    justifyContent: 'space-between',
    minHeight: 105,
  },
  mapTileTitle: {
    fontSize: typography.sizes.md,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  mapTileLocation: {
    fontSize: typography.sizes.xs,
    color: '#475569',
    marginTop: 2,
  },
  mapTileTeacher: {
    fontSize: typography.sizes.xs,
    color: '#64748b',
    marginTop: 2,
  },
  mapStatusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: spacing.xs,
  },
  mapStatusPillText: {
    color: '#fff',
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
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