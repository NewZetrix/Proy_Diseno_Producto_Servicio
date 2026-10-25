import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificacionesScreen } from '../screens/NotificacionesScreen';
import { ActivarEmergenciaScreen } from '../screens/ActivarEmergenciaScreen';
import { colors } from '../constants/theme';
import type { EmergenciaResponse } from '../services/emergencias';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Notificaciones: undefined;
  ActivarEmergencia: { emergencia: EmergenciaResponse };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLoading, rol } = useSession();

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
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}