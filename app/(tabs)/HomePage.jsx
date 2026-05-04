// child components
import Filter from "@/components/FIlter";
import Header from "@/components/Header";
import UserCard from "@/components/UserCard";
import SelectedFilter from "../FIlter/SelectedFIlters";

// Modals
import ServiceModal from "../HomePage/ServiceModal";
import QrModal from "../HomePage/QrModal";
import Modal_R from "../HomePage/Modal_R";

// Loading Component

import Loading from "@/components/Loading";

// context

import { useAppContext } from "@/context/AppContext";

// hooks

import { useLocation } from "@/context/LocationContext";
import useApi from "@/hooks/useApi";
import useScreenWidth from "@/hooks/useScreenWidth";

// react native
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

// react

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// icon

import Ionicons from "@expo/vector-icons/Ionicons";

// others

import * as SecureStore from "expo-secure-store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const HomePage = () => {
  // context
  const {
    userDetails,
    setUserDetails,
    selectedMechanic,
    setSelectedMechanic,
    isLoading,
    userRole,
    filterData,
    setFIlterData,
    socketInit,
    startLoading,
    userId
  } = useAppContext();

  // hooks
  const { isDesktop, width, isTablet, isMobile, height } = useScreenWidth();
  const { getJsonApi, postJsonApi } = useApi();
  const { geoCoords, status } = useLocation();

  // refs
  const cache = useRef({}); // cache object

  // ============== States =====================

  // schema states
  const [filterItems, setFilterItems] = useState({
    selectedCategory: null,
    selectedIndustry: null,
    selectedSubCategory: [],
    selectedServices: null,
    selectedRating: null,
    selectedDistrict: [],
  });

  const [review, setReview] = useState({
    star: null,
    reviewText: null,
    userId: null,
  });

  // searchbar states
  const [searchBarValue, setSearchBarValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // filter states
  const [isFilterOpen, setIsFilterOpen] = useState(
    Platform.OS === "web" && isDesktop,
  );
  const [shouldRenderFilter, setShouldRenderFilter] = useState(isFilterOpen);

  // Modal states
  const [serviceModal, setServiceModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(null);
  const [qr, setQr] = useState(true);

  // Pagination States

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);

  // Animation States
  const slideAnim = useState(new Animated.Value(-width))[0]; // start off-screen left
  const selectedFIlterAnim = useRef(new Animated.Value(0)).current;

  // refresh State
  const [refreshing, setRefreshing] = useState(false);
  // const [role, setRole] = useState(null);

  // =============== Api Functions =================

  // search api
  const fetchSearchResult = async (page) => {
    const queryKey = `${searchBarValue}_${page}`; // unique cache key per query+page

    // ✅ Check cache first
    if (cache.current[queryKey]) {
      setSearchResults(cache.current[queryKey]);
      return;
    }

    try {
      const data = await getJsonApi(
        `api/search?searchQuery=${searchBarValue}&page=${page}`,
        "application/json",
        { secure: true },
      );
      if (data.status === 200) {
        const results = data?.data?.searchResults || [];
        cache.current[queryKey] = results; // ✅ Save in cache
        setSearchResults(results);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // review submission

  const postReview = useCallback(async () => {
    try {
      const result = await postJsonApi(
        "api/postReview",
        { review },
        "application/json",
        { secure: true },
      );

      if (result.status === 200) {
        setReview((prev) => ({
          ...prev,
          star: null,
          reviewText: null,
        }));
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.log(err);
      return { success: false };
    }
  }, [review, postJsonApi]);

  // fetch Mechanics
  const getmechanics = useCallback(
    async (reset,currentPage) => {
      try {
        if (!geoCoords) return;
        
        const result = await getJsonApi(
          `homepage/getmechanics/?page=${currentPage}&limit=50&lat=${
            geoCoords?.latitude || 0
          }&long=${geoCoords?.longitude || 0}`,
          "application/json",
          { secure: true },
        );

        if (result?.status === 200) {
          setTotalPages(result?.data?.totalPages);
          if (currentPage === 1 || reset) {
            setUserDetails(result?.data?.userData || []);
          } else {
            setUserDetails((prev) => [
              ...(prev || []),
              ...(result?.data?.userData || []),
            ]);
          }
          setFIlterData(result?.data?.filterData);
          setQr(result.data.qr);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [geoCoords, page],
  );

  // ===============  Functions =====================

  // getting tokens/cookies
  const getItem = async (key) => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  };

  // filter mechanics

  const filteredMechanics = useMemo(() => {
    return (searchBarValue?.length > 0 ? searchResults : userDetails)?.filter(
      (mechanic) => {
        const {
          selectedCategory,
          selectedIndustry,
          selectedSubCategory,
          selectedRating,
          selectedDistrict,
          selectedState,
          otherThanIndia,
        } = filterItems;

        const matchesIndustry = selectedIndustry
          ? mechanic.industry === selectedIndustry
          : true;

        const matchesCategory = selectedCategory
          ? mechanic.subcategory?.some((sub) => sub.name === selectedCategory)
          : true;

        const matchesSubCategory = selectedSubCategory.length
          ? mechanic.subcategory?.some(
              (sub) =>
                sub.name === selectedCategory &&
                sub.services?.some((service) =>
                  selectedSubCategory.includes(service),
                ),
            )
          : true;

        const matchesState = selectedState
          ? otherThanIndia
            ? mechanic.country === selectedState
            : mechanic.region === selectedState
          : true;

        const matchesDistrict =
          selectedDistrict.length > 0
            ? selectedDistrict.includes(
                otherThanIndia ? mechanic.region : mechanic.city,
              )
            : true;

        const matchesRating = selectedRating
          ? mechanic.averageRating >= selectedRating
          : true;

        return (
          matchesIndustry &&
          matchesCategory &&
          matchesSubCategory &&
          matchesState &&
          matchesDistrict &&
          matchesRating
        );
      },
    );
  }, [
    searchResults,
    userDetails,
    filterItems.selectedCategory,
    filterItems.selectedIndustry,
    filterItems.selectedSubCategory,
    filterItems.selectedRating,
    filterItems.selectedDistrict,
    filterItems.selectedState,
    filterItems.otherThanIndia,
  ]);

  // page refresh

  const onRefresh = useCallback(async () => {
    setPage(1);
    setRefreshing(true);
    await getmechanics(true, 1); // refresh list
    setRefreshing(false);
  }, [getmechanics]);

  //  ================== useEffects =================

  useEffect(() => {
    startLoading();
    socketInit();
    if (geoCoords) {
      getmechanics(true, 1);
    }
  }, [geoCoords]); // run again once location is ready

  // filter animation
  useEffect(() => {
    if (isFilterOpen) {
      setShouldRenderFilter(true);
    }

    Animated.timing(slideAnim, {
      toValue: isFilterOpen ? 0 : -width,
      duration: 400,
      useNativeDriver: false,
    }).start(() => {
      if (!isFilterOpen) {
        setShouldRenderFilter(false);
      }
    });
  }, [isFilterOpen]);

  // selected filter animation
  useEffect(() => {
    if (
      Object.values(filterItems).some((val) =>
        Array.isArray(val) ? val.length > 0 : val !== null,
      )
    ) {
      Animated.timing(selectedFIlterAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(selectedFIlterAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }).start();
    }
  }, [filterItems]);

  // debounce the query to api
  useEffect(() => {
    if (searchBarValue?.length >= 3) {
      const handler = setTimeout(() => {
        fetchSearchResult("mech");
      }, 400);

      return () => clearTimeout(handler);
    } else if (searchBarValue?.length === 0) {
      setSearchResults([]);
    }
  }, [searchBarValue]);

  return (
    <GestureHandlerRootView>
      <SafeAreaView
        edges={["top", "left", "right"]} // ignore bottom to let tab bar handle it
        style={{ flex: 1, backgroundColor: "#e5e7eb" }}
      >
        {/* header */}
        <Header
          isFilterOpen={isFilterOpen}
          searchBarValue={searchBarValue}
          setSearchBarValue={setSearchBarValue}
        />
        {/* filter icon */}
        {!isDesktop && (
          <Pressable
            onPress={() => setIsFilterOpen(true)}
            className="mt-4 ml-3"
          >
            <Ionicons name="filter-outline" size={40} color="black" />
          </Pressable>
        )}

        {/* =================== Main content =================== */}

        <View className="flex-row w-full flex-1">
          {/* filter */}
          {(isDesktop || isFilterOpen) && (
            <Filter
              isDesktop={isDesktop}
              isMobile={isMobile}
              isTablet={isTablet}
              // open state
              isFilteOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              // filter data
              filterData={filterData}
              filterItems={filterItems}
              setFilterItems={setFilterItems}
            />
          )}

          {/* userCards */}

          <View
            className={`flex-1 ${
              Platform.OS === "web" && width >= 1024 ? "p-4" : null
            } `}
          >
            <FlatList
              key={isDesktop ? "desktop" : "mobile"}
              data={filteredMechanics}
              keyExtractor={(item) => item._id.toString()}
              numColumns={isDesktop ? 2 : 1}
              contentContainerStyle={{
                padding: isDesktop ? 10 : 0,
                flexGrow: 1,
                justifyContent:
                  filteredMechanics?.length === 0 ? "center" : "flex-start",
              }}
              columnWrapperStyle={
                isDesktop ? { justifyContent: "space-between" } : undefined
              }
              renderItem={({ item }) => (
                <View
                  key={item._id.toString()}
                  className={`${
                    isDesktop ? "w-[49%] h-[460px]" : "w-[95%] h-auto"
                  } m-2 rounded-md mx-auto`}
                >
                  <UserCard
                    width={width}
                    mechanic={item}
                    isDesktop={isDesktop}
                    setServiceModal={setServiceModal}
                    setSelectedMechanic={setSelectedMechanic}
                    setReviewModal={setReviewModal}
                    setReview={setReview}
                    userId={userId}
                  />
                </View>
              )}
              ListHeaderComponentStyle={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                width: "100%",
                backgroundColor: "#E5E7EB",
                padding: 5,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#2095A2"]}
                  tintColor="#2095A2"
                />
              }
              ListHeaderComponent={() => (
                <Animated.View
                  style={{
                    opacity: selectedFIlterAnim,
                    transform: [
                      {
                        translateY: selectedFIlterAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                    overflow: "hidden",
                  }}
                >
                  <SelectedFilter
                    filterItems={filterItems}
                    setFilterItems={setFilterItems}
                  />
                </Animated.View>
              )}
              ListEmptyComponent={() => (
                <View className="flex-1 justify-center items-center">
                  {isLoading && page === 1 ? (
                    <Loading />
                  ) : userDetails.length === 0 ? (
                    <Text className="text-gray-500 text-lg font-semibold">
                      No Data Found
                    </Text>
                  ) : null}
                </View>
              )}
              ListFooterComponent={() => {
                if (userDetails?.length > 0) {
                  return totalPages === 1 || page >= totalPages ? (
                    <Text className="text-gray-500 text-center py-4">
                      No more mechanics
                    </Text>
                  ) : (
                    <Pressable
                      className="mt-24 mb-8 overflow-hidden rounded-md bg-TealGreen h-12 w-48 items-center justify-center mx-auto"
                      onPress={() => {
                        setPage(() => page + 1);
                        getmechanics(false, page + 1);
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Text className="text-white w-full font-bold text-center">
                          Loading...
                        </Text>
                      ) : (
                        <Text className="text-white w-full font-bold text-center">
                          Load more
                        </Text>
                      )}
                    </Pressable>
                  );
                }
                return null;
              }}
            />
          </View>
        </View>

        {/* ========== Modals =========== */}

        {(reviewModal === "read" || reviewModal === "write") && (
          <Modal_R
            isTablet={isTablet}
            isDesktop={isDesktop}
            isMobile={isMobile}
            height={height}
            setReviewModal={setReviewModal}
            selectedMechanic={selectedMechanic}
            width={width}
            review={review}
            setReview={setReview}
            postReview={postReview}
            reviewModal={reviewModal}
            userId={userId}
          />
        )}

        {qr === false && userRole === "mechanic" && (
          <QrModal
            visible={true}
            onClose={() => setQr(true)}
            getItem={getItem}
          />
        )}

        {/* service display modal */}
        {serviceModal && (
          <ServiceModal
            onclose={() => setServiceModal(false)}
            serviceModal={serviceModal}
            selectedMechanic={selectedMechanic}
            isDesktop={isDesktop}
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default HomePage;
