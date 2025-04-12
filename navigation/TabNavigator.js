import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";
import CoverLetterScreen from "../screens/Home/CoverLetterScreen";
import { COLORS, SCREEN_NAMES } from "../constants";
import ProfileScreen from "../screens/Home/ProfileScreen";
import InterviewScreen from "../screens/Home/InterviewScreen"; 

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
  return(  
  <Tab.Navigator 
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
            const icons = {
              [SCREEN_NAMES.COVER_LETTER]: "document-text",
              [SCREEN_NAMES.INTERVIEW]: "chatbubbles",
              [SCREEN_NAMES.PROFILE]: "person"
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.PRIMARY,
          tabBarInactiveTintColor: COLORS.INACTIVE,
      })}
    >
      <Tab.Screen name={SCREEN_NAMES.COVER_LETTER} component={CoverLetterScreen} />
      <Tab.Screen name={SCREEN_NAMES.INTERVIEW} component={InterviewScreen} />
      <Tab.Screen name={SCREEN_NAMES.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, alignItems: "center", justifyContent: "center" }
  });
  
export default TabNavigator;