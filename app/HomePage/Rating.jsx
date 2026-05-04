import { useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppContext } from "@/context/AppContext";
import Loading from "@/components/Loading";
import LottieView from "lottie-react-native";
import reviewsuccess from "../../assets/animations/review_success.json";

const Rating = ({ setReviewModal, review, setReview, postReview }) => {
  const { isLoading } = useAppContext();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    const res = await postReview(); // wait for API
    if (res.success) {
      setShowSuccess(true);
    }
  };

  return (
    <View className="w-full bg-gray-100 h-fit shadow-lg rounded-md flex items-center justify-center gap-4 p-4 relative">
      {/* Close icon */}
      <Ionicons
        onPress={() => setReviewModal("read")}
        name="close-circle-sharp"
        size={24}
        color="red"
        className="absolute right-2 top-2"
      />

      {/* Title */}
      <Text className="text-lg font-bold text-TealGreen mb-5">
        Add Your Review
      </Text>

      {/* Star Rating */}
      <View className="flex-row mb-5">
        {[...Array(5)].map((_, index) => (
          <Pressable
            key={index}
            onPress={() => setReview((prev) => ({ ...prev, star: index + 1 }))}
          >
            <Ionicons
              name={Number(review.star) > index ? "star" : "star-outline"}
              size={30}
              color={Number(review.star) > index ? "#FFD700" : "red"}
            />
          </Pressable>
        ))}
      </View>

      {/* Review Text Input */}
      <TextInput
        style={[styles.textInput, { pointerEvents: "auto" }]}
        placeholder="Write your review..."
        placeholderTextColor="#888"
        multiline
        numberOfLines={4}
        onChangeText={(text) =>
          setReview((prev) => ({ ...prev, reviewText: text }))
        }
        value={review.reviewText}
        editable={true}
      />

      {/* Submit Button */}
      <Pressable
        className="bg-TealGreen px-4 py-3 rounded-md h-12 w-48 overflow-hidden justify-center items-center"
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loading />
        ) : (
          <Text className="text-white font-bold text-base">Submit Review</Text>
        )}
      </Pressable>

      {/* Success Animation Overlay */}
      {/* Success Animation Overlay */}
      {showSuccess && (
        <View style={styles.animationOverlay}>
          <LottieView
            source={reviewsuccess}
            autoPlay
            loop={false}
            resizeMode="cover" // 👈 ensures it fills
            style={styles.lottie}
            onAnimationFinish={() => {
              setShowSuccess(false);
              setReviewModal("read"); // close modal after animation
            }}
          />
        </View>
      )}
    </View>
  );
};
export default Rating;
const styles = StyleSheet.create({
  textInput: {
    width: "100%",
    height: 96,
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
    padding: 12,
    color: "black",
    borderWidth: 2,
    borderColor : "#008080",
    outlineColor: "#008080",
  },
  animationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  lottie: {
    width: "100%", // 👈 take full width
    height: "100%", // 👈 take full height
  },
});
