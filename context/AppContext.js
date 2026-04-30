// context/AppContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import io from "socket.io-client";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState();
  // const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [industrySuggestion, setIndustrySuggestion] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedLabel, setFocusedLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);
  const [revies, setReviews] = useState([]);
  const [filterData, setFIlterData] = useState({});

  // const [qr, setQr] = useState(true);

  const [socket, setSocket] = useState(null);

  let newSocket;
  const socketInit = async () => {
    try {
      let storedToken;
      let storedUserId;
      let storedUserRole;

      if (Platform.OS === "web") {
        storedUserId = localStorage.getItem("userId");
        storedUserRole = localStorage.getItem("role");
        // storedToken = localStorage.getItem("token"); // add this
      } else {
        storedUserId = await SecureStore.getItemAsync("userId");
        storedUserRole = await SecureStore.getItemAsync("role");
        storedToken = await SecureStore.getItemAsync("token"); // add this
      }

      setUserId(storedUserId);
      setUserRole(storedUserRole);
      // setToken(storedToken);

      // ✅ initialize socket
      newSocket = io(
        "https://api.machinestreets.com",
        // "http://192.168.1.8:5000",
        {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          autoConnect: true,
          upgrade: true,
          multiplex: true,
          path: "/socket.io",
          ...(Platform.OS === "web"
            ? { withCredentials: true }
            : { query: { token: storedToken } }),
        }
      );

      newSocket.on("connect_error", (err) => {
        console.log("Socket connect_error:", err);
      });

      // // likes updation
      newSocket.on("comment-update", (updatedPost) => {
        console.log("updated comment :", updatedPost);
        setSelectedMechanic((prev) =>
          prev
            ? {
                ...prev,
                posts: prev.posts.map((p) =>
                  p._id === updatedPost._id ? updatedPost : p
                ),
              }
            : prev
        );
      });

      // coments updation

      newSocket.on("post-update", (data, type) => {
        setSelectedMechanic((prev) => ({
          ...prev,
          [type]: data[type],
        }));
      });

      // delete updation

      newSocket.on("post-delete", (updatedUser) => {
        setSelectedMechanic((prev) => ({
          ...prev,
          posts: updatedUser.posts,
        }));
      });

      // review updation

      newSocket.on("update-review", (updatedUser) => {
        setUserDetails((prev) =>
          prev.map((mech) => {
            if (mech._id === updatedUser._id) {
              return {
                ...mech,
                reviews: updatedUser.reviews,
                averageRating: updatedUser.averageRating,
              };
            }
            return mech;
          })
        );
        setSelectedMechanic((prev) => ({
          ...prev,
          reviews: updatedUser.reviews,
        }));
      });

      setSocket(newSocket);
    } catch (err) {
      console.error("Socket init error:", err);
    }
  };

  useEffect(() => {
    socketInit();

    // ✅ cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.off("likes-update");
        newSocket.disconnect();
      }
    };
  }, []);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        // token,
        // setToken,
        userName,
        setUserName,
        industrySuggestion,
        setIndustrySuggestion,
        isFocused,
        setIsFocused,
        focusedLabel,
        setFocusedLabel,
        isLoading,
        startLoading,
        stopLoading,
        userDetails,
        setUserDetails,
        selectedMechanic,
        setSelectedMechanic,
        revies,
        setReviews,
        socket,
        userId,
        setUserId,
        filterData,
        setFIlterData,
        socketInit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
