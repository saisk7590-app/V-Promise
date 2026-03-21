import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable
} from "react-native";
import api from "../services/api";
import { COLORS, SPACING, TYPOGRAPHY } from "../theme";

const CollapsibleCard = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardHeader} 
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.toggleIcon}>{isOpen ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.cardBody}>{children}</View>}
    </View>
  );
};

export default function ValuationManager() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  
  const [finalPrice, setFinalPrice] = useState("");
  const [priceReason, setPriceReason] = useState("");

  useEffect(() => {
    fetchVehiclesForValuation();
  }, []);

  const fetchVehiclesForValuation = async () => {
    try {
      const { data } = await api.get("/api/vehicles-for-valuation");
      setVehicles(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVehicleDetails = async (vehicleId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/vehicle-full-details/${vehicleId}`);
      if (data.success) {
        setDetails(data);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to fetch vehicle details");
    }
    setLoading(false);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleModalVisible(false);
    fetchVehicleDetails(vehicle.id);
  };

  const handleSubmit = async () => {
    if (!selectedVehicle || !finalPrice) {
      Alert.alert("Missing Information", "Please select a vehicle and enter a final price.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vehicleId: selectedVehicle.id,
        inspectionId: details?.inspection?.id,
        evaluatedBy: 1, // Defaulting to admin/manager ID 1
        finalPrice: Number(finalPrice),
        priceReason
      };

      const { data } = await api.post("/api/vehicle-valuation", payload);
      if (data.success) {
        Alert.alert("Success", "Valuation saved successfully");
        // Reset form
        setSelectedVehicle(null);
        setDetails(null);
        setFinalPrice("");
        setPriceReason("");
        fetchVehiclesForValuation();
      }
    } catch (err) {
      Alert.alert("Error", "Failed to save valuation");
    }
    setSubmitting(false);
  };

  const renderDetailRow = (label, value) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value || "N/A"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Vehicle Valuation</Text>

        <TouchableOpacity 
          style={styles.vehicleSelector} 
          onPress={() => setVehicleModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {selectedVehicle ? `Selected: ${selectedVehicle.registration_number}` : "Choose Vehicle to Value"}
          </Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : details ? (
          <View>
            <CollapsibleCard title="1. Vehicle Details" defaultOpen={true}>
              {renderDetailRow("Customer", details.vehicle.customer_name)}
              {renderDetailRow("Registration", details.vehicle.registration_number)}
              {renderDetailRow("Model Year", details.vehicle.model_year)}
              {renderDetailRow("Type", details.vehicle.vehicle_type)}
              {renderDetailRow("Purchase Type", details.vehicle.purchase_type)}
              {renderDetailRow("Speedometer", `${details.vehicle.speedometer_reading} km`)}
            </CollapsibleCard>

            <CollapsibleCard title="2. Inspection Summary">
              {details.inspection ? (
                <View>
                  {renderDetailRow("Overall Grade", details.inspection.overall_grade)}
                  {renderDetailRow("Engine Health", details.inspection.engine_health)}
                  {renderDetailRow("Outlook", details.inspection.outlook)}
                  {renderDetailRow("Structural", details.inspection.structural_condition)}
                  {renderDetailRow("Mechanical", details.inspection.mechanical_condition)}
                  {renderDetailRow("Electrical", details.inspection.electrical_condition)}
                  <Text style={styles.remarksLabel}>Remarks:</Text>
                  <Text style={styles.remarksText}>{details.inspection.remarks || "No remarks"}</Text>
                </View>
              ) : (
                <Text style={styles.emptyText}>No inspection record found.</Text>
              )}
            </CollapsibleCard>

            <CollapsibleCard title="3. Inspection Images">
              {details.images.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {details.images.map((img) => (
                    <Image 
                      key={img.id}
                      source={{ uri: `${api.defaults.baseURL}/${img.image_path}` }} 
                      style={styles.inspectionImage}
                    />
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>No images available.</Text>
              )}
            </CollapsibleCard>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Recommended Price (INR)</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Enter final price..."
                keyboardType="numeric"
                value={finalPrice}
                onChangeText={setFinalPrice}
              />

              <Text style={styles.inputLabel}>Valuation Reason / Remarks</Text>
              <TextInput
                style={[styles.priceInput, { height: 80, textAlignVertical: "top" }]}
                placeholder="Why this price? (optional)"
                multiline
                value={priceReason}
                onChangeText={setPriceReason}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Valuation</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Please select a vehicle to begin valuation process.</Text>
          </View>
        )}
      </ScrollView>

      {/* Vehicle Selection Modal */}
      <Modal visible={vehicleModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Inspected Vehicle</Text>
            <ScrollView>
              {vehicles.map((v) => (
                <Pressable
                  key={v.id}
                  style={styles.vehicleItem}
                  onPress={() => handleVehicleSelect(v)}
                >
                  <Text style={styles.vehicleReg}>{v.registration_number}</Text>
                  <Text style={styles.vehicleSub}>{v.vehicle_type} - {v.model_year}</Text>
                </Pressable>
              ))}
              {vehicles.length === 0 && (
                <Text style={styles.emptyText}>No vehicles currently waiting for valuation.</Text>
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setVehicleModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8", padding: 16 },
  screenTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: COLORS.textPrimary },
  
  vehicleSelector: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    marginBottom: 20,
    alignItems: "center"
  },
  selectorText: { color: COLORS.primary, fontWeight: "bold", fontSize: 16 },

  card: { backgroundColor: "#FFF", borderRadius: 12, marginBottom: 15, overflow: "hidden", elevation: 2 },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: 16, 
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9"
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: COLORS.textPrimary },
  toggleIcon: { fontSize: 16, color: COLORS.primary },
  cardBody: { padding: 16 },

  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  detailLabel: { color: COLORS.textSecondary, fontSize: 14 },
  detailValue: { fontWeight: "600", color: COLORS.textPrimary, fontSize: 14 },

  remarksLabel: { color: COLORS.textSecondary, fontSize: 14, marginTop: 10, marginBottom: 4 },
  remarksText: { fontStyle: "italic", color: COLORS.textPrimary },

  inspectionImage: { width: 150, height: 100, borderRadius: 8, marginRight: 10 },
  
  inputCard: { backgroundColor: "#FFF", padding: 20, borderRadius: 12, marginTop: 10, marginBottom: 40 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: COLORS.textSecondary },
  priceInput: { 
    borderWidth: 1, 
    borderColor: "#E2E8F0", 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16, 
    marginBottom: 20,
    backgroundColor: "#F8FAFC"
  },

  submitBtn: { backgroundColor: COLORS.success || "#16A34A", padding: 16, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  placeholderContainer: { marginTop: 100, alignItems: "center" },
  placeholderText: { color: COLORS.textSecondary, textAlign: "center", fontSize: 16 },
  emptyText: { textAlign: "center", padding: 20, color: COLORS.textSecondary },

  // Modal styles
  modalBg: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalCard: { backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "70%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  vehicleItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  vehicleReg: { fontSize: 16, fontWeight: "600" },
  vehicleSub: { fontSize: 14, color: COLORS.textSecondary },
  closeBtn: { marginTop: 20, padding: 15, alignItems: "center", backgroundColor: "#F1F5F9", borderRadius: 10 },
  closeBtnText: { fontWeight: "bold", color: COLORS.textPrimary }
});
