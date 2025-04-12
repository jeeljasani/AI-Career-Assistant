import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Mail, Lock, User } from "lucide-react-native";
import CustomButton from "../../components/CustomButton";
import { auth } from "../../config/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import PasswordInput from "../../components/PasswordInput";

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle the signup process
  const handleSignup = async() => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created successfully!");
      navigation.replace("Login"); // Navigate to Home screen
    } catch (error) {
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already in use. Try logging in.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      }

      Alert.alert("Signup Failed", errorMessage);
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Account</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputWrapper}>
            <User size={20} color="#9ca3af" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#6b7280"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#9ca3af" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#6b7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password Input */}
          {/* <View style={styles.inputWrapper}>
            <Lock size={20} color="#9ca3af" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#6b7280"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View> */}
          <PasswordInput value={password} onChangeText={setPassword} />
          

          {/* Signup Button */}
          <CustomButton
            title="Create Account"
            onPress={handleSignup}
            iconName="account-plus"
            backgroundColor="#000000"
            loading={loading} // Shows loader when pressed
          />

          {/* Login Link */}
          <Text style={styles.footerText}>
            You already have an account?{" "}
            <Text
              style={styles.loginText}
              onPress={() => navigation.replace("Login")}
            >
              Log in now
            </Text>
          </Text>
        </View>

        {/* Terms & Conditions */}
        <Text style={styles.termsText}>
          By registering, you agree with the {" "} 
          <Text style={styles.termsBold}>Terms & Conditions</Text> of the App
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#2563eb",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  formContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 15,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  footerText: {
    marginTop: 15,
    textAlign: "center",
    color: "#6b7280",
  },
  loginText: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  termsText: {
    marginTop: 20,
    padding: 10,
    textAlign: "center",
    fontSize: 12,
    color: "#d1d5db",
  },
  termsBold: {
    fontWeight: "bold",
    padding: 10,
    color: "#000000", 
    textAlign: "center",
    fontSize: 12,
  },
});

export default SignupScreen;
