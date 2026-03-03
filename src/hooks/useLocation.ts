import { useState, useEffect, useCallback } from 'react';

export const useLocation = () => {
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true, // Fuerza el uso de GPS real
      timeout: 10000,           // Espera máximo 10 segundos
      maximumAge: 0             // No usa ubicaciones guardadas viejas
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        // Errores más descriptivos
        const messages: any = {
          1: "Permiso de ubicación denegado",
          2: "Ubicación no disponible (GPS apagado?)",
          3: "Tiempo de espera agotado"
        };
        setError(messages[err.code] || "Error desconocido al obtener ubicación");
        setLoading(false);
      },
      options
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Devolvemos también la función refresh por si queremos un botón de "Reintentar"
  return { coords, error, loading, refresh: getLocation };
};