import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../services/api";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../theme";

const ROLE_ROUTE_MAP = {
  "Admin": "Admin",
  "Sales Executive": "Sales",
  "Salesperson": "Sales",
  "Inspection Executive": "Inspection",
  "Vehicle Inspector": "Inspection",
  "Valuation Manager": "Valuation",
  "Inventory Manager": "Inventory",
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/login", { email, password });
      const { success, user, message } = response.data;
      const role = user?.role;

      if (!success) {
        Alert.alert("Login failed", message || "Invalid credentials");
        setLoading(false);
        return;
      }

      const targetRoute = ROLE_ROUTE_MAP[role];
      if (!targetRoute) {
        Alert.alert("Unknown role", role || "No role provided");
        setLoading(false);
        return;
      }

      navigation.replace(targetRoute);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={[styles.container, { alignSelf: "center", width: "100%", maxWidth: 500 }]}>
        <Text style={styles.title}>V_Promise Staff</Text>

      <View style={styles.formCard}>
        <TextInput
          placeholder="Email"
          placeholderTextColor={COLORS.placeholder || '#94A3B8'}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <View style={styles.passwordWrapper}>
          <TextInput
            placeholder="Password"
            placeholderTextColor={COLORS.placeholder || '#94A3B8'}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            style={[styles.input, styles.passwordInput]}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((prev) => !prev)}
            accessible
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={22}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Signing in..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: "stretch",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: TYPOGRAPHY.title,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SPACING.sm,
    padding: SPACING.sm + SPACING.xs,
    marginBottom: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: SPACING.xl,
    marginBottom: 0,
  },
  eyeButton: {
    position: "absolute",
    right: SPACING.sm,
    padding: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  buttonText: {
    color: COLORS.textLight,
    fontWeight: "700",
    fontSize: TYPOGRAPHY.body,
  },
  formCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: SPACING.ms,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
});
