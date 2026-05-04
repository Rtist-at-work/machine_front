import React from "react";
import ToastManager from "toastify-react-native";
import { View, Text, StyleSheet } from "react-native";

const toastConfig = {
  success: (props) => (
    <View style={[styles.toast, { backgroundColor: "#4CAF50" }]}>
      <Text style={styles.title}>{props.text1}</Text>
      {props.text2 && <Text style={styles.subtitle}>{props.text2}</Text>}
    </View>
  ),

  error: (props) => (
    <View style={[styles.toast, { backgroundColor: "#F44336" }]}>
      <Text style={styles.title}>{props.text1}</Text>
      {props.text2 && <Text style={styles.subtitle}>{props.text2}</Text>}
    </View>
  ),

  info: (props) => (
    <View style={[styles.toast, { backgroundColor: "#2196F3" }]}>
      <Text style={styles.title}>{props.text1}</Text>
      {props.text2 && <Text style={styles.subtitle}>{props.text2}</Text>}
    </View>
  ),
};

const AppToast = () => {
  return <ToastManager config={toastConfig} />;
};

export default AppToast;

const styles = StyleSheet.create({
  toast: {
    padding: 16,
    borderRadius: 12,
    maxWidth: 400,
    alignSelf: "center",

    // 🔥 helps overlay better
    position: "absolute",
    top: 60,
    zIndex: 99999,
    elevation: 99999,
  },
  title: {
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    color: "white",
    marginTop: 4,
  },
});