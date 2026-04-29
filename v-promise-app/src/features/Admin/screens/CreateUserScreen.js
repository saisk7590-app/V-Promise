import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useIsFocused } from "@react-navigation/native";

import { Header } from "../../../components/Header";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { Dropdown } from "../../../components/Dropdown";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../theme";
import api from "../../../services/api";

const ROLES = [
  { label: "Admin", value: "ADMIN" },
  { label: "Sales Executive", value: "SALES" },
  { label: "Inspection Executive", value: "INSPECTION" },
  { label: "Valuation Manager", value: "VALUATION" },
  { label: "Inventory Manager", value: "INVENTORY" },
];

const CreateUserScreen = () => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const responsivePadding = isLargeScreen ? SPACING.lg : SPACING.md;
  const containerMaxWidth = isLargeScreen ? 600 : "100%";

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/branches");
      if (response.data.success) {
        setBranches(response.data.data.map(b => ({ 
          label: b.name, 
          value: b.id 
        })));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchBranches();
  }, [isFocused]);

  const handleCreate = async () => {
    if (!name || !email || !password || !selectedRole) {
      Alert.alert("Error", "Please fill in Name, Email, Password, and Role");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        email,
        password,
        role: selectedRole,
        branch_id: selectedBranch,
      };

      const response = await api.post("/admin/users", payload);

      if (response.data.success) {
        Alert.alert("Success", "User created successfully!", [
          {
            text: "OK",
            onPress: () => {
              setName("");
              setEmail("");
              setPassword("");
              setSelectedRole(null);
              setSelectedBranch(null);
              navigation.navigate("Users");
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Create User" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingHorizontal: responsivePadding, maxWidth: containerMaxWidth },
        ]}
        bounces={false}
      >
        <View style={styles.formContainer}>
          <Input 
            label="Full Name" 
            placeholder="e.g. John Doe" 
            value={name} 
            onChangeText={setName} 
          />
          
          <Input
            label="Email Address"
            placeholder="e.g. john@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <Input
            label="Password"
            placeholder="Min 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.dropdownGroup}>
            <Text style={styles.label}>Assign Role</Text>
            <Dropdown
              items={ROLES}
              selectedValue={ROLES.find(r => r.value === selectedRole)?.label || "Select Role"}
              onValueChange={(label) => {
                const role = ROLES.find(r => r.label === label);
                if (role) setSelectedRole(role.value);
              }}
            />
          </View>

          <View style={styles.dropdownGroup}>
            <Text style={styles.label}>Assign Branch</Text>
            <Dropdown
              items={[{ label: "None / Head Office", value: null }, ...branches]}
              selectedValue={
                selectedBranch 
                  ? branches.find(b => b.value === selectedBranch)?.label 
                  : "None / Head Office"
              }
              onValueChange={(label) => {
                if (label === "None / Head Office") {
                  setSelectedBranch(null);
                } else {
                  const branch = branches.find(b => b.label === label);
                  if (branch) setSelectedBranch(branch.value);
                }
              }}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={submitting ? "Creating..." : "Create User account"}
              onPress={handleCreate}
              disabled={submitting}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateUserScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingVertical: SPACING.lg,
    alignSelf: "center",
    width: "100%",
  },
  formContainer: {
    gap: SPACING.md,
  },
  dropdownGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  buttonContainer: {
    marginTop: SPACING.md,
  },
});