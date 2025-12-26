import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { theme } from '../theme';

type IssueStatus = 'Open' | 'In Progress' | 'Resolved';
type Category = 'Electrical' | 'Water' | 'Internet' | 'Infrastructure';

interface IssueCardProps {
  title: string;
  description: string;
  category: Category;
  status: IssueStatus;
  imageUrl?: string;
  createdAt: string;
  studentName?: string;
  studentEmail?: string;
  onPress?: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  title,
  description,
  category,
  status,
  imageUrl,
  createdAt,
  studentName,
  studentEmail,
  onPress,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const content = (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>

      {(studentName || studentEmail) && (
        <View style={styles.studentInfo}>
          <Text style={styles.studentLabel}>Reported by:</Text>
          <Text style={styles.studentName}>{studentName || studentEmail}</Text>
        </View>
      )}

      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.footer}>
        <CategoryBadge category={category} />
        <StatusBadge status={status} />
      </View>
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  date: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.small,
  },
  studentLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  studentName: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
});
