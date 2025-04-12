import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Lock, Eye, EyeOff } from "lucide-react-native";

const PasswordInput = ({ value, onChangeText }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <Lock size={20} color="#9ca3af" />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6b7280"
        secureTextEntry={!passwordVisible}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
        {passwordVisible ? <Eye size={20} color="#6b7280" /> : <EyeOff size={20} color="#6b7280" />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
    marginLeft: 8,
  },
});

export default PasswordInput;
