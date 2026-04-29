import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  Modal,
  Alert,
  Pressable
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from "expo-camera";
import { Header } from "../../../components/Header";
import api from "../../../services/api";
import { useMasterData } from "../../../hooks/useMasterData";
import { COLORS } from "../../../theme/colors";
import { SPACING } from "../../../theme/spacing";
import { TYPOGRAPHY } from "../../../theme/typography";
import { Card } from "../../../components/Card";
import { CollapsibleCard } from "../../../components/CollapsibleCard";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Dropdown } from "../../../components/Dropdown";

const initialForm = {
  customerName: "",
  primaryMobile: "",
  secondaryMobile: "",
  email: "",
  branchId: "",
  branchName: "",
  vehicleType: "",
  vehicleName: "",
  purchaseType: "",
  modelYear: "",
  registrationNumber: "",
  speedometerReading: "",
  outlookCondition: "",
  engineCondition: "",
  overallCondition: "",
  nocStatus: "",
  challansPending: false,
  exchangeValue: "",
  finalCreditNoteValue: ""
};

export default function SalesExecutive() {
  const cameraRef = useRef(null);
  const { data: masterData, loading: masterLoading } = useMasterData();

  const [form, setForm] = useState(initialForm);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState("customer");

  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [branchModalVisible, setBranchModalVisible] = useState(false);

  const resetAll = () => {
    setForm(initialForm);
    setCapturedImages([]);
  };

  useEffect(() => {
    fetchBranches();
    Camera.requestCameraPermissionsAsync();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/branches?t=${Date.now()}`);
      setBranches(data || []);
    } catch {
      Alert.alert("Error", "Unable to load branches");
    }
    setLoading(false);
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleSection = (section) => {
    setActiveSection(prev => (prev === section ? null : section));
  };

  const handleBranchSelect = (branch) => {
    setForm(prev => ({
      ...prev,
      branchId: branch.id,
      branchName: branch.branch_name
    }));
    if (branch.id !== "manual") {
      setBranchModalVisible(false);
    }
  };

  const handleStartCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission required");
      return;
    }
    setCameraVisible(true);
  };

  const handleCapture = async () => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7
        });
        setCapturedImages(prev => [...prev, photo]);
        setCameraVisible(false);
      }
    } catch (err) {
      Alert.alert("Camera error", "Failed to capture image");
    }
  };

  const removeImage = (uri) => {
    setCapturedImages(prev => prev.filter(img => img.uri !== uri));
  };

  const handleSubmit = async () => {
    const customerName = form.customerName.trim();
    const primaryMobile = form.primaryMobile.trim();
    const secondaryMobile = form.secondaryMobile.trim();
    const email = form.email.trim();
    const branchName = form.branchName.trim();
    const vehicleName = form.vehicleName.trim();

    if (!customerName || !primaryMobile || (!form.branchId || (form.branchId === "manual" && !branchName))) {
      Alert.alert("Missing Fields", "Customer name, mobile and branch required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      const prepared = {
        ...form,
        customerName,
        primaryMobile,
        branchName,
        email,
        vehicleName
      };

      Object.keys(prepared).forEach(key => {
        // Secondary mobile is optional - omit entirely when not provided.
        if (key === "secondaryMobile" && !secondaryMobile) return;
        const value = key === "secondaryMobile" ? secondaryMobile : prepared[key];
        payload.append(key, String(value));
      });

      capturedImages.forEach((img, i) => {
        payload.append("images", {
          uri: img.uri,
          name: `vehicle-${i}.jpg`,
          type: "image/jpeg"
        });
      });

      const res = await api.post("/api/vehicle-intake", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        Alert.alert("Success", "Vehicle Intake Saved Successfully (ID: " + res.data.vehicleId + ")");
        resetAll();
      }
    } catch {
      Alert.alert("Error", "Submission failed");
    }
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="Vehicle Intake" />
      <View style={[styles.container, { alignSelf: 'center', width: '100%', maxWidth: 800 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

        <CollapsibleCard
          title="1. Customer Details"
          expanded={activeSection === "customer"}
          onToggle={() => toggleSection("customer")}
        >
          <Input
            label="Customer Name"
            placeholder="Enter Name"
            value={form.customerName}
            onChangeText={(t) => handleChange("customerName", t)}
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: SPACING.sm }}>
              <Input
                label="Primary Mobile"
                placeholder="Mobile"
                keyboardType="phone-pad"
                value={form.primaryMobile}
                onChangeText={(t) => handleChange("primaryMobile", t)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Secondary Mobile (optional)"
                placeholder="Alt Mobile (leave blank if not given)"
                keyboardType="phone-pad"
                value={form.secondaryMobile}
                onChangeText={(t) => handleChange("secondaryMobile", t)}
              />
            </View>
          </View>
          <Input
            label="Email (optional)"
            placeholder="name@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(t) => handleChange("email", t)}
          />

          <Text style={styles.label}>Branch</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setBranchModalVisible(true)}
          >
            <Text style={{ color: form.branchName ? COLORS.textPrimary : COLORS.textSecondary }}>
              {form.branchName || "Select Branch"}
            </Text>
          </TouchableOpacity>
        </CollapsibleCard>

        <CollapsibleCard
          title="2. Vehicle Details"
          expanded={activeSection === "vehicle"}
          onToggle={() => toggleSection("vehicle")}
        >
          <Dropdown
            label="Vehicle Type"
            selectedValue={form.vehicleType}
            onValueChange={(v) => handleChange("vehicleType", v)}
            items={[{ label: "Select Type", value: "" }, ...masterData.vehicleTypes]}
          />
          <Input
            label="Vehicle Name / Model"
            placeholder="e.g. Hyundai i20, Pulsar"
            value={form.vehicleName}
            onChangeText={(t) => handleChange("vehicleName", t)}
          />
          <Dropdown
            label="Purchase Type"
            selectedValue={form.purchaseType}
            onValueChange={(v) => handleChange("purchaseType", v)}
            items={[{ label: "Select Type", value: "" }, ...masterData.purchaseTypes]}
          />
          
          <Input
            label="Model Year"
            placeholder="e.g. 2018"
            keyboardType="numeric"
            value={form.modelYear}
            onChangeText={(t) => handleChange("modelYear", t)}
          />
          <Input
            label="Registration Number"
            placeholder="e.g. MH01AB1234"
            value={form.registrationNumber}
            onChangeText={(t) => handleChange("registrationNumber", t)}
          />
          <Input
            label="Speedometer Reading"
            placeholder="e.g. 45000"
            keyboardType="numeric"
            value={form.speedometerReading}
            onChangeText={(t) => handleChange("speedometerReading", t)}
          />

          <Dropdown
            label="Outlook Condition"
            selectedValue={form.outlookCondition}
            onValueChange={(v) => handleChange("outlookCondition", v)}
            items={[{ label: "Select Condition", value: "" }, ...masterData.conditions]}
          />
          <Dropdown
            label="Engine Condition"
            selectedValue={form.engineCondition}
            onValueChange={(v) => handleChange("engineCondition", v)}
            items={[{ label: "Select Condition", value: "" }, ...masterData.conditions]}
          />
          <Dropdown
            label="Overall Condition"
            selectedValue={form.overallCondition}
            onValueChange={(v) => handleChange("overallCondition", v)}
            items={[{ label: "Select Condition", value: "" }, ...masterData.conditions]}
          />
          
          <Input
            label="NOC Status"
            placeholder="Status"
            value={form.nocStatus}
            onChangeText={(t) => handleChange("nocStatus", t)}
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Challans Pending</Text>
            <Switch
              value={form.challansPending}
              onValueChange={(v) => handleChange("challansPending", v)}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
            />
          </View>

          <Input
            label="Exchange Value"
            placeholder="₹"
            keyboardType="numeric"
            value={form.exchangeValue}
            onChangeText={(t) => handleChange("exchangeValue", t)}
          />
          <Input
            label="Final Credit Note Value"
            placeholder="₹"
            keyboardType="numeric"
            value={form.finalCreditNoteValue}
            onChangeText={(t) => handleChange("finalCreditNoteValue", t)}
          />
        </CollapsibleCard>

        <CollapsibleCard
          title="3. Upload Images"
          expanded={activeSection === "images"}
          onToggle={() => toggleSection("images")}
        >
          <Button title="Open Camera" onPress={handleStartCamera} type="outline" style={{ marginBottom: SPACING.md }} />
          
          <ScrollView horizontal style={{ marginTop: SPACING.sm }}>
            {capturedImages.map((img) => (
              <View key={img.uri} style={styles.previewBox}>
                <Image source={{ uri: img.uri }} style={styles.preview} />
                <TouchableOpacity onPress={() => removeImage(img.uri)}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </CollapsibleCard>

        <Button
          title="Submit Intake"
          onPress={handleSubmit}
          loading={submitting}
          style={styles.submitBtn}
        />
      </ScrollView>

      {/* BRANCH MODAL */}
      <Modal visible={branchModalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Branch</Text>
              <TouchableOpacity onPress={fetchBranches} disabled={loading}>
                <Text style={styles.refreshBtn}>{loading ? "Refreshing..." : "Refresh List"}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Pressable
                onPress={() => handleBranchSelect({ id: "manual", branch_name: "Enter Manually" })}
                style={[styles.branchItem, styles.manualEntry]}
              >
                <Text style={{ color: COLORS.primary, fontWeight: "bold", fontSize: TYPOGRAPHY.body }}>+ Enter Manually</Text>
              </Pressable>

              {branches.map(b => {
                const isSelected = form.branchId === b.id;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => handleBranchSelect(b)}
                    style={[styles.branchItem, isSelected && styles.branchItemSelected]}
                  >
                    <Text style={[styles.listText, isSelected && styles.listTextSelected]}>{b.branch_name}</Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>

            {form.branchId === "manual" && (
              <View style={{ marginTop: SPACING.md }}>
                <Input
                  label="Branch Name"
                  placeholder="Type branch name..."
                  value={form.branchName === "Enter Manually" ? "" : form.branchName}
                  onChangeText={(t) => setForm(prev => ({ ...prev, branchName: t }))}
                  autoFocus
                />
              </View>
            )}

            <View style={{ flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg }}>
              <Button title="Cancel" onPress={() => setBranchModalVisible(false)} type="danger" style={{ flex: 1 }} />
              <Button title="Done" onPress={() => setBranchModalVisible(false)} type="primary" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* CAMERA MODAL */}
      <Modal visible={cameraVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            ref={(ref) => cameraRef.current = ref}
          />
          <View style={styles.cameraControls}>
            <Button title="Cancel" onPress={() => setCameraVisible(false)} type="danger" style={{ flex: 1, marginRight: SPACING.xl }} />
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
          </View>
        </View>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  title: { fontSize: TYPOGRAPHY.title, fontWeight: "bold", marginBottom: SPACING.lg, color: COLORS.textPrimary },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  label: { marginBottom: SPACING.xs, fontWeight: "500", color: COLORS.textPrimary, fontSize: TYPOGRAPHY.small },
  dropdownButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: SPACING.sm,
  },
  submitBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl * 2,
    backgroundColor: COLORS.success,
  },
  previewBox: { marginRight: SPACING.md, alignItems: "center" },
  preview: { width: 100, height: 100, borderRadius: 8 },
  remove: { color: COLORS.danger, marginTop: 4, fontSize: TYPOGRAPHY.small - 2, fontWeight: "600" },
  modalBg: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: 16,
    maxHeight: "80%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: TYPOGRAPHY.subtitle, fontWeight: "bold", color: COLORS.textPrimary },
  refreshBtn: { color: COLORS.primary, fontWeight: "600" },
  branchItem: {
    paddingVertical: SPACING.ms,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginBottom: 2,
  },
  branchItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary,
  },
  manualEntry: {
    backgroundColor: '#F0F7FF',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: SPACING.sm,
  },
  listText: { fontSize: TYPOGRAPHY.body, color: COLORS.textPrimary },
  listTextSelected: { color: COLORS.primary, fontWeight: '600' },
  checkmark: { fontSize: TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '700' },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#000",
  },
});
