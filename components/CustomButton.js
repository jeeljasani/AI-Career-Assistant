import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Icon library

const CustomButton = ({
  title,
  onPress,
  backgroundColor = "#6200ee",
  textColor = "#fff",
  iconName, // MaterialCommunityIcons name
  iconSize = 20,
  iconColor = "#fff",
  width = "100%",
  borderRadius = 25,
  fontSize = 16,
  fontWeight = "bold",
  loading = false, // New loading state
}) => {
  const [scaleValue] = useState(new Animated.Value(1));

  // Press Animation Effect
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPress && onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor, width, borderRadius },
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <>
            {iconName && <Icon name={iconName} size={iconSize} color={iconColor} style={styles.icon} />}
            <Text style={[styles.text, { color: textColor, fontSize, fontWeight }]}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    elevation: 3, // Shadow effect for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  icon: {
    marginRight: 8,
  },
});

export default CustomButton;
