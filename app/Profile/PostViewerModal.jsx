import React, { useRef, useCallback } from "react";
import { Animated, Platform, Pressable, Dimensions, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import DesktopPostViewer from "./Desktop.PostViewer";
import MobilePostViewer from "./Mobile.PostViewer";
import { Feather } from "@expo/vector-icons";
import { GestureHandlerRootView, Gesture } from "react-native-gesture-handler";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const PostViewerModal = ({
  type,
  postDelete,
  comment,
  setComment,
  userId,
  setPostModal,
  user,
  modal,
  setModal,
  postModal,
  width,
  isDesktop,
  handleLike,
  setSelectedMechanic,
  share,
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const screenHeight = Dimensions.get("window").height;
  const lastTap = useRef(null);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const animatedStyle = useCallback(
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    })),
    []
  );

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
      scale.value = 0;
      opacity.value = 0;

      scale.value = withSpring(1.5, {
        damping: 5,
        stiffness: 150,
        mass: 0.4,
      });

      opacity.value = withTiming(1, { duration: 200 });

      setTimeout(() => {
        scale.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
      }, 800);
    });

  const handleTap = useCallback((item) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300; // ms
    if (lastTap.current && now - lastTap.current < DOUBLE_PRESS_DELAY) {

      if (!item.likes.includes(userId)) {
        setSelectedMechanic((prev) =>
          prev
            ? {
                ...prev,
                posts: prev.posts.map((p) =>
                  p._id === item._id
                    ? { ...p, likes: p.likes ? [...p.likes, userId] : [userId] }
                    : p
                ),
              }
            : prev
        );

        setTimeout(() => {
          handleLike({ postId: item._id }, "api/postLikes");
        }, 500);
      }
      lastTap.current = null; // reset
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now) {
          lastTap.current = null;
        }
      }, DOUBLE_PRESS_DELAY);
    }
  }, []);

  const goPrev = () =>
    setPostModal((prev) => (prev < user.posts.length - 1 ? prev + 1 : prev));
  const goNext = () => setPostModal((prev) => (prev > 0 ? prev - 1 : prev));
  
  return (
    <SafeAreaView className="z-50 flex-1 ">
      {/* Desktop close button */}
      {Platform.OS === "web" && isDesktop && (
        <Pressable
          onPress={() => setPostModal(null)}
          className="bg-gray-100 z-50 p-2 rounded-full absolute right-2 top-2"
        >
          <Icon name="x" size={26} color="gray" />
        </Pressable>
      )}
      {!isDesktop && (
        <View
          className="w-full bg-white"
          style={{
            height:
              Platform.OS === "ios"
                ? (screenHeight - (insets.top + insets.bottom)) * 0.1
                : screenHeight * 0.1,
          }}
        >
          <Pressable
            onPress={() => setPostModal(null)}
            className="z-50 bg-black/40 p-2 rounded-full absolute left-2 top-2"
          >
            <Feather name="arrow-left" size={26} color="white" />
          </Pressable>
        </View>
      )}

      {isDesktop && user?.posts[postModal] ? (
        <DesktopPostViewer
          type={type}
          isDesktop={isDesktop}
          userId={userId}
          comment={comment}
          setComment={setComment}
          setModal={setModal}
          handleLike={handleLike}
          animatedStyle={animatedStyle}
          doubleTap={doubleTap}
          handleTap={handleTap}
          share={share}
          item={user.posts[postModal]}
          goPrev={goPrev}
          goNext={goNext}
          postModal={postModal}
          width={width}
          totalPosts={user?.posts?.length}
          postDelete={postDelete}
          user={user}
        />
      ) : null}
      {!isDesktop && user?.posts[postModal] && (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <MobilePostViewer
            screenHeight={screenHeight}
            type={type}
            postDelete={postDelete}
            comment={comment}
            setComment={setComment}
            setModal={setModal}
            modal={modal}
            userId={userId}
            user={user}
            postModal={postModal}
            scrollY={scrollY}
            handleLike={handleLike}
            animatedStyle={animatedStyle}
            doubleTap={doubleTap}
            handleTap={handleTap}
            share={share}
            isDesktop={isDesktop}
            setPostModal={setPostModal}
            insets={insets}
            setSelectedMechanic={setSelectedMechanic}
          />
        </GestureHandlerRootView>
      )}
    </SafeAreaView>
  );
};
// kjnjh
export default PostViewerModal;
