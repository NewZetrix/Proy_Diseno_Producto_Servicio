import { Alert } from 'react-native';

export async function mostrarNotificacionLocal(mensaje: string): Promise<void> {
  Alert.alert('SafeSchool: aviso escolar', mensaje);
}
