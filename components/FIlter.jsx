import { Pressable, ScrollView, View, Text } from "react-native";
import { useState } from "react";
import { Divider } from "react-native-paper";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/MaterialIcons";

const Filter = ({
  setIsFilterOpen,
  isMobile,
  isDesktop,
  isTablet,
  page = "mech",
  filterData,
  filterItems,
  setFilterItems,
}) => {
  const filters =
    page === "mech"
      ? ["Location", "Ratings", "Industry"]
      : ["Location", "Price Type", "Price", "Brand"];
  const [activeFilter, setActiveFilter] = useState("Location");

  const toggleFilter = (filter) =>
    setActiveFilter(activeFilter === filter ? null : filter);

  const toggleDistrictSelection = (prev, district) => {
    const alreadySelected = prev.selectedDistrict.includes(district);
    return {
      ...prev,
      selectedDistrict: alreadySelected
        ? prev.selectedDistrict.filter((d) => d !== district) // remove
        : [...prev.selectedDistrict, district], // add
    };
  };

  const handleRatingClick = (rating) => {
    // If the rating is already selected, deselect it
    if (filterItems.selectedRating === rating) {
      setFilterItems((prev) => ({
        ...prev,
        selectedRating: null,
      }));
    } else {
      setFilterItems((prev) => ({
        ...prev,
        selectedRating: rating,
      }));
    }
  };
  const toggleSelectedSubCategory = (prev, sub) => {
    const alreadySelected = prev.selectedSubCategory.includes(sub);
    const updatedSubCategory = alreadySelected
      ? prev.selectedSubCategory.filter((item) => item !== sub)
      : [...prev.selectedSubCategory, sub];

    return {
      ...prev,
      selectedSubCategory: updatedSubCategory,
    };
  };

  return (
    // <View
    //   className={`bg-gray-100 rounded-md p-3 shadow-md overflow-hidden   ${
    //     !isDesktop ? "z-50 flex-col max-w-[100vw] flex-1" : "flex-col h-full"
    //   }`}
    // >
    <View
      style={{
        height: "100%",
        position: !isDesktop ? "absolute" : "relative",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: isTablet ? "40%" : isDesktop ? "20%" : isMobile ? "100%" : null,
        zIndex: 999,
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: "#fff",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        overflow: "hidden",
      }}
    >
      {/* Close icon on mobile */}
      {!isDesktop && (
        <View className="w-full items-end mb-2">
          <MaterialIcons
            name="cancel"
            size={24}
            color="red"
            onPress={() => setIsFilterOpen(false)}
          />
        </View>
      )}

      {/* Left filter tabs */}
      <View
        className={`mb-4 ${
          !isDesktop ? "w-full flex-row flex-wrap" : "w-[150px]"
        }`}
      >
        {filters?.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => toggleFilter(filter)}
            className={`px-3 py-2 mb-2 rounded-md mr-2 ${
              activeFilter === filter ? "bg-red-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                activeFilter === filter ? "text-white" : "text-gray-800"
              }`}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Right filter panel */}
      <View
        className={`pl-4 ${!isDesktop ? "w-full flex-1" : "w-full flex-1"}`}
      >
        <View className="mb-4 flex-1">
          {/* location filter */}
          {activeFilter === "Location" && (
            <View className="bg-gray-200 flex-1 rounded-md p-3 space-y-3">
              <Text className="font-semibold text-md text-gray-900">
                Select State
              </Text>

              <ScrollView
                className={`${filterItems?.selectedState?.length > 0 ? "h-48" : "h-full"} mt-2`}
                nestedScrollEnabled
              >
                {filterItems?.selectedState?.length > 0 ? (
                  <Pressable
                    onPress={() =>
                      setFilterItems((prev) => ({
                        ...prev,
                        selectedState: "",
                        selectedDistrict: [],
                      }))
                    }
                    className="p-2 bg-gray-300 rounded-md flex-col gap-2"
                  >
                    <Text className="text-base font-bold">
                      {filterItems.selectedState}
                    </Text>
                    <Text className="text-sm font-semibold text-red-500 underline">
                      ← Change State
                    </Text>
                  </Pressable>
                ) : (
                  filterData?.locationData?.map((data) => (
                    <Pressable
                      key={data?.region}
                      onPress={() =>
                        setFilterItems((prev) => ({
                          ...prev,
                          selectedState: data.region,
                          selectedDistrict: [],
                        }))
                      }
                      className={`p-2 rounded-md mb-2 ${
                        filterItems?.selectedState === data?.region
                          ? "bg-gray-300"
                          : "bg-gray-100"
                      }`}
                    >
                      <Text className="text-base">{data?.region}</Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>

              {filterItems?.selectedState && (
                <>
                  <Divider className="my-2" />
                  <Text className="font-semibold text-base text-gray-800 mb-1">
                    Districts in {filterItems?.selectedState}
                  </Text>
                  <ScrollView nestedScrollEnabled style={{ height: "100%" }}>
                    {filterData?.locationData
                      ?.find(
                        (d) =>
                          d?.region?.toLowerCase().trim() ===
                          filterItems?.selectedState.toLowerCase().trim(),
                      )
                      ?.district?.map((district) => (
                        <Pressable
                          key={district}
                          onPress={() =>
                            setFilterItems((prev) =>
                              toggleDistrictSelection(prev, district),
                            )
                          }
                          className={`p-2 rounded-md mb-1 ${
                            filterItems?.selectedDistrict.includes(district)
                              ? "bg-gray-300"
                              : "bg-gray-100"
                          }`}
                        >
                          <Text className="text-sm">{district}</Text>
                        </Pressable>
                      ))}
                  </ScrollView>
                </>
              )}
            </View>
          )}
          {/* Ratings Filter */}
          {activeFilter === "Ratings" && (
            <View>
              <Text className="font-semibold text-gray-800 mb-4 text-lg">
                Select Rating
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Pressable
                    key={rating}
                    onPress={() => handleRatingClick(rating)}
                    className={`flex-row items-center px-3 py-1 rounded-md ${
                      filterItems.selectedRating === rating
                        ? "bg-[#F59E0B]"
                        : "bg-gray-200"
                    }`}
                    style={{
                      backgroundColor:
                        filterItems.selectedRating === rating
                          ? "#F59E0B"
                          : "#E5E7EB",
                    }}
                  >
                    <Icon
                      name="star-rate"
                      size={18}
                      color={
                        filterItems.selectedRating === rating
                          ? "#F2F2F2"
                          : "#F59E0B"
                      }
                    />

                    <Text
                      className={`ml-1 text-base ${
                        filterItems.selectedRating === rating
                          ? "text-white"
                          : ""
                      }`}
                    >
                      {rating}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* industry filter */}

          {activeFilter === "Industry" && (
            <ScrollView className="h-96 bg-gray-200 p-3 rounded-md">
              <Text className="font-semibold text-lg text-gray-800 mb-3">
                Select Industry
              </Text>
              {!filterItems.selectedIndustry &&
                filterData?.industryData?.map((ind) => (
                  <Pressable
                    key={ind}
                    onPress={() =>
                      setFilterItems((prev) => ({
                        ...prev,
                        selectedIndustry: ind.industry,
                      }))
                    }
                    className="p-2 mb-2 rounded-md bg-gray-100"
                  >
                    <Text className="text-base">
                      {ind?.industry?.charAt(0).toUpperCase() +
                        ind?.industry?.slice(1)}
                    </Text>
                  </Pressable>
                ))}

              {filterItems.selectedIndustry &&
                !filterItems.selectedCategory && (
                  <>
                    <Pressable
                      onPress={() => {
                        setFilterItems((prev) => ({
                          ...prev,
                          selectedIndustry: "",
                          setSelectedCategory: "",
                          selectedSuselectedSubCategory: "",
                        }));
                      }}
                      className="mb-2"
                    >
                      <Text className="text-sm underline text-red-600">
                        ← Back to Industries
                      </Text>
                    </Pressable>
                    <Text className="font-semibold text-base mb-2">
                      Categories in{" "}
                      {filterItems?.selectedIndustry?.charAt(0)?.toUpperCase() +
                        filterItems?.selectedIndustry?.slice(1)}
                    </Text>
                    {filterData?.industryData
                      ?.find(
                        (item) =>
                          item.industry === filterItems.selectedIndustry,
                      )
                      ?.category?.map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() =>
                            setFilterItems((prev) => ({
                              ...prev,
                              selectedCategory: cat,
                            }))
                          }
                          className={`p-2 mb-2 rounded-md ${
                            filterItems.selectedCategory === cat
                              ? "bg-gray-300"
                              : "bg-gray-100"
                          }`}
                        >
                          <Text className="text-sm">{cat}</Text>
                        </Pressable>
                      ))}
                  </>
                )}

              {filterItems.selectedIndustry && filterItems.selectedCategory && (
                <>
                  <Pressable
                    onPress={() => {
                      setFilterItems((prev) => ({
                        ...prev,
                        selectedCategory: "",
                        selectedSubCategory: "",
                      }));
                    }}
                    className="mb-2"
                  >
                    <Text className="text-sm underline text-gray-800">
                      ← Back to Categories
                    </Text>
                  </Pressable>
                  <Text className="font-semibold mb-2 text-base">
                    Subcategories in {filterItems?.selectedCategory}
                  </Text>
                  {filterData?.categoryData
                    ?.find((c) => c.category === filterItems.selectedCategory)
                    ?.subcategories?.map((sub) => (
                      <Pressable
                        key={sub}
                        onPress={() =>
                          setFilterItems((prev) =>
                            toggleSelectedSubCategory(prev, sub),
                          )
                        }
                        className={`p-2 mb-2 rounded-md ${
                          filterItems.selectedSubCategory?.includes(sub)
                            ? "bg-gray-300"
                            : "bg-gray-100"
                        }`}
                      >
                        <Text>{sub}</Text>
                      </Pressable>
                    ))}
                </>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

export default Filter;
