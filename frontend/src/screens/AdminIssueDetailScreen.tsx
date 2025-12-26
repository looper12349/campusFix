import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateIssueStatus, addRemark } from '../store/issuesSlice';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { theme } from '../theme';
import { Issue, IssueStatus } from '../types';
import { AdminIssuesStackParamList } from '../navigation/AdminNavigator';

type RouteProps = RouteProp<AdminIssuesStackParamList, 'AdminIssueDetail'>;

const AdminIssueDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { issueId } = route.params;
  const { items, isLoading } = useAppSelector((state) => state.issues);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [remarkText, setRemarkText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

  const handleStatusUpdate = async (newStatus: IssueStatus) => {
    if (!issue) return;

    try {
      await dispatch(updateIssueStatus({ issueId: issue._id, status: newStatus })).unwrap();
      setStatusModalVisible(false);
      setToastMessage(`Status updated to ${newStatus}`);
      setToastType('success');
      setShowToast(true);
    } catch (error: any) {
      setStatusModalVisible(false);
      setToastMessage(error || 'Failed to update status');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleAddRemark = async () => {
    if (!issue || !remarkText.trim()) {
      Alert.alert('Error', 'Please enter a remark');
      return;
    }

    try {
      await dispatch(addRemark({ issueId: issue._id, remark: remarkText.trim() })).unwrap();
      setRemarkText('');
      setToastMessage('Remark added successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(error || 'Failed to add remark');
      setToastType('error');
      setShowToast(true);
    }
  };

  const statuses: IssueStatus[] = ['Open', 'In Progress', 'Resolved'];

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

  // Extract student info if populated
  const studentName = typeof issue.createdBy === 'object' ? issue.createdBy.name : 'Unknown';
  const studentEmail = typeof issue.createdBy === 'object' ? issue.createdBy.email : '';

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
        
        {/* Student Info */}
        <View style={styles.studentInfo}>
          <Text style={styles.studentLabel}>Reported by:</Text>
          <Text style={styles.studentName}>{studentName}</Text>
          {studentEmail && <Text style={styles.studentEmail}>{studentEmail}</Text>}
        </View>
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

      {/* Status Update Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        <Button
          title={`Current Status: ${issue.status}`}
          onPress={() => setStatusModalVisible(true)}
          variant="outline"
          disabled={isLoading}
        />
      </Card>

      {/* Add Remark Card */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Add Remark</Text>
        <TextInput
          style={styles.remarkInput}
          placeholder="Enter your remark here..."
          placeholderTextColor={theme.colors.textSecondary}
          value={remarkText}
          onChangeText={setRemarkText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Button
          title="Add Remark"
          onPress={handleAddRemark}
          disabled={isLoading || !remarkText.trim()}
          style={styles.addRemarkButton}
        />
      </Card>

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

      {/* Remarks History Card */}
      {issue.remarks && issue.remarks.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Remarks History</Text>
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

      {/* Status Update Modal */}
      <Modal
        visible={statusModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    issue.status === status && styles.statusOptionActive,
                  ]}
                  onPress={() => handleStatusUpdate(status)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      issue.status === status && styles.statusOptionTextActive,
                    ]}
                  >
                    {status}
                  </Text>
                  {issue.status === status && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
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
    paddingBottom: theme.spacing.lg,
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
    marginBottom: theme.spacing.sm,
  },
  studentInfo: {
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    marginTop: theme.spacing.xs,
  },
  studentLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  studentName: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
  },
  studentEmail: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  remarkInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    padding: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    minHeight: 100,
    marginBottom: theme.spacing.sm,
  },
  addRemarkButton: {
    marginTop: theme.spacing.xs,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.medium,
    borderTopRightRadius: theme.borderRadius.medium,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  modalBody: {
    padding: theme.spacing.sm,
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.xs,
  },
  statusOptionActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  statusOptionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  statusOptionTextActive: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  checkmark: {
    fontSize: 20,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default AdminIssueDetailScreen;
