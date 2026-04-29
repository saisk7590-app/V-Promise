import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, TYPOGRAPHY } from "../theme";

const Header = ({ title, onBack }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.container}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export { Header };

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.primary,
  },
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backBtn: {
    marginRight: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  backText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.body,
    fontWeight: "600",
  },
  title: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.title,
    fontWeight: "700",
    flex: 1,
    marginLeft: SPACING.md,
  },
});
