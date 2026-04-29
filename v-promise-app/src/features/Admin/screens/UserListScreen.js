import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { Pencil, Trash2, X } from "lucide-react-native";

import { Header } from "../../../components/Header";
import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../theme";
import api from "../../../services/api";

const UserListScreen = () => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const isFocused = useIsFocused();
  const responsivePadding = isLargeScreen ? SPACING.lg : SPACING.md;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, branchRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/branches")
      ]);
      
      if (userRes.data.success) setUsers(userRes.data.data);
      if (branchRes.data.success) setBranches(branchRes.data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused]);

  const handleStatusChange = async (userId, status) => {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      if (response.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status } : u))
        );
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update status");
    }
  };

  const handleEditSave = async () => {
    if (!editingUser.name || !editingUser.email) {
      Alert.alert("Error", "Name and Email are required");
      return;
    }

    try {
      const response = await api.put(`/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        branch_id: editingUser.branch_id
      });

      if (response.data.success) {
        Alert.alert("Success", "User updated successfully");
        setModalVisible(false);
        fetchData(); // Refresh list
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update user");
    }
  };

  const renderItem = ({ item }) => (
    <Card>
      <View style={styles.topRow}>
        <Text style={styles.name}>{item.name}</Text>
        <TouchableOpacity onPress={() => { setEditingUser(item); setModalVisible(true); }}>
          <Pencil size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.text}>Email: {item.email}</Text>
      <Text style={styles.text}>Role: {item.role}</Text>
      <Text style={styles.text}>Branch: {item.branch || "None"}</Text>

      <View style={styles.statusRow}>
        {["ACTIVE", "INACTIVE", "BLOCKED"].map((st) => {
          const selected = item.status === st;
          return (
            <TouchableOpacity
              key={st}
              onPress={() => handleStatusChange(item.id, st)}
              style={[styles.chip, selected && styles.selectedChip]}
            >
              <Text style={[styles.chipText, selected && styles.selectedChipText]}>{st}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="User Management" />
      <View style={[styles.container, { paddingHorizontal: responsivePadding }]}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        )}
      </View>

      {/* Edit User Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit User</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Input
                label="Full Name"
                value={editingUser?.name}
                onChangeText={(val) => setEditingUser({ ...editingUser, name: val })}
              />
              <Input
                label="Email Address"
                value={editingUser?.email}
                onChangeText={(val) => setEditingUser({ ...editingUser, email: val })}
              />
              <Input
                label="Role"
                value={editingUser?.role}
                onChangeText={(val) => setEditingUser({ ...editingUser, role: val })}
              />
              {/* Note: In a real app, role and branch would be dropdowns */}
              
              <Button title="Save Changes" onPress={handleEditSave} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UserListScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  listContainer: { paddingVertical: SPACING.md },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm },
  name: { fontSize: 16, fontWeight: "600", color: COLORS.textPrimary },
  text: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  statusRow: { flexDirection: "row", marginTop: SPACING.sm },
  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, marginRight: 6 },
  selectedChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 11, color: COLORS.textSecondary },
  selectedChipText: { color: "#fff", fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
});