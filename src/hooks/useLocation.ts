import { useState, useEffect, useCallback } from 'react';

export const useLocation = () => {
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getLocation = useCallback((isManual = false) => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      setLoading(false);
      return;
    }

    setLoading(true);
    // No borramos el error anterior de inmediato si es manual para que el usuario vea el feedback
    if (!isManual) setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true, // Crucial para móviles
      timeout: 15000,           // Subimos a 15s porque algunos móviles tardan en conectar
      maximumAge: 0             // Forzamos ubicación fresca, no de caché
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        let msg = "Error desconocido";
        switch (err.code) {
          case 1: msg = "Permiso denegado. Activa la ubicación en los ajustes."; break;
          case 2: msg = "Ubicación no disponible. Revisa tu señal o GPS."; break;
          case 3: msg = "Tiempo de espera agotado. Reintenta."; break;
        }
        setError(msg);
        setLoading(false);
        
        // Si falla el automático por timeout, no bloqueamos la app, 
        // simplemente dejamos que el usuario use el buscador.
        console.error("Geolocation Error:", err);
      },
      options
    );
  }, []);

  // Intento automático inicial
  useEffect(() => {
    getLocation(false);
  }, [getLocation]);

  return { 
    coords, 
    error, 
    loading, 
    refresh: () => getLocation(true) // Función para el botón de GPS
  };
};