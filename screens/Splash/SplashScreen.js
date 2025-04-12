import React, { useEffect,useContext } from "react";
import { View, Text } from "react-native";
import { MessageCircle, FileText, Briefcase } from "lucide-react-native";
import { AuthContext } from "../../context/AuthContext";

const SplashScreen = ({ navigation }) => {
  const { user, isLoading } = useContext(AuthContext);
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`user is ${user}`);
      if (user) {
        navigation.replace("Home"); // Navigate to Home after 3 seconds
      }else{
        navigation.replace("Login"); // Navigate to Login after 3 seconds
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-blue-800 px-6">
      {/* Logo/Icon */}
      <View className="relative mb-6">
        <View className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
          <Briefcase size={48} color="#2563EB" />
        </View>
        <View className="absolute -right-2 -top-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Text className="text-white font-bold">AI</Text>
        </View>
      </View>

      {/* Title */}
      <View className="text-center">
        <Text className="text-3xl font-bold text-white mb-2">Career AI</Text>
        <Text className="text-blue-100 text-lg">Your Professional Growth Partner</Text>
      </View>

      {/* Features */}
      <View className="w-full max-w-xs mt-6">
        <View className="flex-row items-center space-x-3 bg-white/10 p-3 rounded-lg mb-3">
          <FileText color="white" size={24} />
          <Text className="text-white">Cover Letter Generator</Text>
        </View>
        <View className="flex-row items-center space-x-3 bg-white/10 p-3 rounded-lg">
          <MessageCircle color="white" size={24} />
          <Text className="text-white">Interview Preparation</Text>
        </View>
      </View>
    </View>
  );
};

export default SplashScreen;
