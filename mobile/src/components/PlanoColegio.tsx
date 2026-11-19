import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../constants/theme';

export type SalonPlano = {
  salonId: number;
  nombreSalon: string;
  estado: 'PENDIENTE' | 'A_SALVO';
  docenteEncargado: string;
};

type Props = {
  salones: SalonPlano[];
};

// Colores con contraste >= 4.5:1 entre texto y fondo.
const ESTILO = {
  A_SALVO: { fondo: '#E8F5E9', borde: '#1E8449', texto: '#145A32', icono: '✓', etiqueta: 'A SALVO' },
  PENDIENTE: { fondo: '#FFF3E0', borde: '#B9770E', texto: '#7E3B00', icono: '!', etiqueta: 'PENDIENTE' },
} as const;

const COLUMNAS = 2;

/**
 * HU04 (MVP2): plano simplificado del colegio. No usa GPS ni coordenadas:
 * dispone los salones en una cuadrícula dentro del edificio, con la entrada
 * y la zona segura como referencia. Cada salón se pinta según su estado.
 */
export function PlanoColegio({ salones }: Props) {
  const filas: SalonPlano[][] = [];
  for (let i = 0; i < salones.length; i += COLUMNAS) {
    filas.push(salones.slice(i, i + COLUMNAS));
  }
  const pendientes = salones.filter(s => s.estado === 'PENDIENTE').length;

  return (
    <View accessibilityLabel={`Plano del colegio. ${pendientes} salones pendientes.`}>
      <View style={styles.leyenda}>
        {(['PENDIENTE', 'A_SALVO'] as const).map(clave => (
          <View key={clave} style={styles.leyendaItem}>
            <View
              style={[
                styles.leyendaColor,
                { backgroundColor: ESTILO[clave].fondo, borderColor: ESTILO[clave].borde },
              ]}
            />
            <Text style={styles.leyendaTexto}>{ESTILO[clave].etiqueta}</Text>
          </View>
        ))}
      </View>

      <View style={styles.edificio}>
        <Text style={styles.edificioTitulo}>EDIFICIO PRINCIPAL</Text>
        {filas.map((fila, i) => (
          <View key={i} style={styles.fila}>
            {fila.map(salon => {
              const e = ESTILO[salon.estado];
              return (
                <View
                  key={salon.salonId}
                  accessible
                  accessibilityLabel={`${salon.nombreSalon}, ${e.etiqueta}, docente ${salon.docenteEncargado}`}
                  style={[styles.salon, { backgroundColor: e.fondo, borderColor: e.borde }]}
                >
                  <Text style={[styles.salonIcono, { color: e.texto }]}>{e.icono}</Text>
                  <Text style={[styles.salonNombre, { color: e.texto }]} numberOfLines={1}>
                    {salon.nombreSalon}
                  </Text>
                  <Text style={[styles.salonEstado, { color: e.texto }]}>{e.etiqueta}</Text>
                  <Text style={styles.salonDocente} numberOfLines={1}>
                    {salon.docenteEncargado}
                  </Text>
                </View>
              );
            })}
            {fila.length < COLUMNAS && <View style={styles.salonVacio} />}
          </View>
        ))}
        <View style={styles.pasillo}>
          <Text style={styles.pasilloTexto}>PASILLO / ENTRADA ▼</Text>
        </View>
      </View>

      <View style={styles.zonaSegura}>
        <Text style={styles.zonaSeguraTexto}>ZONA SEGURA (PATIO)</Text>
      </View>
      <Text style={styles.aviso}>
        Plano referencial: la ubicación de cada salón es ilustrativa y no representa su posición real en el colegio.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  leyenda: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  leyendaColor: { width: 16, height: 16, borderRadius: 4, borderWidth: 2 },
  leyendaTexto: { fontSize: typography.sizes.sm, color: colors.text },
  edificio: {
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: radii.md,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  edificioTitulo: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  fila: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  salon: {
    flex: 1,
    minHeight: 96,
    borderWidth: 2,
    borderRadius: radii.sm,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  salonVacio: { flex: 1 },
  salonIcono: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  salonNombre: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  salonEstado: { fontSize: typography.sizes.xs, fontWeight: typography.weights.bold },
  salonDocente: { fontSize: typography.sizes.xs, color: colors.textMuted, marginTop: 2 },
  pasillo: {
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pasilloTexto: { fontSize: typography.sizes.xs, color: colors.textMuted, fontWeight: typography.weights.bold },
  zonaSegura: {
    marginTop: spacing.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.success,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: '#F1F8F2',
  },
  aviso: { marginTop: spacing.sm, fontSize: typography.sizes.xs, color: colors.textMuted, fontStyle: 'italic' },
  zonaSeguraTexto: { color: '#145A32', fontWeight: typography.weights.bold, fontSize: typography.sizes.sm },
});
