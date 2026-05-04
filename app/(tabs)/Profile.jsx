// child compoenents
import ProfilePageHeader from "../Profile/ProfilePageHeader";
import UserDetails from "../Profile/UserDetails";
import PostGrid from "../Profile/PostGrid";
import postsAnimation from "../../assets/animations/posts.json";

// Modals
import FollowersModal from "../Profile/FollowersModal";
import PostViewerModal from "../Profile/PostViewerModal";
import UploadPopUp from "../Profile/UploadPopUp";
import Settings from "../Profile/Settings";
import ResetPassword from "../Profile/ResetPassword";
import UserDetailsForm from "../SignUp/UserDetailsForm";
import CardSlider from "@/components/CardSlider";

// context
import { useAppContext } from "@/context/AppContext";
import { useFileUploadContext } from "@/context/FileUpload";

// hooks
import useApi from "@/hooks/useApi";
import useScreenWidth from "@/hooks/useScreenWidth";

// react native
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SectionList,
  Share,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";

// react
import { useCallback, useEffect, useState } from "react";
import CryptoJS from "react-native-crypto-js";

// icon and others
import Loading from "@/components/Loading";
import { Feather } from "@expo/vector-icons";

// toast
import { Toast } from "toastify-react-native";
import AppToast from "@/components/Toast";

const ProfilePage = () => {
  // context
  const { upload, media, setMedia } = useFileUploadContext();
  const {
    selectedMechanic,
    setSelectedMechanic,
    userId,
    startLoading,
    stopLoading,
  } = useAppContext();

  // hooks
  const { postJsonApi, patchApi, getJsonApi, deleteApi } = useApi();
  const { width, isDesktop, isMobile, height } = useScreenWidth();

  // follow states
  const [follow, setFollow] = useState("Follow");
  const [followingList, setFollowingList] = useState(null);
  const [followingModal, setFollowingModal] = useState(false);

  // post states
  const [uploadType, setUploadType] = useState("");
  const [description, setDescription] = useState("");
  const [postModal, setPostModal] = useState(null);
  const [clicked, setClicked] = useState(false);

  // common states
  const [comment, setComment] = useState({ comment: "", userId: null });

  // loading state
  const [displayLoader, setDisplayLoader] = useState(true);

  // modal
  const [modal, setModal] = useState("");
  const [viewType, setViewType] = useState("user"); // "posts" | "blogs"

  // others
  const [tempMech, setTempMech] = useState(selectedMechanic);
  const { id, type, post } = useLocalSearchParams();
  let decrypted = null;
  const insets = useSafeAreaInsets();
  const sections = [
    {
      title: "profile",
      data:
        viewType === "posts"
          ? selectedMechanic?.posts || []
          : [{ id: "placeholder" }],
    },
  ];

  if (type) {
    const bytes = CryptoJS.AES.decrypt(type, "f9b7nvctr72942chh39h9rc");
    decrypted = bytes.toString(CryptoJS.enc.Utf8);
  }

  // ========== useEffects =========

  // updating comment state
  useEffect(() => {
    setComment((prev) => ({ ...prev, userId: userId }));
  }, [userId]);

  // Refresh every time screen is focused
  useFocusEffect(
    useCallback(() => {
      getMechanic();
    }, [id, decrypted, userId]),
  );

  useFocusEffect(
    useCallback(() => {
      setDisplayLoader(true);
      // Optional: cleanup when screen loses focus
      return () => {
        setDisplayLoader(false);
      };
    }, []),
  );

  // hanlde media upload trigger
  useEffect(() => {
    console.log('media.length > 0 && uploadType !== "posts" :', uploadType);
    if (
      media.length > 0 &&
      (uploadType === "banner" || uploadType === "profileImage")
    ) {
      handleMediaupload();
    }
  }, [media]);

  // ========== Non-Api functions

  // web geocords
  const fetchCoordinatesWeb = async (address) => {
    const res = await fetch(
      `https://api.machinestreets.com/api/geocode?address=${encodeURIComponent(
        address,
      )}`,
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

  // fetch geocodes
  const fetchGeocodes = useCallback(async (address) => {
    startLoading();

    try {
      if (Platform.OS === "web") {
        const webCoords = await fetchCoordinatesWeb(address);
        if (webCoords) {
          setSelectedMechanic((prev) => ({
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
          setSelectedMechanic((prev) => ({
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
    } finally {
      stopLoading();
    }
  }, []);

  // Validation check
  const checkEmptyFields = useCallback((userDetails) => {
    const {
      username,
      role,
      mobile,
      subcategory,
      region, // state
    } = userDetails;

    const showError = (message) => {
      Toast.error(message, {
        duration: 3000,
        position: "top",
      });
    };

    // ✅ USERNAME
    if (!username?.trim()) {
      showError("Username is required");
      return false;
    }

    if (username.trim().length < 3) {
      showError("Username must be at least 3 characters");
      return false;
    }

    // ✅ MOBILE
    if (!mobile?.number?.trim()) {
      showError("Mobile number is required");
      return false;
    }

    // 🔥 MECHANIC VALIDATION
    if (role === "mechanic") {
      // ✅ ORDER: State → District → Street → Pincode

      if (!region?.trim()) {
        showError("State is required");
        return false;
      }

      if (!userDetails?.city?.toString().trim()) {
        showError("District is required");
        return false;
      }

      if (!userDetails?.street?.toString().trim()) {
        showError("Street is required");
        return false;
      }

      if (!userDetails?.pincode?.toString().trim()) {
        showError("Pincode is required");
        return false;
      }

      // ✅ OTHER FIELDS (kept from your original logic)
      if (!userDetails?.industry?.toString().trim()) {
        showError("Industry is required");
        return false;
      }

      if (!userDetails?.organization?.toString().trim()) {
        showError("Organization is required");
        return false;
      }

      // ✅ SUBCATEGORY
      if (!Array.isArray(subcategory) || subcategory.length === 0) {
        showError("Category is required");
        return false;
      }

      for (let i = 0; i < subcategory.length; i++) {
        const sub = subcategory[i];

        if (!sub?.name?.trim()) {
          showError("Category is required");
          return false;
        }

        const hasValidSubServices =
          Array.isArray(sub.services) &&
          sub.services.some(
            (s) => typeof s === "string" && s.trim().length > 0,
          );

        if (!hasValidSubServices) {
          showError("Subcategory is required");
          return false;
        }
      }
    }

    return true;
  }, []);

  // share function
  const share = useCallback(
    async (post) => {
      try {
        let productUrl;
        if (post) {
          productUrl = `https://machinestreets.com/E2?id=${userId}&type=user_visit&post=${post._id}`;
        } else {
          productUrl = `https://machinestreets.com/Profile?id=${id}&type=user_visit`;
        }

        const message = `Check this out: ${productUrl}`;

        if (Platform.OS === "web") {
          if (navigator.share) {
            await navigator.share({
              title: "Check this out!",
              text: message,
              url: productUrl,
            });
          } else {
            await navigator.clipboard.writeText(message);
            alert("🔗 URL copied to clipboard (Web Share not supported)");
          }
        } else {
          await Share.share({ message });
        }
      } catch (error) {
        Alert.alert("Error", "Unable to share.");
        console.log("Share error:", error);
      }
    },
    [id, userId],
  );
  //header tab icon click
  const handleIconClick = useCallback(async (name) => {
    setViewType(name);
    if (name === "credit-card") setModal("credit-card");
    if (name === "plus-square") {
      setUploadType("posts");
      await upload("posts");
    }
    if (name === "share") {
      share();
    }
  }, []);

  // ========== Api FUnctions ======

  // get selectedMechnic details
  const getMechanic = async () => {
    try {
      const user =
        Platform.OS === "web" ? id : decrypted === "user_visit" ? id : userId;
      const result = await getJsonApi(
        `api/getSelectedMechanic/${user}`,
        "application/json",
        { secure: true },
      );
      if (result.status === 200) {
        setSelectedMechanic(result?.data);
        setTempMech(result?.data);

        if (decrypted === "user_visit")
          setFollow(() =>
            result?.data?.following.includes(userId) ? "Following" : "Follow",
          );

        if (post) {
          const po = result?.data?.posts || [];
          const index = po.findIndex((p) => p._id === post); // ✅ find the index
          if (index !== -1) {
            setPostModal(index); // ✅ set index if found
          }
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setDisplayLoader(false);
    }
  };

  // media upload
  const handleMediaupload = async () => {
    if (!media || media.length === 0 || media?.canceled) return;

    const formData = new FormData();
    if (uploadType === "posts") formData.append("description", description);
    formData.append("type", uploadType);

    await Promise.all(
      media.map(async (asset) => {
        let file;
        if (Platform.OS === "web") {
          const blob = await (await fetch(asset.uri)).blob();
          file = new File([blob], asset.fileName || "file.jpg", {
            type: asset.mimeType || blob.type || "image/jpeg",
          });
        } else {
          file = {
            uri: asset.uri,
            name: asset.fileName || asset.uri.split("/").pop(),
            type:
              asset.mimeType ||
              `${asset.type}/${asset.uri.split(".").pop() || "jpeg"}`,
          };
        }
        formData.append("media", file);
      }),
    );
    // post Upoad
    const res = await postJsonApi(
      "api/postUpload",
      formData,
      Platform.OS === "web" ? undefined : "multipart/form-data",
      { secure: true },
    );
    if (res?.status === 200) {
      setDescription("");
      setMedia([]);
      setViewType(viewType === "plus-square" ? "grid" : "user");
    }
  };

  // pasword reset

  // password reset
  const handlePasswordReset = useCallback(async (password) => {
    try {
      const result = await patchApi(
        "api/passwordReset",
        { password, page: "profile" },
        "application/json",
        { secure: true },
      );
      if (result.status === 200) {
        setViewType("user");
        setModal("settings");
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  // userDetails updation
  const hanldeUpdate = useCallback(async (userDetails) => {
    if (!checkEmptyFields(userDetails)) {
      stopLoading();
      return;
    }
    try {
      const result = await patchApi(
        "api/userDetailsUpdate",
        { userDetails },
        "application/json",
        { secure: true },
      );
      if (result.status === 200) {
        setSelectedMechanic(result?.data?.userDetails);
        setViewType("user");
        setModal("");
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  // post likes and comments
  const handleLike = useCallback(async (postId, api) => {
    try {
      const result = await postJsonApi(api, postId, "application/json", {
        secure: true,
      });

      if (result.status === 200) {
        setComment((prev) => ({ ...prev, comment: "" }));
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  // delete api
  const postDelete = useCallback(async (postId) => {
    try {
      const result = await deleteApi(
        "api/deletePost",
        { postId },
        "application/json",
        { secure: true },
      );
      if (result?.status === 200) {
        setSelectedMechanic((prev) => {
          const newPosts = prev.posts.filter((post) => post._id !== postId);
          return { ...prev, posts: newPosts };
        });

        // ✅ Adjust postModal safely
        setPostModal((prev) => {
          const newLength = result?.data?.updatedUser?.posts?.length || 0;
          if (newLength === 0) return null; // no posts left
          return Math.min(prev, newLength - 1); // clamp
        });
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  // follow request api
  const followRequest = async (id) => {
    const mechId = id ? id : selectedMechanic?._id;
    try {
      const result = await postJsonApi(
        "api/followRequest",
        { mechId: mechId },
        "application/json",
        { secure: true },
      );

      if (result.status === 200) {
        const isFollowing = result.data.mechanic.followers.includes(userId);

        if (decrypted === "user_visit") {
          setFollow(isFollowing ? "Following" : "Follow");
          return;
        }
        // ✅ update list item
        setFollowingList((prev) =>
          prev.map((user) =>
            user._id === mechId
              ? { ...user, follow: isFollowing } // toggle
              : user,
          ),
        );

        setSelectedMechanic((prev) => {
          const exists = prev.following.some(
            (item) => item.toString() === id.toString(),
          );

          return {
            ...prev,
            following: exists
              ? prev.following.filter(
                  (item) => item.toString() !== id.toString(),
                ) // 🔻 remove
              : [...prev.following, id], // 🔺 add
          };
        });
      }
    } catch (err) {
      console.error("Follow request failed:", err);
    }
  };

  // fetch followers
  const fetchFollwers = async () => {
    const result = await getJsonApi("api/getFollowers", "application/json", {
      secure: true,
    });
    if (result.status === 200 || 201) setFollowingList(result.data || []);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
      edges={["top", "left", "right"]} // ignore bottom to let tab bar handle it
    >
      {displayLoader ? (
        <Loading />
      ) : (
        <>
          <SectionList
            style={{ flex: 1 }}
            sections={sections}
            keyExtractor={(item, index) =>
              item._id?.toString() || index.toString()
            }
            stickySectionHeadersEnabled={true}
            ListHeaderComponent={
              <ProfilePageHeader
                setFollowingModal={setFollowingModal}
                media={media}
                selectedMechanic={selectedMechanic}
                type={decrypted}
                isMobile={isMobile}
                upload={upload}
                setUploadType={setUploadType}
                setModal={setModal}
                fetchFollwers={fetchFollwers}
              />
            }
            renderSectionHeader={() => {
              const icons = [
                "plus-square",
                "share",
                "grid",
                "user",
                "credit-card",
              ].filter(
                (name) =>
                  !(
                    decrypted === "user_visit" &&
                    (name === "plus-square" || name === "edit-2")
                  ),
              );

              return (
                <View
                  className="flex-row items-center px-4 py-4  bg-gray-100"
                  style={{ zIndex: Platform.OS === "web" ? 999 : 1 }}
                >
                  {/* Icons */}
                  {selectedMechanic?.role === "mechanic" && (
                    <View className="flex-row flex-1 justify-evenly items-center">
                      {icons.map((name) => (
                        <Pressable
                          key={name}
                          className={`flex-1 mx-1 py-2 items-center justify-center rounded-lg
                ${viewType === name ? "bg-TealGreen" : "bg-white"}`}
                          onPress={() => handleIconClick(name)}
                        >
                          <Feather
                            name={name}
                            size={22}
                            color={viewType === name ? "white" : "#2095A2"}
                          />
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* Follow Button (Right Side + Highlighted) */}
                  {decrypted === "user_visit" && (
                    <Pressable
                      onPress={() => followRequest()}
                      className="ml-3 px-5 py-2 bg-TealGreen rounded-md shadow-sm"
                    >
                      <Text className="text-white font-bold text-base">
                        {follow}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            }}
            renderItem={({ item }) => (
              <View className="mt-2 p-4 rounded-md -z-10">
                {selectedMechanic?.role === "mechanic" &&
                  viewType !== "grid" &&
                  viewType !== "plus-square" && (
                    <UserDetails
                      userDetails={selectedMechanic}
                      isMobile={isMobile}
                      isDesktop={isDesktop}
                    />
                  )}
                {(viewType === "grid" || viewType === "plus-square") &&
                  (selectedMechanic?.posts.length > 0 ? (
                    <PostGrid
                      setPostModal={setPostModal}
                      isDesktop={isDesktop}
                      selectedMechanic={selectedMechanic}
                      page="pro"
                    />
                  ) : (
                    <View className="h-screen w-full  items-center justify-center">
                      <View
                        className={`${
                          isDesktop ? "w-[500px]" : "w-[90%]"
                        }  bg-gray`}
                      >
                        <LottieView
                          source={postsAnimation}
                          autoPlay
                          loop
                          style={{ width: "100%", height: "100%" }}
                        />
                      </View>
                    </View>
                  ))}
              </View>
            )}
          />

          {/* ========== Modals ======= */}

          {/* upload popup */}
          {media?.length > 0 && viewType === "plus-square" && (
            <UploadPopUp
              onRequestClose={() => {
                setViewType("user");
                setMedia([]);
              }}
              isDesktop={isDesktop}
              media={media}
              setMedia={setMedia}
              description={description}
              setDescription={setDescription}
              handleMediaupload={handleMediaupload}
            />
          )}
          {/* follewers */}
          <FollowersModal
            setSelectedMechanic={setSelectedMechanic}
            fetchFollwers={fetchFollwers}
            visible={followingModal}
            onClose={() => setFollowingModal(false)}
            followingList={followingList}
            followRequest={followRequest}
          />
          {/* settings and update form */}
          <Modal
            visible={
              viewType === "edit-2" ||
              modal === "settings" ||
              modal === "reset" ||
              modal === "credit-card"
            }
            animationType="slide"
            transparent={modal !== "edit-2"} // overlay for settings/reset, not edit
            presentationStyle={
              modal === "edit-2" ? "fullScreen" : "overFullScreen"
            }
            statusBarTranslucent
            onRequestClose={() => {
              setTempMech(selectedMechanic);
              setViewType("user");
              setModal("");
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "padding"}
              style={styles.fullScreen}
            >
              <SafeAreaView
                className="w-full h-full items-center justify-center "
                style={{
                  flex: 1,
                  paddingTop: Platform.OS === "ios" ? insets.top : 0,
                  paddingBottom: Platform.OS === "ios" ? insets.bottom : 0,
                }}
                edges={["top", "bottom"]}
              >
                <AppToast />
                {/* Background close */}
                <TouchableWithoutFeedback
                  onPress={() => {
                    setTempMech(selectedMechanic);
                    setViewType("user");
                    setModal("");
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                </TouchableWithoutFeedback>

                {/* Modal Content */}
                <View
                  style={{
                    width:
                      modal === "credit-card"
                        ? "100%"
                        : isDesktop
                          ? 600
                          : "90%",
                    backgroundColor:
                      modal === "credit-card" ? "#56515158" : "#fff",
                    borderRadius: viewType === "credit-card" ? 0 : 24,
                    padding: 20,
                    height:
                      Platform.OS === "web"
                        ? viewType === "edit-2"
                          ? "95%"
                          : viewType === "credit-card"
                            ? "100%"
                            : "auto"
                        : "auto",
                    alignItems: "center",
                    justifyContent: "center",

                    // ✅ Apply shadow only when not credit-card
                    ...(viewType !== "credit-card" && {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 10,
                    }),
                  }}
                >
                  {viewType === "edit-2" && (
                    <UserDetailsForm
                      onRequestClose={() => {
                        setTempMech(selectedMechanic);
                        setViewType("user");
                        setModal("");
                      }}
                      userDetails={tempMech}
                      setUserDetails={setTempMech}
                      page="profile"
                      handleSubmit={hanldeUpdate}
                      fetchGeocodes={fetchGeocodes}
                    />
                  )}

                  {modal === "settings" && (
                    <Settings setModal={setModal} setViewType={setViewType} />
                  )}

                  {modal === "reset" && (
                    <ResetPassword handlePasswordReset={handlePasswordReset} />
                  )}
                  {modal === "credit-card" && (
                    <CardSlider
                      userDetails={selectedMechanic}
                      onClose={() => setModal("")}
                    />
                  )}
                </View>
              </SafeAreaView>
            </KeyboardAvoidingView>
          </Modal>
          {/* posts modal */}
          <Modal
            visible={postModal !== null}
            onRequestClose={() => setPostModal(null)}
            statusBarTranslucent={true}
            transparent={Platform.OS === "web" && isDesktop} // never true on iOS
            animationType="slide"
            // presentationStyle={Platform.OS === "ios" ? "fullScreen" : "overFullScreen"}
          >
            <SafeAreaView
              style={{
                flex: 1,
                paddingTop: Platform.OS === "ios" ? insets.top : 0,
                paddingBottom: Platform.OS === "ios" ? insets.bottom : 0,
              }}
              edges={["top", "bottom"]}
            >
              {selectedMechanic?.posts?.length > 0 && (
                <PostViewerModal
                  setSelectedMechanic={setSelectedMechanic}
                  type={decrypted}
                  postDelete={postDelete}
                  comment={comment}
                  setComment={setComment}
                  userId={userId}
                  handleLike={handleLike}
                  user={selectedMechanic}
                  setPostModal={setPostModal}
                  setModal={setModal}
                  share={share}
                  modal={modal}
                  postModal={postModal}
                  height={height}
                  width={width * 0.8}
                  isDesktop={isDesktop}
                />
              )}
            </SafeAreaView>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = {
  fullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
};

export default ProfilePage;
