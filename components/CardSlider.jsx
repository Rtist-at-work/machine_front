import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Image } from "react-native";

import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

export default function CardSlider({ userDetails,onClose }) {
  const cards = useMemo(() => {
    return userDetails?.businessCards || [];
  }, [userDetails]);

  const [index, setIndex] = useState(0);
  const animatedIndex = useSharedValue(0);

  const { width } = useWindowDimensions();
  const isAndroid = Platform.OS === "android";
  const isTabletOrDesktop = width >= 768;
  const isMobile = width < 768;

  const MAX_DESKTOP_WIDTH = 600;

  const cardWidth = isMobile
    ? width * 0.9
    : Math.min(width * 0.6, MAX_DESKTOP_WIDTH);

  const cardHeight = cardWidth * (9 / 16);

  const animateTo = (newIndex) => {
    animatedIndex.value = withTiming(newIndex, { duration: 350 });
    setIndex(newIndex);
  };

  const goUp = () => {
    const next = Math.max(index - 1, 0);
    if (next !== index) animateTo(next);
  };

  const goDown = () => {
    const next = Math.min(index + 1, cards.length - 1);
    if (next !== index) animateTo(next);
  };

  const downloadImage = async () => {
    try {
      if (!cards[index]) return;

      const imageUrl = `https://api.machinestreets.com/api/mediaDownload/${cards[index]}`;

      // ✅ WEB DOWNLOAD
      if (Platform.OS === "web") {
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `card_${Date.now()}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);
        return;
      }

      // ✅ MOBILE DOWNLOAD (Android / iOS)
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required to save image");
        return;
      }

      const fileUri = FileSystem.cacheDirectory + `card_${Date.now()}.png`;

      const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);

      await MediaLibrary.saveToLibraryAsync(uri);

      Alert.alert("Success", "Image saved to gallery");
    } catch (error) {
      console.log("Download error:", error);
      Alert.alert("Error", "Failed to download image");
    }
  };

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
      {isMobile && (
        <Pressable onPress={goUp} style={styles.mobileTopArrow}>
          <View style={styles.arrowUp} />
        </Pressable>
      )}

      <View
        style={[
          styles.sliderArea,
          { height: cardHeight * 1.6 }, // ⬅ increased container height
        ]}
      >
        {cards.map((card, i) => {
          const style = useAnimatedStyle(() => {
            const position = i - animatedIndex.value;

            // 🔥 INCREASED GAP
            const translateY = interpolate(
              position,
              [-2, -1, 0, 1, 2],
              [
                -cardHeight * 1.1,
                -cardHeight * 0.7,
                0,
                cardHeight * 0.7,
                cardHeight * 1.1,
              ],
            );

            // 🔥 STRONGER SCALE DEPTH
            const scale = interpolate(
              position,
              [-2, -1, 0, 1, 2],
              [0.85, 0.93, 1, 0.93, 0.85],
            );

            // 🔥 STRONGER ROTATION
            const rotate = interpolate(
              position,
              [-2, -1, 0, 1, 2],
              [-12, -6, 0, 6, 12],
            );

            const opacity = interpolate(
              position,
              [-2, -1, 0, 1, 2],
              [0.4, 0.7, 1, 0.7, 0.4],
            );

            return {
              transform: [
                { translateY },
                { scale },
                { rotate: `${rotate}deg` },
              ],
              opacity,
              zIndex: cards.length - Math.abs(i - index),
              elevation: isAndroid ? cards.length - Math.abs(i - index) : 0,
            };
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.card,
                { width: cardWidth, height: cardHeight },
                style,
              ]}
            >
              <Image
                source={{
                  uri: `https://api.machinestreets.com/api/mediaDownload/${card}`,
                }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </Animated.View>
          );
        })}
      </View>

      {isMobile && (
        <Pressable onPress={goDown} style={styles.mobileBottomArrow}>
          <View style={styles.arrowDown} />
        </Pressable>
      )}

      {isTabletOrDesktop && (
        <View style={styles.desktopArrows}>
          <Pressable onPress={goUp} style={styles.arrow}>
            <View style={styles.arrowUp} />
          </Pressable>
          <Pressable onPress={goDown} style={styles.arrow}>
            <View style={styles.arrowDown} />
          </Pressable>
        </View>
      )}

      <Pressable style={styles.downloadButton} onPress={downloadImage}>
        <Text style={styles.downloadText}>Download Card</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
  position: "absolute",
  top: 20,
  right: 10,
  zIndex: 999,
  backgroundColor: "rgba(0,0,0,0.6)",
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
},

closeText: {
  color: "white",
  fontSize: 20,
  fontWeight: "bold",
},
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  sliderArea: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  card: {
    position: "absolute",
    borderRadius: 20,
    overflow: "hidden",
  },
  desktopArrows: {
    position: "absolute",
    right: 40,
    top: "50%",
    transform: [{ translateY: -40 }],
    alignItems: "center",
  },
  arrow: {
    padding: 15,
  },
  downloadButton: {
    marginTop: 30,
    backgroundColor: "#0ea5e9",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  downloadText: {
    color: "white",
    fontWeight: "bold",
  },
  mobileTopArrow: { marginBottom: 10 },
  mobileBottomArrow: { marginTop: 10 },
  arrowUp: {
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "white",
    transform: [{ rotate: "-45deg" }],
  },
  arrowDown: {
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "white",
    transform: [{ rotate: "-45deg" }],
  },
});
