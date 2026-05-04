import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { Card, Divider } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import FadeSlideView from "@/components/FadeSlideView";
import { Dimensions } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const UserDetails = ({ userDetails, isMobile, isDesktop }) => {
  const [reviewData, setReviewData] = useState([]);

  useEffect(() => {
    setReviewData(userDetails?.reviews);
  }, [userDetails]);

  // Build Full Address
  const fullAddress = `${userDetails?.street || ""}, ${
    userDetails?.city || ""
  }, ${userDetails?.region || ""} - ${userDetails?.pincode || ""}, ${
    userDetails?.country || ""
  }`;

  return (
    <FadeSlideView>
      <LinearGradient
        colors={["#2095a2", "#0f3460"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 bg-gray-200 rounded-md"
      >
        <Card.Content>
          <View className="mb-6">
            <Text className="text-white text-2xl font-bold text-center mt-8">
              {userDetails?.organization?.charAt(0).toUpperCase() +
                userDetails?.organization?.slice(1)}
            </Text>

            {/* Location */}
            <View className="flex-row items-center justify-center w-full mt-6 mb-6">
              <FontAwesome name="map-marker" size={18} color="#fff" />

              <Text className="ml-3 text-white text-base leading-6 text-center">
                {fullAddress}
              </Text>
            </View>

            <Text className="text-xl text-white font-bold ml-2 mt-1">
              <MaterialCommunityIcons name="factory" size={20} color="white" />{" "}
              {userDetails?.industry?.charAt(0).toUpperCase() +
                userDetails?.industry?.slice(1)}
            </Text>

            <View className="flex-row flex-wrap justify-between mt-5 gap-2">
              {userDetails?.subcategory?.map((sub, key) => (
                <View
                  key={key}
                  className={`bg-white p-3 rounded-lg mb-2 ${
                    isMobile ? "w-full" : "w-[48%]"
                  }`}
                >
                  <Text className="text-base font-semibold mb-1 mt-1">
                    {sub.name}
                  </Text>
                  {sub.services?.map((service, i) => (
                    <Text key={i} className="mt-1 ml-2 text-gray-700">
                      - {service}
                    </Text>
                  ))}
                </View>
              ))}

              <View
                className={`bg-white p-3 rounded-lg mb-2 ${
                  isMobile ? "w-full" : "w-[48%]"
                }`}
              >
                <Text className="text-base font-semibold mb-1">
                  Specialization / Services
                </Text>
                {userDetails?.services.map((service, index) => (
                  <Text key={index} className="mt-1 ml-2 text-gray-700">
                    - {service}
                  </Text>
                ))}
              </View>

              <View
                className={`bg-white p-3 rounded-lg mb-2 ${
                  isMobile ? "w-full" : "w-[48%]"
                }`}
              >
                <Text className="text-base font-semibold mb-1">Contact</Text>
                <Text className="text-md mt-2">
                  {userDetails?.mobile?.countryCode &&
                  userDetails?.mobile?.number
                    ? `${userDetails.mobile.countryCode} ${userDetails.mobile.number}`
                    : "-Not provided"}
                </Text>
              </View>
            </View>
          </View>

          <Divider className="bg-white my-4" />

          {/* review section  */}
          <View className="mt-12 mb-20 px-4">
            <Text className="text-2xl font-bold text-white mb-8 text-center">
              ✨ Customer Reviews
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {Array.isArray(reviewData) && reviewData.length > 0 ? (
                reviewData.map((data, index) => (
                  <Animated.View
                    key={data._id || index}
                    entering={FadeInUp.delay(index * 120)}
                    style={{
                      backgroundColor: "white",
                      padding: 20,
                      borderRadius: 10,
                      marginBottom: 10,
                      width: isDesktop ? "48%" : "100%",
                    }}
                    className={` rounded-2xl  shadow-lg border border-gray-200 
            `}
                  >
                    {/* User */}
                    <View className="flex-row items-center mb-4">
                      <Image
                        source={{
                          uri: `https://api.machinestreets.com/api/mediaDownload/${data?.userId?.profileImage}`,
                        }}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 24,
                          backgroundColor: "#f5f5f5",
                        }}
                      />
                      <View className="ml-3">
                        <Text className="text-lg font-semibold text-gray-900">
                          {data?.userId?.username
                            ? data.userId?.username?.charAt(0).toUpperCase() +
                              data.userId?.username?.slice(1)
                            : "Guest User"}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <MaterialCommunityIcons
                              key={i}
                              name={i < data?.star ? "star" : "star-outline"} // ✅ filled & outline
                              size={18}
                              color="#facc15" // Tailwind yellow-400
                              style={{ marginRight: 2 }}
                            />
                          ))}
                        </View>
                      </View>
                    </View>

                    {/* Review */}
                    <Text className="text-base text-gray-700 leading-relaxed">
                      {data.reviewText?.charAt(0).toUpperCase() +
                        data.reviewText?.slice(1)}
                    </Text>
                  </Animated.View>
                ))
              ) : (
                <View className="p-6 items-center">
                  <Text className="text-white text-base">No Reviews Yet</Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </LinearGradient>
    </FadeSlideView>
  );
};

export default UserDetails;
