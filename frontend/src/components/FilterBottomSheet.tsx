import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { theme } from '../theme';
import { Category, IssueStatus } from '../types';
import { Button } from './Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6;

/**
 * FilterBottomSheet Component
 * 
 * A modal bottom sheet for filtering issues by category and status.
 * Features smooth slide-up animation and fade-in overlay.
 * 
 * Requirements: 5.1-5.4, 16.10
 * - Category filter options (Electrical, Water, Internet, Infrastructure)
 * - Status filter options (Open, In Progress, Resolved)
 * - Apply and Reset buttons
 * - Smooth animations using React Native Animated API
 */
interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { category: Category | null; status: IssueStatus | null }) => void;
  initialCategory?: Category | null;
  initialStatus?: IssueStatus | null;
}

const CATEGORIES: Category[] = ['Electrical', 'Water', 'Internet', 'Infrastructure'];
const STATUSES: IssueStatus[] = ['Open', 'In Progress', 'Resolved'];

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialCategory = null,
  initialStatus = null,
}) => {
  const [slideAnim] = useState(new Animated.Value(SHEET_HEIGHT));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | null>(initialStatus);

  useEffect(() => {
    if (visible) {
      // Reset to initial values when opening
      setSelectedCategory(initialCategory);
      setSelectedStatus(initialStatus);
      
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialCategory, initialStatus]);

  const handleClose = () => {
    onClose();
  };

  const handleApply = () => {
    onApply({ category: selectedCategory, status: selectedStatus });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedStatus(null);
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const toggleStatus = (status: IssueStatus) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sheet,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Handle bar */}
              <View style={styles.handleBar} />

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Filter Issues</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Category Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Category</Text>
                  <View style={styles.optionsContainer}>
                    {CATEGORIES.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.option,
                          selectedCategory === category && styles.optionSelected,
                        ]}
                        onPress={() => toggleCategory(category)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedCategory === category && styles.optionTextSelected,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Status Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Status</Text>
                  <View style={styles.optionsContainer}>
                    {STATUSES.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.option,
                          selectedStatus === status && styles.optionSelected,
                        ]}
                        onPress={() => toggleStatus(status)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedStatus === status && styles.optionTextSelected,
                          ]}
                        >
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <Button
                  title="Reset"
                  onPress={handleReset}
                  variant="outline"
                  style={styles.resetButton}
                />
                <Button
                  title="Apply Filters"
                  onPress={handleApply}
                  variant="primary"
                  style={styles.applyButton}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...theme.shadow.card,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  option: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  optionSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.h3.fontWeight,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});
