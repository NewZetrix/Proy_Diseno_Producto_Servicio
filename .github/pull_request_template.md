mport React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';

export default function DirectorSalonesScreen() {
  const [data, setData] = useState({ salones: [], salonesConfirmados: 0, totalSalones: 0, activa: false });
  const [loading, setLoading] = useState(false);

  const fetchSalones = async () => {
    try {
      // Llamada al backend Spring Boot
      const response = await fetch('https://api.tuapp.com/api/emergencias/activa/salones');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error("Error al obtener salones:", error);
    }
  };

  useEffect(() => {
    // Carga inicial
    fetchSalones();

    let interval;
    // Solo activar polling si la emergencia está activa
    if (data.activa !== false) { // o basado en el estado inicial de la emergencia
      interval = setInterval(() => {
        fetchSalones();
      }, 5000); // Consulta cada 5 segundos
    }

    return () => clearInterval(interval); // Limpiar al desmontar
  }, [data.activa]);

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>
        {data.salonesConfirmados} de {data.totalSalones} salones confirmados
      </Text>
      <Button title="Recargar Manual" onPress={fetchSalones} />

      <FlatList
        data={data.salones}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nombre}</Text>
            <View style={[styles.semaforo, { backgroundColor: item.estado === 'SEGURO' ? '#4CAF50' : '#FFEB3B' }]} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  counter: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  semaforo: { width: 20, height: 20, borderRadius: 10 }
});
