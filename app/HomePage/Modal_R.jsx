import {
  Modal,
  View,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";
import ReviewModal from "./ReviewModal";
import Rating from "./Rating";
import { SafeAreaView } from "react-native-safe-area-context";
import AppToast from "@/components/Toast";

const Modal_R = ({
  userId,
  isDesktop,
  isTablet,
  height,
  setReviewModal,
  selectedMechanic,
  width,
  reviewModal,
  review,
  setReview,
  postReview,
}) => {
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={() => setReviewModal("")}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
      >
        <AppToast />
        <View
          style={{
            flex: 1,
            maxHeight: "90%",
            width: isTablet ? 500 : isDesktop ? 500 : "100%",
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 40,
            paddingHorizontal: 16,
            paddingBottom: 16,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 10,
            alignSelf: "center",
          }}
        >
          {reviewModal === "read" && selectedMechanic && (
            <Fontisto
              name="close"
              size={24}
              color="red"
              onPress={() => setReviewModal("")}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 10,
              }}
            />
          )}

          {reviewModal !== "read" ? (
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior="padding"
              keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
              <TouchableWithoutFeedback
                onPress={() => {
                  if (Platform.OS !== "web" && !isDesktop) Keyboard.dismiss();
                }}
                accessible={false}
                touchSoundDisabled={true}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Rating
                    review={review}
                    setReview={setReview}
                    setReviewModal={setReviewModal}
                    postReview={postReview}
                  />
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          ) : (
            <View style={{ flex: 1, zIndex: 9999 }}>
              <ReviewModal
                setReviewModal={setReviewModal}
                selectedMechanic={selectedMechanic}
                height={height}
                width={width}
                userId={userId}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default Modal_R;
