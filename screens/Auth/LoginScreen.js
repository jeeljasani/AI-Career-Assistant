import React, { useState,useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert
} from "react-native";
import { Mail, Lock } from "lucide-react-native";
import CustomButton from "../../components/CustomButton";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import PasswordInput from "../../components/PasswordInput";
import { AuthContext } from "../../context/AuthContext";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  // Modify the below function to handle login
  const handlePress = async () => {
    if (!email || !password) {
        Alert.alert("Error", "Please enter both email and password.");
        return;
      }
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Success", "Login successful!");
        const userData = { email }; // Store user email or token
        login(userData);
        navigation.replace("Home"); // Navigate to Home after login
      } catch (error) {
        let errorMessage = "An unexpected error occurred. Please try again.";

        if (error.code === "auth/invalid-credential") {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.code === "auth/user-not-found") {
          errorMessage = "No account found with this email.";
        } else if (error.code === "auth/wrong-password") {
          errorMessage = "Incorrect password.";
        } else if (error.code === "auth/too-many-requests") {
          errorMessage = "Too many failed attempts. Try again later.";
        }
    
        Alert.alert("Login Failed", errorMessage);
      }
      setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with Dynamic Margin */}
        <View style={styles.header}>
          <Text style={styles.title}>Sign in to Your Account</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
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
          <PasswordInput value={password} onChangeText={setPassword} />
          <CustomButton 
            title="Login" 
            onPress={handlePress} 
            iconName="login"
            backgroundColor="#000000"
            loading={loading} // Shows loader when pressed
          />

          {/* Sign Up Link */}
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text style={styles.signUpText} onPress={() => navigation.replace("Signup")}>Sign Up now</Text>
          </Text>
        </View>
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
    marginTop: 30, // Ensures spacing for notched screens
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
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 15,
    textAlign: "center",
    color: "#6b7280",
  },
  signUpText: {
    color: "#2563eb",
    fontWeight: "bold",
  },
});

export default LoginScreen;
