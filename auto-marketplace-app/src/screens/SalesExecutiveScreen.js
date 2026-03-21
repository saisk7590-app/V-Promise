import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  Pressable
} from "react-native";

import { CameraView, Camera } from "expo-camera";
import api from "../services/api";
import { COLORS, SPACING, TYPOGRAPHY } from "../theme";

const initialForm = {
  customerName: "",
  primaryMobile: "",
  secondaryMobile: "",
  branchId: "",
  branchName: "",
  vehicleType: "",
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

  const [form, setForm] = useState(initialForm);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);

  const [branchModalVisible, setBranchModalVisible] = useState(false);

  const [showCustomer, setShowCustomer] = useState(true);
  const [showVehicle, setShowVehicle] = useState(false);
  const [showImages, setShowImages] = useState(false);

  const toggleSection = (section) => {
    setShowCustomer(section === "customer");
    setShowVehicle(section === "vehicle");
    setShowImages(section === "images");
  };

  const resetAll = () => {
    setForm(initialForm);
    setCapturedImages([]);
    setShowCustomer(true);
    setShowVehicle(false);
    setShowImages(false);
  };


  useEffect(() => {
    fetchBranches();
    Camera.requestCameraPermissionsAsync();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      // Add cache-buster to ensure we get the latest IDs after a DB reset
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

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7
      });

      setCapturedImages(prev => [...prev, photo]);
      setCameraVisible(false);

    } catch (err) {
      Alert.alert("Camera error");
    }
  };

  const removeImage = (uri) => {
    setCapturedImages(prev => prev.filter(img => img.uri !== uri));
  };

  const handleSubmit = async () => {

    if (!form.customerName || !form.primaryMobile || (!form.branchId || (form.branchId === "manual" && !form.branchName))) {
      Alert.alert("Missing Fields", "Customer name, mobile and branch required");
      return;
    }

    setSubmitting(true);

    try {

      const payload = new FormData();

      Object.keys(form).forEach(key => {
        payload.append(key, String(form[key]));
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

  const renderInput = (label, key, extra = {}) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[key]}
        onChangeText={(t) => handleChange(key, t)}
        placeholder={label}
        placeholderTextColor="#999"
        {...extra}
      />
    </View>
  );

  return (

    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Vehicle Intake</Text>

        {/* CUSTOMER SECTION */}

        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection("customer")}
        >
          <Text style={styles.sectionTitle}>1. Customer Details</Text>
        </TouchableOpacity>

        {showCustomer && (

          <View style={styles.card}>

            {renderInput("Customer Name", "customerName")}

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                {renderInput("Primary Mobile", "primaryMobile", { keyboardType: "phone-pad" })}
              </View>
              <View style={{ flex: 1 }}>
                {renderInput("Secondary Mobile", "secondaryMobile", { keyboardType: "phone-pad" })}
              </View>
            </View>

            <Text style={styles.label}>Branch</Text>

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setBranchModalVisible(true)}
            >

              <Text style={{ color: COLORS?.text || "#333" }}>
                {form.branchName || "Select Branch"}
              </Text>

            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.nextBtn}
              onPress={() => toggleSection("vehicle")}
            >
              <Text style={styles.btnText}>Next: Vehicle Details</Text>
            </TouchableOpacity>

          </View>
        )}

        {/* VEHICLE SECTION */}

        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection("vehicle")}
        >
          <Text style={styles.sectionTitle}>2. Vehicle Details</Text>
        </TouchableOpacity>

        {showVehicle && (

          <View style={styles.card}>

            {renderInput("Vehicle Type", "vehicleType")}

            {renderInput("Purchase Type", "purchaseType")}

            {renderInput("Model Year", "modelYear", { keyboardType: "numeric" })}

            {renderInput("Registration Number", "registrationNumber")}

            {renderInput("Speedometer Reading", "speedometerReading", { keyboardType: "numeric" })}

            {renderInput("Outlook Condition", "outlookCondition")}

            {renderInput("Engine Condition", "engineCondition")}

            {renderInput("Overall Condition", "overallCondition")}

            {renderInput("NOC Status", "nocStatus")}

            <View style={styles.switchRow}>

              <Text>Challans Pending</Text>

              <Switch
                value={form.challansPending}
                onValueChange={(v) => handleChange("challansPending", v)}
              />

            </View>

            {renderInput("Exchange Value", "exchangeValue", { keyboardType: "numeric" })}

            {renderInput("Final Credit Note Value", "finalCreditNoteValue", { keyboardType: "numeric" })}

            <TouchableOpacity 
              style={styles.nextBtn}
              onPress={() => toggleSection("images")}
            >
              <Text style={styles.btnText}>Next: Upload Images</Text>
            </TouchableOpacity>

          </View>
        )}

        {/* IMAGE SECTION */}

        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection("images")}
        >
          <Text style={styles.sectionTitle}>3. Upload Images</Text>
        </TouchableOpacity>

        {showImages && (

          <View style={styles.card}>

            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={handleStartCamera}
            >
              <Text style={styles.btnText}>Open Camera</Text>
            </TouchableOpacity>

            <ScrollView horizontal>

              {capturedImages.map(img => (
                <View key={img.uri} style={styles.previewBox}>

                  <Image source={{ uri: img.uri }} style={styles.preview} />

                  <TouchableOpacity
                    onPress={() => removeImage(img.uri)}
                  >
                    <Text style={styles.remove}>Remove</Text>
                  </TouchableOpacity>

                </View>
              ))}

            </ScrollView>

          </View>
        )}

        {/* SUBMIT */}

        <TouchableOpacity
          style={styles.submit}
          onPress={handleSubmit}
          disabled={submitting}
        >

          <Text style={styles.btnText}>
            {submitting ? "Submitting..." : "Submit Intake"}
          </Text>

        </TouchableOpacity>

      </ScrollView>


      {/* BRANCH MODAL */}

      <Modal visible={branchModalVisible} transparent>

        <View style={styles.modalBg}>

          <View style={styles.modalCard}>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <Text style={styles.sectionTitle}>Choose Branch</Text>
              <TouchableOpacity onPress={fetchBranches} disabled={loading}>
                <Text style={{ color: "#1e88e5", fontWeight: "bold" }}>{loading ? "Refreshing..." : "Refresh List"}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>

              <Pressable
                onPress={() => handleBranchSelect({ id: "manual", branch_name: "Enter Manually" })}
                style={[styles.branchItem, { backgroundColor: "#f0f7ff", borderColor: "#1e88e5" }]}
              >
                <Text style={{ color: "#1e88e5", fontWeight: "bold" }}>+ Enter Manually</Text>
              </Pressable>

              {branches.map(b => (
                <Pressable
                  key={b.id}
                  onPress={() => handleBranchSelect(b)}
                  style={styles.branchItem}
                >

                  <Text>{b.branch_name}</Text>

                </Pressable>
              ))}

            </ScrollView>

            {form.branchId === "manual" && (
              <View style={{ marginTop: 15 }}>
                <Text style={styles.label}>Branch Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Type branch name..."
                  value={form.branchName === "Enter Manually" ? "" : form.branchName}
                  onChangeText={(t) => setForm(prev => ({ ...prev, branchName: t }))}
                  autoFocus
                />
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                style={[styles.cameraBtn, { flex: 1, backgroundColor: "#666" }]}
                onPress={() => setBranchModalVisible(false)}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cameraBtn, { flex: 1 }]}
                onPress={() => setBranchModalVisible(false)}
              >
                <Text style={styles.btnText}>Done</Text>
              </TouchableOpacity>
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

            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={() => setCameraVisible(false)}
            >

              <Text style={styles.btnText}>Cancel</Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraBtn}
              onPress={handleCapture}
            >

              <Text style={styles.btnText}>Capture</Text>

            </TouchableOpacity>

          </View>
        </View>

      </Modal>

    </View>
  );
}


const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#F4F6F8", padding: 16 },

  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },

  sectionHeader: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10
  },

  sectionTitle: { fontSize: 16, fontWeight: "600" },

  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },

  field: { marginBottom: 12 },

  label: { marginBottom: 4, fontWeight: "500" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  nextBtn: {
    backgroundColor: "#1e88e5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10
  },

  cameraBtn: {
    backgroundColor: "#1e88e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  },

  btnText: { color: "#FFF", fontWeight: "bold" },

  submit: {
    backgroundColor: "#43a047",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40
  },

  previewBox: {
    marginRight: 10,
    alignItems: "center"
  },

  preview: {
    width: 120,
    height: 120,
    borderRadius: 10
  },

  remove: { color: "red", marginTop: 4 },

  modalBg: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  },

  modalCard: {
    backgroundColor: "#FFF",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    maxHeight: "70%"
  },

  branchItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },

  cameraControls: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 20
  }

});