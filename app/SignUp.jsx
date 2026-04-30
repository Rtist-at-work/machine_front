import { useAppContext } from "@/context/AppContext";
import locationAccess from "@/hooks/Loaction.access";
import useApi from "@/hooks/useApi";
import useScreenWidth from "@/hooks/useScreenWidth";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native"; // ✅ replaced
import OtpScreen from "./SignUp/OtpScreen";
import RoleSelection from "./SignUp/RoleSelction";
import UserDetailsForm from "./SignUp/UserDetailsForm";
import LottieView from "lottie-react-native";
import welcomeAnimation from "../assets/animations/welocme.json";
import FadeSlideView from "@/components/FadeSlideView";
import * as SecureStore from "expo-secure-store";
import { useLocation } from "@/context/LocationContext";
import * as Location from "expo-location";
import PermissionModal from "./SignUp/PermissionModal";

// const { width, height } = Dimensions.get("window");

const SignUp = () => {
  const { isDesktop, isTablet, isMobile } = useScreenWidth();
  const { isLoading, stopLoading } = useAppContext();
  const { postJsonApi } = useApi();
  const { status } = useLocation();

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [step, setStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false); // ✅ for animation
  const [userDetails, setUserDetails] = useState({
    username: "",
    role: "",
    password: "",
    confirmPassword: "",
    organization: "",
    industry: "",
    services: [""],
    subcategory: [{ name: "", services: [""] }],
    mobile: {
      number: "",
      countryCode: "+91",
    },
    lat: "",
    lon: "",
    country: "India",
    region: "",
    city: "",
    street: "",
    pincode: "",
  });

  // useEffect(() => {
  //   // locationAccess(setUserDetails);
  //   if (status === "granted") {
  //     setUserDetails((prev) => ({
  //       ...prev,
  //       lat: geoCoords.latitude,
  //       lon: geoCoords.longitude,
  //     }));
  //   }
  // }, [geoCoords]);

  // validation check

  const checkEmptyFields = useCallback(() => {
    const { role, username, password, confirmPassword } = userDetails;

    for (const key in userDetails) {
      const value = userDetails[key];

      // ✅ skip optional fields
      if (["lat", "lon"].includes(key)) continue;

      if (typeof value === "string" && !value.trim()) {
        if (
          (role === "recruiter" &&
            !["password", "confirmPassword"].includes(key)) ||
          (userDetails.country.toLowerCase().trim() !== "india" &&
            !userDetails.city)
        )
          continue;

        showError(key);
        return false;
      }

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        for (const innerKey in value) {
          const innerValue = value[innerKey];

          if (typeof innerValue === "string" && !innerValue.trim()) {
            if (
              role === "recruiter" &&
              key !== "mobile" &&
              !["number", "countryCode"].includes(innerKey)
            )
              continue;

            showError(innerKey, key);
            return false;
          }
        }
      }

      if (role === "mechanic" && Array.isArray(value)) {
        if (value.some((val) => typeof val === "string" && !val.trim())) {
          showError(key, null, true);
          return false;
        }
      }
    }

    if (username.trim().length > 0 && username.trim().length < 3) {
      showError(null, null, false, "Username must be at least 3 characters");
      return false;
    }

    if (password.length > 0 && password.length < 8) {
      showError(null, null, false, "Password must be at least 8 characters");
      return false;
    }

    if (confirmPassword.length > 0 && password !== confirmPassword) {
      showError(
        null,
        null,
        false,
        "Password and Confirm Password didn't match"
      );
      return false;
    }

    return true;
  }, [userDetails]);

  const showError = useCallback(
    (field, parent = null, isArray = false, customMsg = null) => {
      Toast.error(
        customMsg ||
          (parent
            ? `${field} is required in ${parent}.`
            : isArray
            ? `${field} has empty values.`
            : `${field} is required.`),
        {
          duration: 3000,
          position: "top",
        }
      );
    },
    []
  );
  const fetchCoordinatesWeb = async (address) => {
    const res = await fetch(
      `https://api.machinestreets.com/api/geocode?address=${encodeURIComponent(
        address
      )}`
    );
    const data = await res.json();

    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  };

  // Main function
  const fetchGeocodes = useCallback(async (address) => {
    try {
      if (Platform.OS === "web") {
        const webCoords = await fetchCoordinatesWeb(address);
        if (webCoords) {
          setUserDetails((prev) => ({
            ...prev,
            lat: webCoords.latitude,
            lon: webCoords.longitude,
          }));
          return webCoords; // ✅ return so caller knows it's ready
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access location was denied");
          return null;
        }
        const location = await Location.geocodeAsync(address);

        if (location.length > 0) {
          setUserDetails((prev) => ({
            ...prev,
            lat: location[0].latitude,
            lon: location[0].longitude,
          }));
          return {
            latitude: location[0].latitude,
            longitude: location[0].longitude,
          };
        }
      }
    } catch (error) {
      console.error("Geocode fetch failed:", error);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!checkEmptyFields()) {
      stopLoading();
      return;
    }
    try {
      const result = await postJsonApi(
        "signUp/sendOtp",
        {
          userDetails,
          page: "signup",
        },
        "application/json",
        { secure: false }
      );

      if (result.status === 200) {
        setStep(2);
      }
    } catch (err) {
      console.log(err);
    }
  });

  const register = useCallback(async () => {
    if (!otp || !userDetails) {
      Toast.error("Something went wrong.", { duration: 3000, position: "top" });
      return "";
    }

    try {
      const result = await postJsonApi(
        "signup/register",
        {
          otp: otp.join(""),
          userDetails,
        },
        "application/json",
        { secure: false }
      );

      if (result.status === 200 || 201) {
        // setShowWelcome(true);
        if (Platform.OS !== "web") {
          await SecureStore.setItemAsync("token", result?.data?.token);
          await SecureStore.setItemAsync("role", result?.data?.role);
          await SecureStore.setItemAsync("userId", result?.data?.userId);
        } else {
          localStorage.setItem("role", result?.data?.role);
          localStorage.setItem("userId", result?.data?.userId);
        }
        setTimeout(() => {
          router.replace("/(tabs)/HomePage");
        }, 0);
      }
    } catch (err) {
      console.log(err);
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#f3f4f6",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 20,
        }}
      >
        {status !== "granted" && Platform.OS !== "web" ? (
          <PermissionModal />
        ) : null}

        {showWelcome ? (
          // ✅ Responsive Welcome Animation Screen
          <View className="h-full w-full bg-white">
            <View className="flex-1 w-full items-center justify-center flex gap-2">
              <Text
                className={`text-4xl font-extrabold text-TealGreen tracking-wide text-center px-2`}
              >
                Welcome
              </Text>
              <Text
                className={`text-4xl  font-extrabold text-TealGreen tracking-wide text-center px-2`}
              >
                {userDetails?.username || "User"}!
              </Text>
            </View>

            <View
              className={`h-[80%] w-full overflow-hidden ${
                isDesktop ? "flex-row" : "flex-col"
              }`}
            >
              {/* Animation */}
              <View
                className={`${
                  isDesktop ? "h-full w-[50%]" : "h-[60%] w-full"
                } justify-center`}
              >
                <LottieView
                  source={welcomeAnimation}
                  autoPlay={true}
                  loop={true}
                  style={{ width: "90%", height: "100%" }}
                />
              </View>

              {/* Text Section */}
              <View
                className={`${
                  isDesktop ? "h-full w-[50%]" : "flex-1 w-full"
                } items-center justify-center px-6`}
              >
                <FadeSlideView>
                  <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
                    {userDetails?.role === "mechanic"
                      ? "🚀 Grow Your Business"
                      : userDetails?.role === "recruiter"
                      ? "🔍 Find the Right Talent"
                      : "✨ Let’s Get Started"}
                  </Text>

                  <Text className="text-lg font-medium text-gray-600 text-center leading-relaxed">
                    {userDetails?.role === "mechanic"
                      ? "Expand your reach, manage clients with ease, and boost your success."
                      : userDetails?.role === "recruiter"
                      ? "Connect with skilled mechanics faster and simplify your hiring process."
                      : "Explore all the tools you need to achieve your goals today."}
                  </Text>
                </FadeSlideView>
              </View>
            </View>
          </View>
        ) : (
          // Existing Signup UI
          <View
            style={{
              flexDirection:
                Platform.OS === "web" && isDesktop ? "row" : "column",
              width: Platform.OS === "web" && isDesktop ? 800 : "90%",
              backgroundColor: "#f3f4f6",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {Platform.OS === "web" && isDesktop && (
              <View
                className="shadow-lg"
                style={{
                  width: "40%",
                  backgroundColor: "#0d9488",
                  padding: 20,
                  justifyContent: "center",
                }}
              >
                <View className="shadow-lg p-4">
                  <Text
                    style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}
                  >
                    Sign Up
                  </Text>
                  <Text style={{ marginTop: 16, fontSize: 16, color: "#fff" }}>
                    Get access to your
                    <Text style={{ fontWeight: "600" }}>
                      {" "}
                      Orders, Wishlist,
                    </Text>{" "}
                    and
                    <Text style={{ fontWeight: "600" }}> Recommendations.</Text>
                  </Text>
                </View>
              </View>
            )}

            <View
              style={{
                width: Platform.OS === "web" && isDesktop ? "60%" : "100%",
                height: Platform.OS === "web" ? 600 : "",
                backgroundColor: isMobile ? (step === 2 ? "" : "#fff") : "#fff",
                justifyContent: "center",
                alignItems: "center",
                padding: isMobile ? (step === 2 ? 2 : 20) : 20,
              }}
            >
              {step === 0 && (
                <RoleSelection
                  isLoading={isLoading}
                  isDesktop={isDesktop}
                  userDetails={userDetails}
                  setUserDetails={setUserDetails}
                  setStep={setStep}
                />
              )}
              {step === 1 && (
                <UserDetailsForm
                  role={userDetails?.role}
                  setStep={setStep}
                  userDetails={userDetails}
                  setUserDetails={setUserDetails}
                  isDesktop={isDesktop}
                  isTablet={isTablet}
                  handleSubmit={handleSubmit}
                  fetchGeocodes={fetchGeocodes}
                />
              )}
              {step === 2 && (
                <OtpScreen
                  isLoading={isLoading}
                  isTablet={isTablet}
                  register={register}
                  otp={otp}
                  setOtp={setOtp}
                  handleSubmit={handleSubmit}
                  setStep={setStep}
                  isDesktop={isDesktop}
                />
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
