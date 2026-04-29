import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Dropdown } from "../../../components/Dropdown";

const initialForm = {
  vehicleId: "",
  registrationNumber: "",
  engineHealth: "",
  outlook: "",
  structuralCondition: "",
  mechanicalCondition: "",
  electricalCondition: "",
  remarks: ""
};

export default function InspectionExecutive() {
  const cameraRef = useRef(null);
  const { data: masterData, loading: masterLoading } = useMasterData();
  
  const [form, setForm] = useState(initialForm);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);

  useEffect(() => {
    fetchPendingVehicles();
    Camera.requestCameraPermissionsAsync();
  }, []);

  const fetchPendingVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/vehicles-pending?t=${Date.now()}`);
      setVehicles(data || []);
    } catch (err) {
      Alert.alert("Error", "Unable to load pending vehicles");
    }
    setLoading(false);
  };

  const handleVehicleSelect = (vehicle) => {
    setForm(prev => ({
      ...prev,
      vehicleId: vehicle.id,
      registrationNumber: vehicle.registration_number,
      vehicleName: vehicle.vehicle_name
    }));
    setVehicleModalVisible(false);
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
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
      Alert.alert("Camera Error", "Failed to capture image");
    }
  };

  const removeImage = (uri) => {
    setCapturedImages(prev => prev.filter(img => img.uri !== uri));
  };

  const handleSubmit = async () => {
    if (!form.vehicleId) {
      Alert.alert("Error", "Please select a vehicle");
      return;
    }
    if (capturedImages.length === 0) {
      Alert.alert("Error", "Please capture at least one image");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("vehicleId", String(form.vehicleId));
      payload.append("engineHealth", form.engineHealth);
      payload.append("outlook", form.outlook);
      payload.append("structuralCondition", form.structuralCondition);
      payload.append("mechanicalCondition", form.mechanicalCondition);
      payload.append("electricalCondition", form.electricalCondition);
      payload.append("remarks", form.remarks);

      capturedImages.forEach((img, i) => {
        payload.append("images", {
          uri: img.uri,
          name: `inspection_${i}.jpg`,
          type: "image/jpeg"
        });
      });

      const res = await api.post("/api/vehicle-inspection", payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        Alert.alert("Success", "Inspection submitted successfully");
        setForm(initialForm);
        setCapturedImages([]);
        fetchPendingVehicles();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit inspection");
    }
    setSubmitting(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Header title="Vehicle Inspection" />
      <View style={[styles.container, { alignSelf: 'center', width: '100%', maxWidth: 800 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

        <Card>
          <Text style={styles.label}>Select Pending Vehicle</Text>
          <TouchableOpacity
            style={styles.vehicleSelector}
            onPress={() => setVehicleModalVisible(true)}
          >
            <Text style={styles.vehicleSelectorText}>
              {form.vehicleName ? `${form.vehicleName} (${form.registrationNumber})` : (form.registrationNumber || "Choose Vehicle")}
            </Text>
          </TouchableOpacity>

          <Dropdown
            label="Engine Health"
            selectedValue={form.engineHealth}
            onValueChange={(v) => handleChange("engineHealth", v)}
            items={[{ label: "Select Condition", value: "" }, ...masterData.conditions]}
          />
          <Dropdown
            label="Outlook"
            selectedValue={form.outlook}
            onValueChange={(v) => handleChange("outlook", v)}
            items={[{ label: "Select Condition", value: "" }, ...masterData.conditions]}
          />
          <Dropdown
            label="Structural Condition"
            selectedValue={form.structuralCondition}
            onValueChange={(v) => handleChange("structuralCondition", v)}
            items={[{ label: "Select Condition", value: "" }, ...masterData.conditions]}
          />
          <Dropdown
            label="Mechanical Condition"
            selectedValue={form.mechanicalCondition}
            onValueChange={(v) => handleChange("mechanicalCondition", v)}
            items={[{ label: "Select Condition", value: "" }, ...masterData.conditions]}
          />
          <Dropdown
            label="Electrical Condition"
            selectedValue={form.electricalCondition}
            onValueChange={(v) => handleChange("electricalCondition", v)}
            items={[{ label: "Select Condition", value: "" }, ...masterData.conditions]}
          />

          <Input
            label="Remarks (Optional)"
            placeholder="Enter any additional remarks..."
            multiline
            value={form.remarks}
            onChangeText={(t) => handleChange("remarks", t)}
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Inspection Images</Text>
          <Button title="Capture Image" onPress={handleStartCamera} type="outline" style={{ marginBottom: SPACING.md }} />
          
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
        </Card>

        <Button
          title="Submit Inspection"
          onPress={handleSubmit}
          loading={submitting}
          style={{ marginBottom: SPACING.xl * 2 }}
        />
      </ScrollView>

      {/* Vehicle Selection Modal */}
      <Modal visible={vehicleModalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pending Vehicles</Text>
              <TouchableOpacity onPress={fetchPendingVehicles}>
                <Text style={styles.refreshBtn}>{loading ? "..." : "Refresh"}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {vehicles.map(v => (
                <Pressable
                  key={v.id}
                  style={styles.listItem}
                  onPress={() => handleVehicleSelect(v)}
                >
                  <Text style={styles.listText}>{v.vehicle_name || "Unknown Vehicle"}</Text>
                  <Text style={styles.listSubText}>{v.registration_number} • {v.vehicle_type} - {v.model_year}</Text>
                </Pressable>
              ))}
              {vehicles.length === 0 && !loading && (
                <Text style={styles.emptyText}>No vehicles pending inspection</Text>
              )}
            </ScrollView>
            <Button title="Close" onPress={() => setVehicleModalVisible(false)} type="danger" style={{ marginTop: SPACING.lg }} />
          </View>
        </View>
      </Modal>

      {/* Camera Modal */}
      <Modal visible={cameraVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            ref={(ref) => cameraRef.current = ref}
          />
          <View style={styles.cameraControls}>
            <Button title="Cancel" onPress={() => setCameraVisible(false)} type="danger" style={{ flex: 0.4 }} />
            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ flex: 0.4 }} />
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
  sectionTitle: { fontSize: TYPOGRAPHY.subtitle, fontWeight: "600", marginBottom: SPACING.md, color: COLORS.textPrimary },
  label: { marginBottom: SPACING.xs, fontWeight: "500", color: COLORS.textPrimary, fontSize: TYPOGRAPHY.small },
  vehicleSelector: {
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
  },
  vehicleSelectorText: { fontSize: TYPOGRAPHY.body, color: COLORS.textPrimary },
  previewBox: { marginRight: SPACING.sm, alignItems: "center" },
  preview: { width: 100, height: 100, borderRadius: 8 },
  remove: { color: COLORS.danger, marginTop: 5, fontSize: TYPOGRAPHY.small - 2, fontWeight: "600" },
  modalBg: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
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
  },
  modalTitle: { fontSize: TYPOGRAPHY.subtitle, fontWeight: "bold" },
  refreshBtn: { color: COLORS.primary, fontWeight: "600" },
  listItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listText: { fontSize: TYPOGRAPHY.body, fontWeight: "500" },
  listSubText: { fontSize: TYPOGRAPHY.small, color: COLORS.textSecondary, marginTop: 4 },
  emptyText: { textAlign: "center", padding: SPACING.lg, color: COLORS.textSecondary },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
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
