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
  onPress?: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  title,
  description,
  category,
  status,
  imageUrl,
  createdAt,
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
