import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  Image,
  Linking,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import qrImage from "../../assets/qr.png";

const QrModal = ({ visible, onClose, getItem }) => {
  const { width } = useWindowDimensions();
  const modalWidth = Platform.OS === "web" && width >= 1024 ? "50%" : "90%";

  return (
    <Modal visible={visible} transparent statusBarTranslucent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { width: modalWidth }]}>
          <Pressable style={styles.closeIcon} onPress={onClose} className="outline-none">
          <AntDesign name="close-circle" size={24} color="red" />
          </Pressable>
          <Text style={styles.title}>Generate Your Business Qr</Text>

          <Image source={qrImage} style={styles.qrIcon} />

          <Text
            style={styles.link}
            onPress={async () => {
              const userId = await getItem("userId");
              // const url = `http://127.0.0.1:5500/index.html?user=${userId}`;
              const url = `https://faceqrapp.netlify.app/?user=${userId}`;
              Linking.openURL(url);
            }}
          >
            Click Here
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
  },
  qrIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
    borderRadius: 12,
    resizeMode: "contain",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  link: {
    color: "#1e90ff",
    textDecorationLine: "underline",
    fontSize: 16,
    marginBottom: 10,
  },
});

export default QrModal;
