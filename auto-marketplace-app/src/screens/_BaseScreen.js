import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../theme";

const Screen = ({ title }) => (
  <View style={styles.container}>
    <Text style={styles.heading}>{title}</Text>
    <Text style={styles.subtext}>Module under development. Features will be available soon.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
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
    lineHeight: TYPOGRAPHY.body + SPACING.xs,
  },
});

export default Screen;
