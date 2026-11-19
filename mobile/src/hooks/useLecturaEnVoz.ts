import { useCallback, useEffect, useState } from 'react';
import * as Speech from 'expo-speech';

const IDIOMA = 'es-ES';

/**
 * HU05: lectura en voz alta de las instrucciones con el TTS del dispositivo.
 * Se detiene sola al salir de la pantalla.
 */
export function useLecturaEnVoz() {
  const [leyendo, setLeyendo] = useState(false);
  const [error, setError] = useState(false);

  const detener = useCallback(() => {
    Speech.stop();
    setLeyendo(false);
  }, []);

  const leer = useCallback((pasos: string[]) => {
    if (pasos.length === 0) return;
    Speech.stop();
    setError(false);
    setLeyendo(true);
    const texto = pasos.map((paso, i) => `Paso ${i + 1}. ${paso}`).join('. ');
    Speech.speak(texto, {
      language: IDIOMA,
      rate: 0.95,
      onDone: () => setLeyendo(false),
      onStopped: () => setLeyendo(false),
      onError: () => {
        setLeyendo(false);
        setError(true);
      },
    });
  }, []);

  const alternar = useCallback(
    (pasos: string[]) => (leyendo ? detener() : leer(pasos)),
    [leyendo, leer, detener]
  );

  useEffect(() => () => Speech.stop(), []);

  return { leyendo, error, leer, detener, alternar };
}
