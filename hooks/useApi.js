import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { Toast } from "toastify-react-native"; // ✅ replaced

const useApi = () => {
  //  const API_URL =
  //   Platform.OS === "web"
  //     ? "http://localhost:5000"
  //     : "http://192.168.1.8:5000";
  const API_URL = "https://api.machinestreets.com";
  const { startLoading, stopLoading } = useAppContext();

  const handleRequest = async (request) => {
    try {
      startLoading();
      const response = await request();
      const successMessage = response?.data?.message || response?.data;
      const description = response?.data?.description || response?.data;

      if (successMessage && typeof successMessage === "string") {
        stopLoading();
        Toast.success(successMessage, {
          description,
          duration: 3000,
          position: "top",
        });
      }
      return response;
    } catch (err) {
      if (err?.response?.status === 401) {
        router.replace("/SignUp");
      }

      console.log("err :", err);
      const errorMessage =
        err.response?.data?.message ||
        "server error";

      const description =
        err.response?.data?.description ||
        "Please try agin later";

      if (errorMessage && typeof errorMessage === "string") {
        Toast.error(errorMessage, {
          description,
          duration: 3000,
          position: "top",
        });
      }

      return null;
    } finally {
      stopLoading();
    }
  };

  const getHeader = async (contentType, secure) => {
    let token = null;
    if (secure && Platform.OS !== "web") {
      token = await SecureStore.getItemAsync("token");
    }

    return {
      "Content-Type": contentType,
      Accept: "application/json",
      ...(secure && token && { Authorization: `Bearer ${token}` }),
    };
  };

  const GETAPI = async (path, contentType, { secure }) =>
    handleRequest(async () =>
      axios.get(`${API_URL}/${path}`, {
        headers: await getHeader(contentType, secure),
        withCredentials: Platform.OS === "web",
      })
    );

  const POSTAPI = async (path, data, contentType, { secure }) =>
    handleRequest(async () =>
      axios.post(`${API_URL}/${path}`, data, {
        headers: await getHeader(contentType, secure),
        withCredentials: Platform.OS === "web",
      })
    );

  const PATCHAPI = async (path, data, contentType, { secure }) =>
    handleRequest(async () =>
      axios.patch(`${API_URL}/${path}`, data, {
        headers: await getHeader(contentType, secure),
        withCredentials: Platform.OS === "web",
      })
    );

  const DELETEAPI = async (path, data, contentType, { secure }) =>
    handleRequest(async () =>
      axios.delete(`${API_URL}/${path}`, {
        headers: await getHeader(contentType, secure),
        withCredentials: Platform.OS === "web",
        data,
      })
    );

  return {
    getJsonApi: (path, contentType, secure) =>
      GETAPI(path, contentType, secure),
    postJsonApi: (path, data, contentType, secure) =>
      POSTAPI(path, data, contentType, secure),
    patchApi: (path, data, contentType, secure) =>
      PATCHAPI(path, data, contentType, secure),
    deleteApi: (path, data, contentType, secure) =>
      DELETEAPI(path, data, contentType, secure),
  };
};

export default useApi;
