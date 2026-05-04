import {
  View,
  Platform,
  Text,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useScreenWidth from "@/hooks/useScreenWidth";
import { useCallback, useState } from "react";
import InputWOL from "@/components/InputWOL";
import ForgotPassword from "./Login/ForgotPassword";
import  { Toast } from "toastify-react-native";
import useApi from "@/hooks/useApi";
import * as SecureStore from "expo-secure-store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import ResetPassword from "./Profile/ResetPassword";
import AppToast from "@/components/Toast";

const Login = () => {
  const { postJsonApi, patchApi } = useApi();
  const { isTablet, isDesktop } = useScreenWidth();
  const [showForgot, setShowForgot] = useState(false);
  const [passDisplay, setPassDisplay] = useState(false);
  const [step, setStep] = useState(0);
  const [userDetails, setUserDetails] = useState({
    mobile: "",
    otp: "",
    userId: null,
  });
  const { isLoading } = useAppContext();


  // login form submit
  const Loginbtn = useCallback(async (e) => {
    if (!userDetails.mobile || !userDetails.password) {
      Toast.error(
        `Please enter ${!userDetails.mobile ? "Mobile number" : "Password"}`,
        { duration: 2000, position: "top" }
      );
      return;
    }

    try {
      const response = await postJsonApi(
        `login`,
        {
          mobile: userDetails.mobile,
          password: userDetails.password,
        },
        "application/json",
        { secure: false }
      );

      if (response && response.status === 200) {
        if (Platform.OS !== "web") {
          await SecureStore.setItemAsync("token", response?.data?.token);
          await SecureStore.setItemAsync("role", response?.data?.role);
          await SecureStore.setItemAsync("userId", response?.data?.userId);
        } else {
          localStorage.setItem("role", response?.data?.role);
          localStorage.setItem("userId", response?.data?.userId);
        }
        setTimeout(() => {
          router.replace("/(tabs)/HomePage");
        }, 2000);
      }
    } catch (error) {
      Toast.error("Login failed. Please try again.", {
        duration: 2000,
        position: "top",
      });
    }
  });

  // passwordReset

  const handlePasswordReset = useCallback(async (password) => {
   if(userDetails.userId === '' || userDetails.userId===null) return;
    try {
      const result = await patchApi(
        "api/forgotPassword",
        { password: password, id: userDetails?.userId, page: "login" },
        "application/json",
        { secure: false }
      );
      if (result?.status === 200) {
        setStep(0);
        setShowForgot(false);
      }
    } catch (err) {
      console.log('err :', err);
    }
  }, [userDetails]);

  const handleSubmit = useCallback(async () => {
    const API = step === 0 ? `signUp/sendOtp` : `login/otpverification`;
    try {
      const response = await postJsonApi(
        API,
        { userDetails, page: "login", otp: userDetails.otp },
        "application/json",
        { secure: false }
      );
      if (response && response.status === 200) {
        if (step === 0)
          setUserDetails((prev) => ({
            ...prev,
            userId: response?.data?.userId,
          }));
        setStep((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Invalid Data:", error);
    }
  }, [postJsonApi, userDetails, setStep]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 bg-gray-100 w-screen">
        <AppToast/>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            className={`bg-white rounded-md mx-auto my-auto ${
              Platform.OS === "web" && isDesktop
                ? "flex-row w-[800px] "
                : "flex-col w-[90%]"
            }`}
            style={{ height: Platform.OS === "web" ? 600 : "" }}
          >
            {/* left side UI (only web desktop) */}
            {Platform.OS === "web" && isDesktop && (
              <View className="bg-teal-600 w-[40%] h-full p-5 rounded-tl-md rounded-bl-md flex items-center">
                <View className="shadow-md p-5">
                  <Text className="text-2xl font-bold mt-5 ml-3 text-white">
                    Log In
                  </Text>
                  <Text className="mt-8 text-base font-medium ml-3 leading-6 text-white">
                    Get access to your{" "}
                    <Text className="font-semibold">
                      Orders, Wishlist, and Recommendations.
                    </Text>
                  </Text>
                </View>
              </View>
            )}

            {/* right side UI */}
            <View
              className={`${
                Platform.OS === "web" && isDesktop ? "w-[60%]" : "w-full"
              } p-5 py-8`}
            >
              {!showForgot ? (
                <>
                  <Text
                    className={`font-bold mx-auto text-TealGreen mb-6 ${
                      isTablet ? "text-xl" : "text-2xl"
                    }`}
                  >
                    Log In to your account
                  </Text>

                  <InputWOL
                    label="Mobile"
                    placeholder="Enter Your Registered Mobile number"
                    value={userDetails?.mobile}
                    onChangeText={(text) =>
                      setUserDetails((prev) => ({ ...prev, mobile: text }))
                    }
                  />

                  <View className="relative">
                    <InputWOL
                      placeholder="Enter Your Password"
                      label="Password"
                      value={userDetails?.password}
                      onChangeText={(text) =>
                        setUserDetails((prev) => ({ ...prev, password: text }))
                      }
                      secureTextEntry={!passDisplay}
                    />
                    <FontAwesome
                      onPress={() => setPassDisplay(!passDisplay)}
                      name={passDisplay ? "eye" : "eye-slash"}
                      size={18}
                      color="black"
                      className="absolute right-4 bottom-7 cursor-pointer"
                      style={{ zIndex: 9999 }}
                    />
                  </View>

                  {/* Forgot Password */}
                  <View className="w-full mt-8 flex items-end">
                    <Pressable onPress={() => setShowForgot(true)}>
                      <Text className="text-blue-600 font-medium underline">
                        Forgot Password?
                      </Text>
                    </Pressable>
                  </View>

                  {/* Login Button */}
                  <Pressable
                    onPress={Loginbtn}
                    className="bg-TealGreen mb-4 px-4 mx-auto rounded-md w-full mt-8 h-12"
                  >
                    {isLoading ? (
                      <Loading />
                    ) : (
                      <Text className="text-white m-auto font-bold">
                        Log In
                      </Text>
                    )}
                  </Pressable>

                  <Text className="font-semibold text-center mt-2 mb-2">
                    New to Machine Streets?
                  </Text>

                  <Pressable
                    onPress={() => router.replace("/SignUp")}
                    className="bg-TealGreen mb-4 py-4 px-4 mx-auto rounded-md w-full mt-2"
                  >
                    <Text className="text-white m-auto font-bold">Sign Up</Text>
                  </Pressable>
                </>
              ) : step !== 2 ? (
                <ForgotPassword
                  handleSubmit={handleSubmit}
                  userDetails={userDetails}
                  setUserDetails={setUserDetails}
                  setShowForgot={setShowForgot}
                  postJsonApi={postJsonApi}
                  step={step}
                  placehoders={[
                    "Enter Your registered Mobile Number",
                    "Enter Your One Time Password",
                  ]}
                  setStep={setStep}
                />
              ) : (
                <ResetPassword handlePasswordReset={handlePasswordReset} />
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
export default Login;

