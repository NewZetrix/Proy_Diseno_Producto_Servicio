import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

const SalonesDirectorScreen = ({ route }) => {
  const { emergenciaId } = route.params || { emergenciaId: 1 }; // ID de la emergencia activa
  const [salones, setSalones] = useState([]);
  const [totales, setTotales] = useState({ confirmados: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Petición al Backend (Spring Boot)
  const fetchSalones = useCallback(async () => {
    try {
      const response = await fetch(`http://TU_API_URL/api/emergencias/${emergenciaId}/salones`, {
        headers: { 'Authorization': 'Bearer TOKEN_DEL_DIRECTOR' } // Backend validará rol 
      });
      
      if (response.status === 403) {
        alert("Acceso denegado: No tienes permisos de Director.");
        return;
      }

      const data = await response.json();
      setSalones(data.salones);
      setTotales({
        confirmados: data.totalConfirmados,
        total: data.totalSalones
      });
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    } finally {
      setLoading(false);
    }
  }, [emergenciaId]);

  // Configuración del Polling (Cada 5 segundos)
  useEffect(() => {
    fetchSalones(); // Carga inicial

    const interval = setInterval(() => {
      fetchSalones();
    }, 5000); // Tarea T3 de usabilidad

    return () => clearInterval(interval); // Limpieza al salir de la pantalla
  }, [fetchSalones]);

  // Renderizado de cada salón (Semáforo)
  const renderSalon = ({ item }) => {
    const esA_Salvo = item.estado === 'A_SALVO';
    return (
      <View style={[styles.card, esA_Salvo ? styles.bordeVerde : styles.bordeAmarillo]}>
        <View style={styles.cardHeader}>
          <Text style={styles.salonNombre}>{item.salonNombre}</Text>
          <View style={[styles.badge, esA_Salvo ? styles.bgVerde : styles.bgAmarillo]}>
            <Text style={styles.badgeText}>{item.estado}</Text>
          </View>
        </View>
        {esA_Salvo && (
          <Text style={styles.horaTxt}>Confirmado: {item.horaConfirmacion}</Text>
        )}
      </View>
    );
  };
