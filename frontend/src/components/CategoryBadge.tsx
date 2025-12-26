import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

type Category = 'Electrical' | 'Water' | 'Internet' | 'Infrastructure';

interface CategoryBadgeProps {
  category: Category;
  style?: ViewStyle;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, style }) => {
  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.text}>{category}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.primaryLight,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.typography.small.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.primary,
  },
});
