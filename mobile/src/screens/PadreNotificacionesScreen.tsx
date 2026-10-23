import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSession } from '../context/SessionContext';
import { mensajeDeError } from '../services/api';
import { colors, spacing, typography } from '../constants/theme';

type Notificacion = {
  id: number;
  mensaje: string;
  fechaCreacion: string;
  estado: string;
};

export function PadreNotificacionesScreen() {
  const { session } = useSession();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotificaciones = async () => {
    if (!session?.token) return;
    try {
      const response = await fetch('http://192.168.18.27:8080/api/notificaciones', {
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('No se pudieron cargar las notificaciones.');
      }

      const data = await response.json();
      setNotificaciones(data);
    } catch (error) {
      Alert.alert('Error', mensajeDeError(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  if (loading && notificaciones.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Centro de Alertas - Apoderado</Text>
      <Text style={styles.subtitle}>Historial de seguridad de sus hijos en la institución.</Text>

      <FlatList
        data={notificaciones}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotificaciones(); }} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.badge}>AVISO OFICIAL</Text>
              <Text style={styles.dateText}>{item.fechaCreacion}</Text>
            </View>
            <Text style={styles.messageText}>{item.mensaje}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay notificaciones registradas por el momento.</Text>
        }
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
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: '#666',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    fontSize: typography.sizes.xs,
    fontWeight: 'bold',
    color: colors.primary,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: '#888',
  },
  messageText: {
    fontSize: typography.sizes.md,
    color: '#333',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: spacing.xl,
  },
});