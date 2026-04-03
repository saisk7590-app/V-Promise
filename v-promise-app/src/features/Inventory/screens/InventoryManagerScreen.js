import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import api from "../../../services/api";
import { COLORS } from "../../../theme/colors";
import { SPACING } from "../../../theme/spacing";
import { TYPOGRAPHY } from "../../../theme/typography";
import { Card } from "../../../components/Card";

const InventoryCard = ({ item }) => (
  <Card style={styles.cardContainer}>
    {/* Top Section */}
    <View style={styles.topRow}>
      {/* Image Box */}
      <View style={styles.imageBox}>
        {item.thumbnail ? (
          <Image
            source={{ uri: `${api.defaults.baseURL}/${item.thumbnail}` }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      {/* Details Box */}
      <View style={styles.detailsBox}>
        <Text style={styles.detailText}>Name: {item.vehicle_name || item.vehicle_type}</Text>
        <Text style={styles.detailText}>Year: {item.model_year}</Text>
        <Text style={styles.detailText}>Reading: {item.speedometer_reading} km</Text>
        <Text style={styles.detailText}>Condition: {item.overall_condition}</Text>
        <Text style={styles.priceText}>
          Price: ₹ {Number(item.price || 0).toLocaleString("en-IN")}
        </Text>
      </View>
    </View>

    {/* Bottom Vehicle Name */}
    <View style={styles.nameContainer}>
      <Text style={styles.vehicleName}>
        {item.registration_number}
      </Text>
    </View>
  </Card>
);

export default function InventoryManager() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchInventory = async (searchText = "") => {
    try {
      const { data } = await api.get(`/api/inventory?search=${searchText}&page=1&limit=50`);
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

  // Initial load
  useEffect(() => {
    fetchInventory();
  }, []);

  // Debounced search — fires 400ms after user stops typing
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchInventory(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventory(search);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={[styles.container, { alignSelf: 'center', width: '100%', maxWidth: 800 }]}>
        <Text style={styles.title}>Vehicle Inventory</Text>

        {/* Search Bar */}
        <TextInput
          placeholder="Search (TS, AP, Swift, 2020...)"
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        <FlatList
          data={inventory}
          keyExtractor={(item, index) =>
            item.inventory_id ? item.inventory_id.toString() : index.toString()
          }
          renderItem={({ item }) => <InventoryCard item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {search ? `No results for "${search}".` : "No vehicles available in inventory."}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: TYPOGRAPHY.title,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface || "#fff",
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: SPACING.xl * 2,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  cardContainer: {
    padding: SPACING.ms,
  },
  topRow: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  imageBox: {
    width: 100,
    height: 75,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: SPACING.md,
    backgroundColor: COLORS.border,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.border,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.small - 2,
    color: COLORS.textSecondary,
  },
  detailsBox: {
    flex: 1,
    justifyContent: "center",
  },
  detailText: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  priceText: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 2,
  },
  nameContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.xs,
  },
  vehicleName: {
    fontWeight: "600",
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
});
