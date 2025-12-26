import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { EmptyState } from '../components/EmptyState';
import { theme } from '../theme';
import { Issue } from '../types';
import { IssuesStackParamList } from '../navigation/StudentNavigator';

type RouteProps = RouteProp<IssuesStackParamList, 'IssueDetail'>;

const IssueDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const { issueId } = route.params;
  const { items } = useAppSelector((state) => state.issues);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the issue from the Redux store
    const foundIssue = items.find((item) => item._id === issueId);
    setIssue(foundIssue || null);
    setLoading(false);
  }, [issueId, items]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!issue) {
    return (
      <EmptyState
        title="Issue not found"
        message="The issue you're looking for doesn't exist or has been removed."
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.badges}>
          <CategoryBadge category={issue.category} />
          <StatusBadge status={issue.status} />
        </View>
        <Text style={styles.title}>{issue.title}</Text>
        <Text style={styles.date}>Created on {formatDate(issue.createdAt)}</Text>
      </Card>

      {/* Description Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{issue.description}</Text>
      </Card>

      {/* Image Card */}
      {issue.imageUrl && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Image</Text>
          <Image
            source={{ uri: issue.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </Card>
      )}

      {/* Status Timeline Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <View style={[styles.timelineDot, styles.timelineDotActive]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStatus}>Open</Text>
              <Text style={styles.timelineDate}>{formatShortDate(issue.createdAt)}</Text>
            </View>
          </View>

          {(issue.status === 'In Progress' || issue.status === 'Resolved') && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotActive]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>In Progress</Text>
                <Text style={styles.timelineDate}>{formatShortDate(issue.updatedAt)}</Text>
              </View>
            </View>
          )}

          {issue.status === 'Resolved' && issue.resolvedAt && (
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, styles.timelineDotActive]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>Resolved</Text>
                <Text style={styles.timelineDate}>{formatShortDate(issue.resolvedAt)}</Text>
              </View>
            </View>
          )}

          {issue.status !== 'Resolved' && (
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineStatus, styles.timelineStatusInactive]}>
                  {issue.status === 'In Progress' ? 'Resolved' : issue.status === 'Open' ? 'In Progress' : 'Resolved'}
                </Text>
                <Text style={styles.timelineDate}>Pending</Text>
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Admin Remarks Card */}
      {issue.remarks && issue.remarks.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Remarks</Text>
          {issue.remarks.map((remark, index) => (
            <View key={index} style={styles.remarkItem}>
              <View style={styles.remarkHeader}>
                <Text style={styles.remarkLabel}>Admin</Text>
                <Text style={styles.remarkDate}>{formatShortDate(remark.addedAt)}</Text>
              </View>
              <Text style={styles.remarkText}>{remark.text}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerCard: {
    marginBottom: theme.spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  card: {
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    lineHeight: 24,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: theme.borderRadius.small,
  },
  timeline: {
    paddingLeft: theme.spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: theme.colors.primary,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  timelineStatusInactive: {
    color: theme.colors.textSecondary,
  },
  timelineDate: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  remarkItem: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.xs,
  },
  remarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  remarkLabel: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  remarkDate: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textSecondary,
  },
  remarkText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    lineHeight: 22,
  },
});

export default IssueDetailScreen;
