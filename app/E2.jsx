import { SafeAreaView } from "react-native-safe-area-context";
import Profile from "./(tabs)/Profile";
import AppToast from "@/components/Toast";

const E2 = () => {
  return (
    <SafeAreaView className="flex-1" edges={['bottom']}>
      <AppToast/>
      <Profile />
    </SafeAreaView>
  );
};

export default E2;
