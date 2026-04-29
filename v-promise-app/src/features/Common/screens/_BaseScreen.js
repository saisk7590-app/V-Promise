import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../../components/Header";
import { COLORS, SPACING, TYPOGRAPHY } from "../../../theme";

const Screen = ({ title }) => (
  <SafeAreaView style={styles.safeArea}>

    {/* 🔥 HEADER */}
    <Header title={title} />

    {/* 📦 CONTENT */}
    <View style={styles.container}>
      <Text style={styles.heading}>{title}</Text>
      <Text style={styles.subtext}>
        Module under development. Features will be available soon.
      </Text>
    </View>

  </SafeAreaView>
);

export default Screen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },

  heading: {
    fontSize: TYPOGRAPHY.title,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  subtext: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.small,
    textAlign: "center",
  },
});