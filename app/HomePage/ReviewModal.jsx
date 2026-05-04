import { FormatTime } from "@/context/FormatTime";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";
import { useContext } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import noreviews from "../../assets/animations/no_reviews.json";

const ReviewModal = ({ selectedMechanic, setReviewModal, userId }) => {
  const { formatTime } = useContext(FormatTime);

  const reviews = selectedMechanic?.reviews || [];

  return (
    <View className="flex-1 mt-2">
      {reviews.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <LottieView
            source={noreviews}
            autoPlay
            loop
            style={{ height: "100%", width: "100%" }}
          />
          {/* <Text className="text-gray-500 mt-2">No reviews yet</Text> */}
        </View>
      ) : (
        <FlatList
          data={[...reviews].reverse()}
          keyExtractor={(item) => item._id}
          className="flex-1 mb-3"
          renderItem={({ item }) => (
            <View className="mb-6">
              {/* User Row */}
              <View className="flex-row items-center mb-1">
                {item.userId?.profileImage ? (
                  <Image
                    source={{
                      uri: `https://api.machinestreets.com/api/mediaDownload/${item?.userId?.profileImage}`,
                    }}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                ) : (
                  <MaterialIcons
                    name="account-circle"
                    size={32}
                    color="#9ca3af"
                    style={{ marginRight: 8 }}
                  />
                )}
                <View className="flex-row items-center space-x-4">
                  <Text className="font-semibold text-gray-900">
                    {item?.userId?.username}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-[2px]">
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Stars */}

              <View className="flex-row mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    name={i < item.star ? "star" : "star-border"} // filled or outline
                    size={18}
                    color={i < item.star ? "#facc15" : "#d1d5db"} // yellow-400 or gray-300
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>

              {/* Review Text */}
              <Text className="text-gray-700">{item?.reviewText}</Text>
            </View>
          )}
        />
      )}

      {/* Add Review Button */}
      {userId !== selectedMechanic?._id?.toString() && (
        <Pressable
          onPress={() => setReviewModal("write")}
          className="w-full h-12 bg-gray-100 rounded-lg justify-center items-center mb-2"
        >
          <Text className="text-center font-semibold text-base">
            Add Review
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default ReviewModal;
