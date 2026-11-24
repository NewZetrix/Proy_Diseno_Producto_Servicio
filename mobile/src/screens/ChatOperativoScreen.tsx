import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
  type KeyboardEvent,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSession } from '../context/SessionContext';
import { mensajeDeError } from '../services/api';
import { enviarMensajeChat, listarMensajesChat, type MensajeChat } from '../services/chat';
import { colors, spacing, typography } from '../constants/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatOperativo'>;

export function ChatOperativoScreen({ route }: Props) {
  const { emergenciaId } = route.params;
  const { token, nombre } = useSession();
  const insets = useSafeAreaInsets();
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const cargar = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listarMensajesChat(token, emergenciaId);
      setMensajes(data);
      setError(null);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setLoading(false);
    }
  }, [token, emergenciaId]);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      let timer: ReturnType<typeof setTimeout> | undefined;

      const loop = async () => {
        if (!activo) return;
        await cargar();
        if (activo) timer = setTimeout(() => void loop(), 5000);
      };

      setLoading(true);
      void loop();

      return () => {
        activo = false;
        if (timer) clearTimeout(timer);
      };
    }, [cargar])
  );

  // Android: subir el composer cuando abre el teclado
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    const onHide = () => setKeyboardHeight(0);

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const enviar = async () => {
    const limpio = texto.trim();
    if (!token || !limpio || sending) return;
    setSending(true);
    try {
      const nuevo = await enviarMensajeChat(token, emergenciaId, limpio);
      setMensajes(prev => [...prev, nuevo]);
      setTexto('');
      setError(null);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setSending(false);
    }
  };

  if (loading && mensajes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>Cargando chat...</Text>
      </View>
    );
  }

  const bottomPad =
    keyboardHeight > 0
      ? Platform.OS === 'android'
        ? keyboardHeight + 8
        : Math.max(insets.bottom, 12)
      : Math.max(insets.bottom, 12);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.body}>
        <Text style={styles.subtitle}>
          Solo texto · Director y docentes · Emergencia activa
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <FlatList
          style={styles.list}
          data={mensajes}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.muted}>
              Aún no hay mensajes. Coordina el protocolo aquí.
            </Text>
          }
          renderItem={({ item }) => {
            const propio = item.nombreRemitente === nombre;
            return (
              <View style={[styles.bubble, propio ? styles.bubbleOwn : styles.bubbleOther]}>
                <Text style={styles.meta}>
                  {item.nombreRemitente} · {item.rolRemitente}
                </Text>
                <Text style={styles.bodyText}>{item.texto}</Text>
              </View>
            );
          }}
        />
      </View>

      <View style={[styles.composer, { paddingBottom: bottomPad }]}>
        <TextInput
          style={styles.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Mensaje corto (máx. 250)"
          placeholderTextColor="#5D6D7E"
          maxLength={250}
          editable={!sending}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, (!texto.trim() || sending) && styles.sendDisabled]}
          onPress={() => void enviar()}
          disabled={!texto.trim() || sending}
        >
          <Text style={styles.sendText}>{sending ? '...' : 'Enviar'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6F7',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    color: '#5D6D7E',
    marginBottom: 8,
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#FDEDEC',
    borderColor: '#C0392B',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  errorText: {
    color: '#C0392B',
    fontSize: 13,
  },
  muted: {
    color: '#5D6D7E',
    textAlign: 'center',
    marginTop: 32,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '88%',
  },
  bubbleOwn: {
    alignSelf: 'flex-end',
    backgroundColor: '#D6EAF8',
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D8DC',
  },
  meta: {
    fontSize: 11,
    color: '#5D6D7E',
    marginBottom: 2,
  },
  bodyText: {
    fontSize: 16,
    color: '#1C2833',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#1B4F72',
    backgroundColor: '#FFFFFF',
    elevation: 12,
  },
  input: {
    flex: 1,
    minHeight: 52,
    maxHeight: 110,
    borderWidth: 2,
    borderColor: '#1B4F72',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    color: '#1C2833',
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: '#1B4F72',
    minHeight: 52,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 12,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});