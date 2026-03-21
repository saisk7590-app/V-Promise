import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import api from "../services/api";
import { COLORS, SPACING, TYPOGRAPHY } from "../theme";

const InventoryCard = ({ item }) => (
  <View style={styles.card}>

    {/* Image */}
    <View style={styles.imageBox}>
      {item.thumbnail ? (
        <Image
          source={{ uri: `${api.defaults.baseURL}/${item.thumbnail}` }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.image, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}
    </View>

    {/* Vehicle Name */}
    <Text style={styles.vehicleName}>
      {item.name || "Vehicle Name"}
    </Text>

    {/* Details */}
    <View style={styles.detailsBox}>
      <Text style={styles.detailText}>Make: {item.make || "2010"}</Text>
      <Text style={styles.detailText}>Model: {item.model || "VX"}</Text>
      <Text style={styles.detailText}>Seats: {item.seats || "5"}</Text>
      <Text style={styles.priceText}>
        Price: ₹ {Number(item.price || 0).toLocaleString("en-IN")}
      </Text>
    </View>

  </View>
);

export default function InventoryManager() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get("/api/inventory");
      if (data.success) {
        setInventory(data.data || []);
      }
    } catch (err) {
      console.error("Fetch inventory error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Inventory</Text>
      <FlatList
        data={inventory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <InventoryCard item={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No vehicles available in inventory.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },

  listContent: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    marginBottom: 12,
  },

  imageBox: {
    width: "100%",
    height: 100,
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 8,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
  },

  placeholderText: {
    fontSize: 12,
  },

  vehicleName: {
    fontWeight: "bold",
    marginBottom: 6,
  },

  detailsBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 6,
  },

  detailText: {
    fontSize: 12,
  },

  priceText: {
    fontSize: 12,
    marginTop: 4,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});