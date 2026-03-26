import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from "@react-navigation/native";
import api from "../../../services/api";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../theme";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/login", { email, password });
      const { success, role, message } = response.data;

      if (!success) {
        Alert.alert("Login failed", message || "Invalid credentials");
        setLoading(false);
        return;
      }

      switch (role) {
        case "Admin":
          navigation.replace("Admin");
          break;
        case "Sales Executive":
          navigation.replace("Sales");
          break;
        case "Inspection Executive":
          navigation.replace("Inspection");
          break;
        case "Valuation Manager":
          navigation.replace("Valuation");
          break;
        case "Inventory Manager":
          navigation.replace("Inventory");
          break;
        default:
          Alert.alert("Unknown role", role);
      }
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

        <TextInput
          placeholder="Password"
          placeholderTextColor={COLORS.placeholder || '#94A3B8'}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

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
  button: {
    backgroundColor: COLORS.accent,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    alignItems: "center",
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
