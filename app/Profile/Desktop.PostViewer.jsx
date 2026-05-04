import React, { memo, useCallback, useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  Pressable,
} from "react-native";
import Animated from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Icon from "react-native-vector-icons/Feather";

import VideoGridItem from "./VideoGridItem";
import CommentSection from "./CommentSection";
import PostFooterIcons from "./PostFooterIcons";
import DeleteIcon from "./DeleteIcon";

/* ===========================
   DESKTOP POST VIEWER
=========================== */

const DesktopPostViewer = memo((props) => {
  const {
    item,
    user,
    userId,
    type,
    isDesktop,
    animatedStyle,
    doubleTap,
    handleTap,
    handleLike,
    postDelete,
    comment,
    setComment,
    setModal,
    share,
    postModal,
    totalPosts,
    goPrev,
    goNext,
    width,
  } = props;

  const [deleteIcon, setDeleteIcon] = useState("");
  const [showHeart, setShowHeart] = useState(false);

  /* ===========================
     HEART AUTO HIDE (FIX)
  =========================== */
  useEffect(() => {
    if (!showHeart) return;
    const timer = setTimeout(() => setShowHeart(false), 700);
    return () => clearTimeout(timer);
  }, [showHeart]);

  /* ===========================
     HANDLERS
  =========================== */
  const onMediaPress = useCallback(() => {
    setShowHeart(true);
    handleTap(item);
  }, [handleTap, item]);
 
  /* ===========================
     RENDER
  =========================== */

  return (
    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
      <View
        style={{
          width: width * 0.85,
          height: "85%",
          margin: "auto",
          flexDirection: "row",
          backgroundColor: "white",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* ================= MEDIA SIDE ================= */}
        <View style={{ width: "60%" }}>
          {/* -------- Header -------- */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#e5e5e5",
            }}
          >
            {user?.profileImage ? (
              <Image
                source={{
                  // uri: `http://192.168.1.10:5000/api/mediaDownload/${user.profileImage}`,
                  uri: `https://api.machinestreets.com/api/mediaDownload/${user.profileImage}`,
                }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <Ionicons name="person-circle-outline" size={40} color="gray" />
            )}

            <Text style={{ marginLeft: 12, fontWeight: "600" }}>
              {user?.username}
            </Text>

            <DeleteIcon
              deleteIcon={deleteIcon}
              type={type}
              item={item}
              postDelete={postDelete}
              setDeleteIcon={setDeleteIcon}
              isDesktop={isDesktop}
            />
          </View>

          {/* -------- Media -------- */}
          <GestureDetector gesture={doubleTap}>
            <Pressable
              onPress={onMediaPress}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {item?.contentType === "video" ? (
                <VideoGridItem
                  // source={`http://192.168.1.8:5000/api/mediaDownload/${item.media}`}
                  source={`https://api.machinestreets.com/api/mediaDownload/${item.media}`}
                  page="pvm"
                  isVisible
                />
              ) : (
                <Image
                  source={{
                    // uri: `http://192.168.1.8:5000/api/mediaDownload/${item.media}`,
                    uri: `https://api.machinestreets.com/api/mediaDownload/${item.media}`,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="contain"
                />
              )}

              {/* ❤️ Heart Animation */}
              {showHeart && (
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: "40%",
                      left: "40%",
                    },
                    animatedStyle,
                  ]}
                >
                  <AntDesign name="heart" size={100} color="red" />
                </Animated.View>
              )}
            </Pressable>
          </GestureDetector>

          {/* -------- Footer -------- */}
          {/* <View
            style={{
              padding: 12,
              borderTopWidth: 1,
              borderTopColor: "#e5e5e5",
            }}
          >
            <PostFooterIcons
              item={item}
              userId={userId}
              user={user}
              handleLike={handleLike}
              setModal={setModal}
              share={share}
            />

            {item?.bio && (
              <Text style={{ marginTop: 6 }}>{item.bio}</Text>
            )}
          </View> */}
        </View>

        {/* ================= COMMENTS SIDE ================= */}
        <View style={{ width: "40%", backgroundColor: "#fff", paddingVertical : 20 }}>
          <CommentSection
            user={user}
            userId={userId}
            isDesktop
            handleLike={handleLike}
            comment={comment}
            setComment={setComment}
            post={item}
            comments={item?.comments}
            share={share}
            onclose={() => setModal("")}
          />
        </View>
      </View>

      {/* ================= NAVIGATION ================= */}
      {postModal > 0 && (
        <Pressable
          onPress={goNext}
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 10,
            borderRadius: 20,
          }}
        >
          <Icon name="chevron-left" size={28} color="white" />
        </Pressable>
      )}

      {postModal < totalPosts - 1 && (
        <Pressable
          onPress={goPrev}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: 10,
            borderRadius: 20,
          }}
        >
          <Icon name="chevron-right" size={28} color="white" />
        </Pressable>
      )}
    </View>
  );
});

/* ===========================
   DISPLAY NAME (GOOD PRACTICE)
=========================== */
DesktopPostViewer.displayName = "DesktopPostViewer";

export default DesktopPostViewer;
