import InputWOL from "@/components/InputWOL";
import MobileInput from "@/components/MobileInput";
import { useAppContext } from "@/context/AppContext";
import useApi from "@/hooks/useApi";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useCallback, useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Loading from "@/components/Loading";
import useScreenWidth from "../../hooks/useScreenWidth";
import Location from "./Location";
import SubCategoryList from "./SubCategoryList";
import { useRef } from "react";

// ✅ import libphonenumber-js
import { parsePhoneNumberFromString } from "libphonenumber-js";

const UserDetailsForm = ({
  onRequestClose,
  setStep,
  userDetails,
  setUserDetails,
  page,
  handleSubmit,
  fetchGeocodes,
}) => {
  const { isDesktop } = useScreenWidth();
  const { getJsonApi } = useApi();
  const {
    industrySuggestion,
    setIndustrySuggestion,
    focusedLabel,
    setFocusedLabel,
    isLoading,
    startLoading,
  } = useAppContext();
  const [states, setStates] = useState([]);
  const [passDisplay, setPassDisplay] = useState(false);
  const usernameRef = useRef(null);

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  // api function to fetch industry details
  const fetchIndustries = useCallback(() => {
    (async () => {
      try {
        const data = await getJsonApi(
          "signUp/getIndustry",
          "application/json",
          { secure: false }
        );
        if (data.status === 200) {
          setIndustrySuggestion(data?.data?.industries);
          setStates(data?.data?.states[1]?.districts);
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [getJsonApi]);

  useEffect(() => {
    fetchIndustries();
  }, []);

  // data updation
  const handleChange = useCallback((key, value, catIndex, subIndex) => {
    setUserDetails((prev) => {
      if (key === "industry") {
        return {
          ...prev,
          industry: value,
          subcategory: [{ name: "", services: [""] }],
        };
      }
      if (key === "category") {
        const updatedSub = [...prev.subcategory];
        updatedSub[catIndex] = {
          name: value,
          services: [""],
        };
        return { ...prev, subcategory: updatedSub };
      }
      if (key === "subcategory") {
        const updatedSub = [...prev.subcategory];
        const updatedServices = [...updatedSub[catIndex].services];
        updatedServices[subIndex] = value;
        updatedSub[catIndex] = {
          ...updatedSub[catIndex],
          services: updatedServices,
        };
        return { ...prev, subcategory: updatedSub };
      }
      if (key === "special") {
        const updatedServices = [...prev.services];
        updatedServices[updatedServices.length - 1] = value;
        return { ...prev, services: updatedServices };
      }
      return { ...prev, [key]: value };
    });
  }, []);

  // --- 🔥 Mobile Input Handling with libphonenumber-js ---
  const handleMobileInput = useCallback((text) => {
    let input = text.trim().replace(/\s+/g, "");
    try {
      const phoneNumber = parsePhoneNumberFromString(input);
      if (phoneNumber) {
        setUserDetails((prev) => ({
          ...prev,
          mobile: {
            countryCode: `+${phoneNumber.countryCallingCode}`,
            number: phoneNumber.nationalNumber,
          },
        }));
      } else {
        // fallback: just strip non-digits
        setUserDetails((prev) => ({
          ...prev,
          mobile: {
            ...prev.mobile,
            number: input.replace(/\D/g, ""),
          },
        }));
      }
    } catch (error) {
      setUserDetails((prev) => ({
        ...prev,
        mobile: {
          ...prev.mobile,
          number: input.replace(/\D/g, ""),
        },
      }));
    }
  }, []);

  return (
    <ScrollView
      className={`w-full ${
        page !== "profile" ? "h-full" : "h-[90%]"
      } bg-white rounded-md `}
      keyboardShouldPersistTaps="always"
    >
      <View style={{ height: "100%", width: "100%", paddingBottom: 20 }}>
        {/* Back Button */}
        {/* {page  && ( */}
        <View className="flex-row items-center mb-4">
          <Pressable
            onPress={() => (page !== "profile" ? setStep(0) : onRequestClose())}
            className="p-2 rounded-full bg-gray-100"
            android_ripple={{ color: "#ddd", borderless: true }}
          >
            <Ionicons name="arrow-back-outline" size={24} color="#0f766e" />
          </Pressable>
          <Text className="text-lg font-semibold text-gray-500 ml-2">
            {page !== "profile" ? "previous step" : " go back"}
          </Text>
        </View>
        {/* )} */}

        {/* Title */}
        {page === " profile" && (
          <Text className="text-xl md:text-2xl font-bold text-teal-600 text-center mb-4">
            Update Your Details
          </Text>
        )}

        {/* Username Input */}
        <InputWOL
          label="UserName"
          ref={usernameRef}
          placeholder="John Adam (must be Atleast 3 character)"
          value={userDetails?.username}
          max={20}
          onChangeText={(text) =>
            setUserDetails((prev) => ({ ...prev, username: text }))
          }
        />

        {userDetails?.role === "mechanic" && (
          <>
            <InputWOL
              placeholder="Aquila AutoMobiles"
              max={35}
              label="Organization Name"
              value={userDetails?.organization || ""}
              onChangeText={(value) => handleChange("organization", value)}
            />

            <View className="z-50">
              <SubCategoryList
                userDetails={userDetails}
                industrySuggestion={industrySuggestion}
                setUserDetails={setUserDetails}
                handleChange={handleChange}
              />
            </View>

            <View className="z-40">
              <Text
                className={`mt-5 text-base font-medium ${
                  focusedLabel === "service" ? "text-teal-600" : "text-gray-700"
                }`}
              >
                Specialization / Services (optional)
              </Text>

              <View className="w-full mt-4">
                <View className="flex items-end mb-4">
                  <Pressable
                    onPress={() =>
                      setUserDetails((prev) => ({
                        ...prev,
                        services: ["", ...prev.services],
                      }))
                    }
                    className="bg-gray-900 px-3 py-1.5 rounded-md"
                  >
                    <Text className="text-white text-xs">+ Add</Text>
                  </Pressable>
                </View>

                {userDetails?.services?.map((service, index) => (
                  <View key={index} className="relative w-full mb-2 h-12">
                    <TextInput
                      className={`w-full h-full px-4 border-2 rounded-md outline-none ${
                        focusedLabel === "service"
                          ? "border-teal-600"
                          : "border-gray-400"
                      }`}
                      placeholder="Enter service"
                      max={40}
                      value={service}
                      onChangeText={(text) =>
                        setUserDetails((prev) => {
                          const updated = [...prev.services];
                          updated[index] = text;
                          return { ...prev, services: updated };
                        })
                      }
                      onFocus={() => setFocusedLabel("service")}
                    />
                    <Pressable
                      onPress={() =>
                        setUserDetails((prev) => ({
                          ...prev,
                          services: prev.services.filter((_, i) => i !== index),
                        }))
                      }
                      className="absolute right-2 top-0 bottom-0 justify-center items-center w-8"
                    >
                      <Text className="text-red-500 text-lg font-bold">×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        <View className="z-40">
          <MobileInput
            setFocusedLabel={setFocusedLabel}
            focusedLabel={focusedLabel}
            userDetails={userDetails}
            onChangeText={(key, value) => {
              if (key === "number") {
                handleMobileInput(value);
              } else {
                setUserDetails((prev) => ({
                  ...prev,
                  mobile: {
                    ...prev.mobile,
                    [key]: value,
                  },
                }));
              }
            }}
          />
        </View>

        {page !== "profile" &&
          [
            {
              key: "password",
              label: "Password",
              placeholder: "Enter Your Password",
              value: userDetails?.password,
              error:
                (userDetails?.password?.length > 0 &&
                  userDetails?.password?.length < 8) ||
                userDetails?.password !== userDetails?.confirmPassword,
            },
            {
              key: "confirmPassword",
              label: "Confirm Password",
              placeholder: "Confirm Your Password",
              value: userDetails?.confirmPassword,
              error:
                (userDetails?.confirmPassword?.length > 0 &&
                  userDetails?.confirmPassword?.length < 8) ||
                userDetails?.confirmPassword !== userDetails?.password,
            },
          ].map((field) => (
            <View key={field.key}>
              <View key={field.key} className="relative ">
                <InputWOL
                  placeholder={field.placeholder}
                  label={field.label}
                  error={field.error}
                  value={field.value}
                  onChangeText={(value) => handleChange(field.key, value)}
                  secureTextEntry={!passDisplay}
                  onFocus={() => setFocusedLabel(field.key)}
                  onBlur={() => setFocusedLabel(null)}
                />
                <Ionicons
                  onPress={() => setPassDisplay(!passDisplay)}
                  name={passDisplay ? "eye" : "eye-off"}
                  size={20}
                  color="black"
                  className="absolute right-4 bottom-7"
                  style={{ zIndex: 9999 }}
                />
              </View>
              {focusedLabel === field.label && (
                <Text className="text-xs text-gray-500 ">
                  Minimum 8 characters required
                </Text>
              )}
            </View>
          ))}

        {userDetails?.role === "mechanic" && (
          <>
            <View className="mt-5 z-50">
              <Text className="text-lg font-semibold mb-2">
                Address Details
              </Text>

              {/* Manual Entry */}
              <Location
                states={states}
                userDetails={userDetails}
                setUserDetails={setUserDetails}
              />
            </View>

            <View className="-z-10">
              <InputWOL
                label="Street"
                placeholder={`Enter Street`}
                value={userDetails?.street}
                onChangeText={(value) =>
                  setUserDetails((prev) => ({ ...prev, street: value }))
                }
              />
              <InputWOL
                label="pincode"
                placeholder="Enter pincode"
                keyboardType="numeric"
                value={String(userDetails?.pincode ?? "")} // ✅ ensure string
                onChangeText={(value) =>
                  setUserDetails((prev) => ({
                    ...prev,
                    pincode: value.replace(/[^0-9]/g, ""),
                  }))
                }
              />
            </View>
          </>
        )}

        {page === " profile " && (
          <Pressable className="bg-teal-600 py-4 rounded-lg items-center mt-20 mb-4">
            <Text className="text-white text-lg font-bold">Update</Text>
          </Pressable>
        )}

        <Pressable
          disabled={isLoading}
          onPress={async () => {
            startLoading();

            let data = { ...userDetails };

            if (userDetails.role === "mechanic") {
              const address = `${userDetails.city}, ${userDetails.region}, ${userDetails.pincode}, ${userDetails.country}`;
              const coords = await fetchGeocodes(address); // get lat/lon
              data = {
                ...data,
                lat: coords?.latitude,
                lon: coords?.longitude,
              };
            }

            // handleSubmit is called in all cases
            handleSubmit(data);
          }}
          className={`h-12 -z-10 bg-TealGreen items-center justify-center px-4 mx-auto mt-24 rounded-md overflow-hidden ${
            isDesktop ? "w-[75%]" : "w-full"
          } ${isLoading ? "opacity-50" : ""}`}
        >
          {isLoading ? (
            <Loading bgColor="#2095A2" gearColor="#ffffffff" />
          ) : (
            <Text className="text-white text-center font-semibold">
              {page === "profile" ? "Update" : "Register"}
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default UserDetailsForm;
