import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';

export const Button = ({ title, onPress, type = 'primary', loading = false, disabled = false, style }) => {
  const isPrimary = type === 'primary';
  const isDanger = type === 'danger';
  const isOutline = type === 'outline';

  let backgroundColor = COLORS.primary;
  let textColor = COLORS.textLight;
  let borderColor = 'transparent';

  if (isDanger) {
    backgroundColor = COLORS.danger;
  } else if (isOutline) {
    backgroundColor = 'transparent';
    textColor = COLORS.primary;
    borderColor = COLORS.primary;
  }

  if (disabled) {
    backgroundColor = COLORS.border;
    textColor = COLORS.textSecondary;
    borderColor = 'transparent';
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor, borderWidth: isOutline ? 1 : 0 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
  },
});
