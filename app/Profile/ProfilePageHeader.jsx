import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import EditIcon from "./EditIcon";

const { width } = Dimensions.get("window");

const ProfilePageHeader = ({
  selectedMechanic,
  type,
  isMobile,
  upload,
  setUploadType,
  setModal,
  setFollowingModal,
}) => {
  const profileSize = isMobile ? 130 : 200;

  // Responsive sizes
  const usernameFontSize = width < 400 ? 18 : width < 768 ? 22 : 28;
  const settingsIconSize = width < 400 ? 20 : width < 768 ? 24 : 28;

  return (
    <View className="bg-gray-100 mb-8">
      {/* Back Button */}
      <View className="w-full h-12 justify-center bg-white z-50">
        <Pressable
          onPress={() => router.push("/(tabs)/HomePage")}
          className="px-4"
        >
          <Feather name="arrow-left" size={24} color="grey" />
        </Pressable>
      </View>

      {/* Banner */}
      <View className="relative w-full" style={{ aspectRatio: 21 / 9 }}>
        {selectedMechanic?.banner ? (
          <Image
            source={{
              uri: `https://api.machinestreets.com/api/mediaDownload/${selectedMechanic?.banner}`,
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 bg-TealGreen" />
        )}

        {type !== "user_visit" && (
          <EditIcon
            isMobile={isMobile}
            upload={upload}
            setUploadType={setUploadType}
            type="banner"
          />
        )}
      </View>

      {/* Profile Section */}
      <View className="px-5">
        <View className="flex-row items-end">
          {/* Profile Image */}
          <View
            style={{
              width: profileSize,
              height: profileSize,
              borderRadius: profileSize / 2,
              marginTop: -profileSize / 2,
              borderWidth: 3,
              borderColor: "white",
            }}
            className="bg-white overflow-hidden justify-center items-center"
          >
            {selectedMechanic?.profileImage ? (
              <Image
                source={{
                  uri: `https://api.machinestreets.com/api/mediaDownload/${selectedMechanic?.profileImage}`,
                }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <FontAwesome name="user" size={60} color="#2095A2" />
            )}

            {type !== "user_visit" && (
              <EditIcon
                isMobile={isMobile}
                upload={upload}
                setUploadType={setUploadType}
                type="profileImage"
              />
            )}
          </View>

          {/* Right Side */}
          <View
            className={`flex-1 mt-3 ${Platform.OS === "web" && isMobile ? "ml-2" : "ml-8"}`}
          >
            {/* Username - First Line Only */}
            <View className="flex-row items-center py-4">
              {/* Username */}
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: usernameFontSize,
                  flex: 1, // take available space
                  marginRight: 8, // spacing before settings icon
                }}
                className="font-bold text-black"
              >
                {selectedMechanic?.username
                  ? selectedMechanic.username.charAt(0).toUpperCase() +
                    selectedMechanic.username.slice(1)
                  : ""}
              </Text>

              {/* Settings Button */}
              {type !== "user_visit" && (
                <Pressable onPress={() => setModal("settings")}>
                  <Feather
                    name="settings"
                    size={settingsIconSize}
                    color="black"
                  />
                </Pressable>
              )}
            </View>

            {/* Followers / Following  */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center ">
                {/* Followers */}
                <Pressable
                  // onPress={() =>
                  //   router.push(`/followers/${selectedMechanic?._id}`)
                  // }
                  className=" items-center"
                >
                  <Text
                    className={`${Platform.OS === "web" && isMobile ? "text-xs" : "text-sm"} sm:text-xs lg:text-sm  text-gray-500 mt-1`}
                  >
                    {selectedMechanic?.followers?.length || 0} Followers
                  </Text>
                </Pressable>

                {/* Following */}
                <Pressable
                  onPress={() => {
                    if (type !== "user_visit") setFollowingModal(true);
                  }}
                  className="items-center"
                >
                  <Text
                    className={`${Platform.OS === "web" && isMobile ? "text-xs" : "text-sm"} text-gray-500 mt-1 ml-2`}
                  >
                    {selectedMechanic?.following?.length || 0} Following
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfilePageHeader;
