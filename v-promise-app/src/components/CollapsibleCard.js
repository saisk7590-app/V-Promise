import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';
import { Card } from './Card';

if (Platform.OS === 'android') {
  try {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  } catch (e) {
    // Silently handle: setLayoutAnimationEnabledExperimental is a no-op in New Architecture
  }
}

export const CollapsibleCard = ({ title, children, expanded = false, onToggle }) => {
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle?.();
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.icon}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.divider} />
          {children}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  icon: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  content: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  }
});
