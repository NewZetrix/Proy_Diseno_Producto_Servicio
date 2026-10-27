import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSession } from '../context/SessionContext';
import { colors, spacing, typography } from '../constants/theme';
import { mensajeDeError } from '../services/api';
import { mostrarNotificacionLocal } from '../services/avisosEnApp';
import { obtenerNotificaciones, type Notificacion } from '../services/notificaciones';

function formatearFecha(fecha: string): string {
  const parsed = new Date(fecha);
  return Number.isNaN(parsed.getTime()) ? fecha : parsed.toLocaleString();
}

export function NotificacionesScreen() {
  const { token } = useSession();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notificacionesConocidas = useRef<{ token: string | null; ids: Set<number> }>({
    token: null,
    ids: new Set(),
  });

  const fetchNotificaciones = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await obtenerNotificaciones(token);
      const conocidas = notificacionesConocidas.current;
      let falloNotificacionLocal = false;
      if (conocidas.token !== token) {
        notificacionesConocidas.current = {
          token,
          ids: new Set(data.map(notificacion => notificacion.id)),
        };
      } else {
        const nuevas = data.filter(notificacion => !conocidas.ids.has(notificacion.id));
        data.forEach(notificacion => conocidas.ids.add(notificacion.id));
        for (const notificacion of nuevas) {
          try {
            await mostrarNotificacionLocal(notificacion.mensaje);
          } catch (notificationError) {
            console.error('No se pudo mostrar el aviso en la app:', notificationError);
            falloNotificacionLocal = true;
          }
        }
      }
      setNotificaciones(data);
      setError(falloNotificacionLocal
        ? 'El historial se actualizó, pero no se pudo mostrar la notificación local.'
        : null);
    } catch (requestError) {
      setError(mensajeDeError(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      let consultando = false;
      let timer: ReturnType<typeof setTimeout> | undefined;

      const consultarPeriodicamente = async () => {
        if (!activo || consultando || AppState.currentState !== 'active') return;
        consultando = true;
        try {
          await fetchNotificaciones();
        } finally {
          consultando = false;
          if (activo && AppState.currentState === 'active') {
            timer = setTimeout(() => void consultarPeriodicamente(), 10000);
          }
        }
      };

      void consultarPeriodicamente();
      const appStateSubscription = AppState.addEventListener('change', state => {
        if (timer) clearTimeout(timer);
        if (state === 'active') void consultarPeriodicamente();
      });

      return () => {
        activo = false;
        if (timer) clearTimeout(timer);
        appStateSubscription.remove();
      };
    }, [fetchNotificaciones])
  );

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
      <Text style={styles.title}>Centro de alertas</Text>
      <Text style={styles.subtitle}>
        Avisos de seguridad de sus hijos. El historial se consulta cada 10 segundos mientras esta pantalla está abierta.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={notificaciones}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void fetchNotificaciones();
            }}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.badge}>AVISO OFICIAL</Text>
              <Text style={styles.dateText}>{formatearFecha(item.fechaCreacion)}</Text>
            </View>
            <Text style={styles.messageText}>{item.mensaje}</Text>
            {item.estado === 'FALLIDA' && (
              <Text style={styles.failedText}>El aviso está disponible en el historial de la app.</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {error ? 'No se pudieron cargar las notificaciones.' : 'No hay notificaciones por el momento.'}
          </Text>
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
    color: colors.textMuted,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
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
    fontWeight: typography.weights.bold,
    color: colors.primary,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  messageText: {
    fontSize: typography.sizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  failedText: {
    color: colors.danger,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
});
