import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { mensajeDeError } from '../services/api';
import { useSession } from '../context/SessionContext';
import { colors, spacing, typography } from '../constants/theme';

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

type Props = {
  emergenciaId: number;
};

export function DirectorEmergenciaScreen({ emergenciaId }: Props) {
  const { session } = useSession();
  const [resumen, setResumen] = useState<ResumenSalones | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResumenSalones = async () => {
    if (!session?.token) return;
    try {
      const response = await fetch(`http://192.168.18.27:8080/api/emergencias/${emergenciaId}/salones`, {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener el estado de los salones.');
      }

      const data = await response.json();
      setResumen(data);
    } catch (error) {
      Alert.alert('Error', mensajeDeError(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Actualización periódica cada 5 segundos mientras la emergencia está activa
  useEffect(() => {
    fetchResumenSalones();
    const interval = setInterval(() => {
      fetchResumenSalones();
    }, 5000);

    return () => clearInterval(interval);
  }, [emergenciaId]);

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchResumenSalones(); }} />
        }
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
});