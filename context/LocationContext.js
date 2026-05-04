import React, { createContext, useContext, useEffect, useState } from "react";
import * as Location from "expo-location";

// Create Context
const LocationContext = createContext();

// Provider Component
export const LocationProvider = ({ children }) => {
  const [geoCoords, setGeoCoords] = useState(null);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Ask for permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        setStatus(status);

        if (status !== "granted") {
          setErrorMsg("Location permission not granted");
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({});
        setGeoCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        setErrorMsg("Failed to get location");
      }
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ geoCoords, errorMsg, status }}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook
export const useLocation = () => useContext(LocationContext);
