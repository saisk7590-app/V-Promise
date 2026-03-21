import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  Pressable
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import api from "../services/api";
import { COLORS, SPACING, TYPOGRAPHY } from "../theme";

const CONDITION_OPTIONS = ["GOOD", "AVERAGE", "BAD"];

const initialForm = {
  vehicleId: "",
  registrationNumber: "",
  engineHealth: "GOOD",
  outlook: "GOOD",
  structuralCondition: "GOOD",
  mechanicalCondition: "GOOD",
  electricalCondition: "GOOD",
  remarks: ""
};

export default function InspectionExecutive() {
  const cameraRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [currentPickerField, setCurrentPickerField] = useState("");

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
      registrationNumber: vehicle.registration_number
    }));
    setVehicleModalVisible(false);
  };

  const openPicker = (field) => {
    setCurrentPickerField(field);
    setPickerModalVisible(true);
  };

  const selectCondition = (value) => {
    setForm(prev => ({ ...prev, [currentPickerField]: value }));
    setPickerModalVisible(false);
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

  const renderPickerField = (label, field) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => openPicker(field)}>
        <Text style={styles.dropdownText}>{form[field]}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Vehicle Inspection</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Select Vehicle</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setVehicleModalVisible(true)}
          >
            <Text style={styles.dropdownText}>
              {form.registrationNumber || "Choose Vehicle"}
            </Text>
          </TouchableOpacity>

          {renderPickerField("Engine Health", "engineHealth")}
          {renderPickerField("Outlook", "outlook")}
          {renderPickerField("Structural Condition", "structuralCondition")}
          {renderPickerField("Mechanical Condition", "mechanicalCondition")}
          {renderPickerField("Electrical Condition", "electricalCondition")}

          <Text style={styles.label}>Remarks (Optional)</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            multiline
            placeholder="Enter any additional remarks..."
            value={form.remarks}
            onChangeText={(t) => setForm(prev => ({ ...prev, remarks: t }))}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Inspection Images</Text>
          <TouchableOpacity style={styles.cameraBtn} onPress={handleStartCamera}>
            <Text style={styles.btnText}>Capture Image</Text>
          </TouchableOpacity>

          <ScrollView horizontal style={{ marginTop: 15 }}>
            {capturedImages.map((img, i) => (
              <View key={img.uri} style={styles.previewBox}>
                <Image source={{ uri: img.uri }} style={styles.preview} />
                <TouchableOpacity onPress={() => removeImage(img.uri)}>
                  <Text style={styles.remove}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.submit, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnText}>Submit Inspection</Text>
          )}
        </TouchableOpacity>
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
                  <Text style={styles.listText}>{v.registration_number}</Text>
                  <Text style={styles.listSubText}>{v.vehicle_type} - {v.model_year}</Text>
                </Pressable>
              ))}
              {vehicles.length === 0 && !loading && (
                <Text style={styles.emptyText}>No vehicles pending inspection</Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setVehicleModalVisible(false)}
            >
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Condition Picker Modal */}
      <Modal visible={pickerModalVisible} transparent animationType="none">
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { maxHeight: 300 }]}>
            <Text style={styles.modalTitle}>Select Value</Text>
            {CONDITION_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.listItem}
                onPress={() => selectCondition(opt)}
              >
                <Text style={styles.listText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.closeBtn, { marginTop: 10 }]}
              onPress={() => setPickerModalVisible(false)}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
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
            <TouchableOpacity
              style={styles.cameraActionBtn}
              onPress={() => setCameraVisible(false)}
            >
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={handleCapture}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={{ width: 60 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: COLORS.textPrimary },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 15 },
  field: { marginBottom: 15 },
  label: { marginBottom: 8, fontWeight: "500", color: COLORS.textSecondary },
  dropdown: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },
  dropdownText: { fontSize: 16, color: COLORS.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F8FAFC",
  },
  cameraBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  submit: {
    backgroundColor: COLORS.success,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  previewBox: { marginRight: 12, alignItems: "center" },
  preview: { width: 100, height: 100, borderRadius: 8 },
  remove: { color: COLORS.danger, marginTop: 5, fontSize: 12, fontWeight: "600" },
  modalBg: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  refreshBtn: { color: COLORS.primary, fontWeight: "600" },
  listItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  listText: { fontSize: 16, fontWeight: "500" },
  listSubText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  emptyText: { textAlign: "center", padding: 20, color: COLORS.textSecondary },
  closeBtn: {
    backgroundColor: COLORS.secondary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  cameraActionBtn: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
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
