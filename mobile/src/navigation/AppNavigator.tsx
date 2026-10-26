import React from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificacionesScreen } from '../screens/NotificacionesScreen';
import { ActivarEmergenciaScreen } from '../screens/ActivarEmergenciaScreen';
import { DirectorEmergenciaScreen } from '../screens/DirectorEmergenciaScreen';
import { colors } from '../constants/theme';
import type { EmergenciaResponse } from '../services/emergencias';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Notificaciones: undefined;
  ActivarEmergencia: { emergencia: EmergenciaResponse };
  DirectorEmergencia: { emergenciaId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLoading, rol, clearSession } = useSession();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
          headerRight: isAuthenticated
            ? () => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar sesión"
                  hitSlop={8}
                  onPress={() =>
                    Alert.alert(
                      'Cerrar sesión',
                      '¿Quieres cerrar tu sesión?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Cerrar sesión',
                          style: 'destructive',
                          onPress: () => {
                            void clearSession();
                          },
                        },
                      ]
                    )
                  }
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', padding: 8 }}>
                    Salir
                  </Text>
                </Pressable>
              )
            : undefined,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : rol === 'PADRE' ? (
          <Stack.Screen
            name="Notificaciones"
            component={NotificacionesScreen}
            options={{ title: 'Notificaciones' }}
          />
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Inicio' }}
            />
            <Stack.Screen
              name="ActivarEmergencia"
              component={ActivarEmergenciaScreen}
              options={{ title: 'Protocolo activo' }}
            />
            {rol === 'DIRECTOR' && (
              <Stack.Screen
                name="DirectorEmergencia"
                component={DirectorEmergenciaScreen}
                options={{ title: 'Monitoreo de emergencia' }}
              />
            )}
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}