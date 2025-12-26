import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchIssues, setFilters, clearFilters } from '../store/issuesSlice';
import { IssueCard } from '../components/IssueCard';
import { EmptyState } from '../components/EmptyState';
import { IssueCardSkeleton } from '../components/SkeletonLoader';
import { Button } from '../components/Button';
import { theme } from '../theme';
import { Category, IssueStatus } from '../types';
import { IssuesStackParamList } from '../navigation/StudentNavigator';

type NavigationProp = StackNavigationProp<IssuesStackParamList, 'IssueList'>;

const IssueListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const { items, isLoading, error, filters } = useAppSelector((state) => state.issues);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState<{
    category: Category | null;
    status: IssueStatus | null;
  }>({ category: null, status: null });

  useEffect(() => {
    dispatch(fetchIssues({ isAdmin: false }));
  }, [dispatch, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchIssues({ isAdmin: false }));
    setRefreshing(false);
  };

  const handleIssuePress = (issueId: string) => {
    navigation.navigate('IssueDetail', { issueId });
  };

  const handleCreateIssue = () => {
    navigation.navigate('CreateIssue');
  };

  const openFilterModal = () => {
    setTempFilters(filters);
    setFilterModalVisible(true);
  };

  const applyFilters = () => {
    dispatch(setFilters(tempFilters));
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setTempFilters({ category: null, status: null });
    dispatch(clearFilters());
    setFilterModalVisible(false);
  };

  const categories: (Category | null)[] = [null, 'Electrical', 'Water', 'Internet', 'Infrastructure'];
  const statuses: (IssueStatus | null)[] = [null, 'Open', 'In Progress', 'Resolved'];

  const hasActiveFilters = filters.category !== null || filters.status !== null;

  const renderContent = () => {
    if (isLoading && items.length === 0) {
      return (
        <View style={styles.skeletonContainer}>
          <IssueCardSkeleton />
          <IssueCardSkeleton />
          <IssueCardSkeleton />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title={hasActiveFilters ? 'No matching issues' : 'No issues yet'}
          message={
            hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Create your first issue to get started'
          }
        />
      );
    }

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <IssueCard
            title={item.title}
            description={item.description}
            category={item.category}
            status={item.status}
            imageUrl={item.imageUrl}
            createdAt={item.createdAt}
            onPress={() => handleIssuePress(item._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Button */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterButton} onPress={openFilterModal}>
          <Text style={styles.filterButtonText}>
            {hasActiveFilters ? '🔍 Filters Active' : '🔍 Filter'}
          </Text>
        </TouchableOpacity>
        {hasActiveFilters && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {renderContent()}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleCreateIssue}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Issues</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Category Filter */}
              <Text style={styles.filterLabel}>Category</Text>
              <View style={styles.filterOptions}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category || 'all'}
                    style={[
                      styles.filterOption,
                      tempFilters.category === category && styles.filterOptionActive,
                    ]}
                    onPress={() => setTempFilters({ ...tempFilters, category })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        tempFilters.category === category && styles.filterOptionTextActive,
                      ]}
                    >
                      {category || 'All'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status Filter */}
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status || 'all'}
                    style={[
                      styles.filterOption,
                      tempFilters.status === status && styles.filterOptionActive,
                    ]}
                    onPress={() => setTempFilters({ ...tempFilters, status })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        tempFilters.status === status && styles.filterOptionTextActive,
                      ]}
                    >
                      {status || 'All'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Reset"
                onPress={resetFilters}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Apply"
                onPress={applyFilters}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  skeletonContainer: {
    padding: theme.spacing.sm,
  },
  listContent: {
    padding: theme.spacing.sm,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.sm,
    bottom: theme.spacing.sm,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.card,
    elevation: 4,
  },
  fabText: {
    fontSize: 32,
    color: theme.colors.background,
    fontWeight: '300',
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
    maxHeight: '80%',
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
  filterLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  filterOption: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  filterOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterOptionText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
  },
  filterOptionTextActive: {
    color: theme.colors.background,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalButton: {
    flex: 1,
  },
});

export default IssueListScreen;
