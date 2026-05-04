import Entypo from "@expo/vector-icons/Entypo";
import FadeSlideView from "@/components/FadeSlideView";
import { Pressable, Text } from "react-native";

const DeleteIcon = ({deleteIcon,type,item,postDelete,setDeleteIcon,isDesktop}) => {
  return (
    <>
      {deleteIcon === item?._id && (
        <Pressable
          onPress={() => postDelete(item._id)}
          className=" absolute right-12 top-4 px-4 py-2 bg-red-200 rounded-md text-xs"
        >
          <FadeSlideView>
            <Text className="text-red-500">Delete</Text>
          </FadeSlideView>
        </Pressable>
      )}
      {type !== "user_visit" && (
        <Entypo
          onPress={() => setDeleteIcon((prev) => (!prev ? item?._id : ""))}
          name="dots-three-vertical"
          size={16}
          color="black"
          className={`absolute right-6 ${isDesktop ? 'top-4' : 'top-[50%]'}`}
        />
      )}
    </>
  );
};

export default DeleteIcon
