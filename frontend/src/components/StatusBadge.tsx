import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../theme';

type IssueStatus = 'Open' | 'In Progress' | 'Resolved';

interface StatusBadgeProps {
  status: IssueStatus;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Open':
        return theme.colors.error;
      case 'In Progress':
        return theme.colors.warning;
      case 'Resolved':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: `${getStatusColor()}20` },
        style,
      ]}
    >
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.small,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: theme.typography.small.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
  },
});
