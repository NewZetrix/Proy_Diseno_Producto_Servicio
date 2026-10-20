import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { EjemploScreen } from '../screens/EjemploScreen';
import { colors } from '../constants/theme';

export type RootStackParamList = {
  Home: undefined;
  Ejemplo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'SafeSchool' }}
        />
        <Stack.Screen
          name="Ejemplo"
          component={EjemploScreen}
          options={{ title: 'Ejemplo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}