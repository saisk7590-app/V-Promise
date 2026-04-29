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
import { Pencil, X, Check } from "lucide-react-native";

import { Header } from "../../../components/Header";
import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input";
import { Button } from "../../../components/Button";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../theme";
import api from "../../../services/api";

const BranchScreen = () => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 600;

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");

  const isFocused = useIsFocused();
  const responsivePadding = isLargeScreen ? SPACING.lg : SPACING.md;

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/branches");
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchBranches();
  }, [isFocused]);

  const handleAddBranch = async () => {
    if (!newName) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/admin/branches", {
        name: newName,
        city: newCity
      });

      if (response.data.success) {
        Alert.alert("Success", "Branch created successfully");
        setNewName("");
        setNewCity("");
        fetchBranches();
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to add branch");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBranch = async () => {
    if (!editingBranch.name) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      const response = await api.put(`/admin/branches/${editingBranch.id}`, {
        name: editingBranch.name,
        city: editingBranch.city
      });

      if (response.data.success) {
        Alert.alert("Success", "Branch updated successfully");
        setModalVisible(false);
        fetchBranches();
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update branch");
    }
  };

  const handleStatusToggle = async (branchId, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const response = await api.patch(`/admin/branches/${branchId}/status`, {
        status: nextStatus
      });

      if (response.data.success) {
        setBranches((prev) =>
          prev.map((b) => (b.id === branchId ? { ...b, status: nextStatus } : b))
        );
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to toggle status");
    }
  };

  const renderItem = ({ item }) => (
    <Card>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.city}>{item.city || "No City Specified"}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setEditingBranch(item);
            setModalVisible(true);
          }}
        >
          <Pencil size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status: </Text>
        <TouchableOpacity
          onPress={() => handleStatusToggle(item.id, item.status)}
          style={[
            styles.statusChip,
            item.status === "ACTIVE" ? styles.activeChip : styles.inactiveChip,
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Branch Management" />
      <View style={[styles.container, { paddingHorizontal: responsivePadding }]}>
        
        {/* Quick Add Form */}
        <View style={styles.addForm}>
          <Text style={styles.sectionTitle}>Add New Branch</Text>
          <Input placeholder="Branch Name" value={newName} onChangeText={setNewName} />
          <Input placeholder="City" value={newCity} onChangeText={setNewCity} />
          <Button title="Add Branch" onPress={handleAddBranch} />
        </View>

        <Text style={styles.sectionTitle}>Existing Branches</Text>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={branches}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
          />
        )}
      </View>

      {/* Edit Branch Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Branch</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Input
                label="Branch Name"
                value={editingBranch?.name}
                onChangeText={(val) => setEditingBranch({ ...editingBranch, name: val })}
              />
              <Input
                label="City"
                value={editingBranch?.city}
                onChangeText={(val) => setEditingBranch({ ...editingBranch, city: val })}
              />
              <Button title="Update Branch" onPress={handleUpdateBranch} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BranchScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  addForm: { backgroundColor: "#fff", padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.lg, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.sm },
  listContainer: { paddingBottom: SPACING.xl },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm },
  name: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },
  city: { fontSize: 13, color: COLORS.textSecondary },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  statusLabel: { fontSize: 12, color: COLORS.textSecondary },
  statusChip: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 12 },
  activeChip: { backgroundColor: "#DCFCE7" },
  inactiveChip: { backgroundColor: "#F3F4F6" },
  statusText: { fontSize: 10, fontWeight: "600", color: COLORS.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
});