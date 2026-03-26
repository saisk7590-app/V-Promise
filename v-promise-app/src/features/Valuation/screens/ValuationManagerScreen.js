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
  Pressable,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import api from "../../../services/api";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../theme";

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

    if (!details?.inspection?.id) {
      Alert.alert(
        "Missing Inspection Data", 
        "This vehicle is marked as 'INSPECTED' but has no actual inspection report in the database. Please generate an inspection report first before submitting a valuation."
      );
      return;
    }

    setSubmitting(true);
    try {
      const sanitizedPrice = finalPrice.replace(/,/g, '');
      const payload = {
        vehicleId: selectedVehicle.id,
        inspectionId: details?.inspection?.id,
        evaluatedBy: 1, // Defaulting to admin/manager ID 1
        finalPrice: Number(sanitizedPrice),
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
      const errorMsg = err.response?.data?.message || err.message || "Failed to save valuation";
      Alert.alert("Error", errorMsg);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 20}
      >
        <View style={[styles.container, { alignSelf: 'center', width: '100%', maxWidth: 800 }]}>
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          >
        <Text style={styles.screenTitle}>Vehicle Valuation</Text>

        <TouchableOpacity 
          style={styles.vehicleSelector} 
          onPress={() => setVehicleModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {selectedVehicle 
              ? `Selected: ${selectedVehicle.registration_number} · ${selectedVehicle.vehicle_name || selectedVehicle.vehicle_type}` 
              : "Choose Vehicle to Value"}
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
              {renderDetailRow("Name", details.vehicle.vehicle_name || details.vehicle.vehicle_type)}
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
                placeholderTextColor={COLORS.placeholder || '#94A3B8'}
                keyboardType="numeric"
                value={finalPrice}
                onChangeText={setFinalPrice}
              />

              <Text style={styles.inputLabel}>Valuation Reason / Remarks</Text>
              <TextInput
                style={[styles.priceInput, { height: 80, textAlignVertical: "top" }]}
                placeholder="Why this price? (optional)"
                placeholderTextColor={COLORS.placeholder || '#94A3B8'}
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
                  <Text style={styles.vehicleSub}>
                    {(v.vehicle_name || v.vehicle_type) + (v.vehicle_type ? ` · ${v.vehicle_type}` : "")} - {v.model_year}
                  </Text>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
  screenTitle: { fontSize: TYPOGRAPHY.title, fontWeight: "bold", marginBottom: SPACING.lg, color: COLORS.textPrimary },
  
  vehicleSelector: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    marginBottom: SPACING.lg,
    alignItems: "center"
  },
  selectorText: { color: COLORS.primary, fontWeight: "bold", fontSize: TYPOGRAPHY.body },

  card: { backgroundColor: COLORS.card, borderRadius: 12, marginBottom: SPACING.md, overflow: "hidden", elevation: 2 },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    padding: SPACING.md, 
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  cardTitle: { fontSize: TYPOGRAPHY.body, fontWeight: "bold", color: COLORS.textPrimary },
  toggleIcon: { fontSize: TYPOGRAPHY.body, color: COLORS.primary },
  cardBody: { padding: SPACING.md },

  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.xs },
  detailLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.small },
  detailValue: { fontWeight: "600", color: COLORS.textPrimary, fontSize: TYPOGRAPHY.small },

  remarksLabel: { color: COLORS.textSecondary, fontSize: TYPOGRAPHY.small, marginTop: SPACING.sm, marginBottom: SPACING.xs },
  remarksText: { fontStyle: "italic", color: COLORS.textPrimary },

  inspectionImage: { width: 150, height: 100, borderRadius: 8, marginRight: SPACING.sm },
  
  inputCard: { backgroundColor: COLORS.card, padding: SPACING.lg, borderRadius: 12, marginTop: SPACING.sm, marginBottom: SPACING.xl * 2 },
  inputLabel: { fontSize: TYPOGRAPHY.small, fontWeight: "600", marginBottom: SPACING.xs, color: COLORS.textSecondary },
  priceInput: { 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 8, 
    padding: SPACING.md, 
    fontSize: TYPOGRAPHY.body, 
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background
  },

  submitBtn: { backgroundColor: COLORS.success, padding: SPACING.md, borderRadius: 12, alignItems: "center" },
  submitBtnText: { color: COLORS.textLight, fontWeight: "bold", fontSize: TYPOGRAPHY.body },

  placeholderContainer: { marginTop: 100, alignItems: "center" },
  placeholderText: { color: COLORS.textSecondary, textAlign: "center", fontSize: TYPOGRAPHY.body },
  emptyText: { textAlign: "center", padding: SPACING.lg, color: COLORS.textSecondary },

  // Modal styles
  modalBg: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalCard: { backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg, maxHeight: "70%" },
  modalTitle: { fontSize: TYPOGRAPHY.subtitle, fontWeight: "bold", marginBottom: SPACING.md },
  vehicleItem: { paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  vehicleReg: { fontSize: TYPOGRAPHY.body, fontWeight: "600" },
  vehicleSub: { fontSize: TYPOGRAPHY.small, color: COLORS.textSecondary },
  closeBtn: { marginTop: SPACING.lg, padding: SPACING.md, alignItems: "center", backgroundColor: COLORS.border, borderRadius: 10 },
  closeBtnText: { fontWeight: "bold", color: COLORS.textPrimary }
});
