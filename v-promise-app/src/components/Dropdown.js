import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { TYPOGRAPHY } from '../theme/typography';

export const Dropdown = ({ label, selectedValue, onValueChange, items, error }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);
  const displayText = selectedItem?.label || 'Select...';
  const hasValue = selectedValue !== '' && selectedValue !== null && selectedValue !== undefined;

  const handleSelect = (item) => {
    onValueChange(item.value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.selector, error && styles.selectorError]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorText, !hasValue && styles.placeholderText]}>
          {displayText}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalCard}>
            {label && <Text style={styles.modalTitle}>{label}</Text>}
            <FlatList
              data={items}
              keyExtractor={(item, index) => `${item.value}-${index}`}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.6}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item.label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 300 }}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.xs,
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  selector: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.ms,
    paddingVertical: SPACING.ms,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
  },
  selectorError: {
    borderColor: COLORS.danger,
  },
  selectorText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.placeholder || COLORS.textSecondary,
  },
  arrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: TYPOGRAPHY.small - 2,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.subtitle,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionItem: {
    paddingVertical: SPACING.ms,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: SPACING.sm,
  },
  cancelBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.ms,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 10,
  },
  cancelText: {
    fontWeight: '600',
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body,
  },
});
