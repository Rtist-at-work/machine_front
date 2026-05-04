import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";
import AppToast from "@/components/Toast";

export default function TabLayout() {
  const { setUserId } = useAppContext();
  const insets = useSafeAreaInsets(); // safe area insets

  useEffect(() => {
    const fetchUserId = async () => {
      const id =
        Platform.OS === "web"
          ? localStorage.getItem("userId")
          : await SecureStore.getItemAsync("userId");
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const AnimatedIcon = ({ name, focused }) => {
    const scale = useSharedValue(focused ? 1.1 : 1);
    const color = focused ? "#2095A2" : "gray";

    useEffect(() => {
      scale.value = withTiming(focused ? 1.1 : 1, { duration: 200 });
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View style={animatedStyle}>
        <FontAwesome name={name} size={26} color={color} />
      </Animated.View>
    );
  };

  return (
    <>
      <AppToast />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#2095A2",
          tabBarInactiveTintColor: "gray",
          tabBarHideOnKeyboard: true,
          tabBarStyle:
            Platform.OS === "web"
              ? { display: "none" } // 👈 hide tabs on web
              : {
                  height: 70 + insets.bottom,
                  paddingBottom: 10 + insets.bottom,
                },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
          },
          tabBarItemStyle: {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <AnimatedIcon name="home" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="HomePage"
          options={{
            title: "Mechanics",
            tabBarIcon: ({ focused }) => (
              <AnimatedIcon name="cogs" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ focused }) => (
              <AnimatedIcon name="user" focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
