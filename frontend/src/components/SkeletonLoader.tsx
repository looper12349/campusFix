import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = theme.borderRadius.small,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const IssueCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonLoader width="60%" height={24} />
        <SkeletonLoader width="20%" height={14} />
      </View>
      <SkeletonLoader width="100%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="80%" height={16} style={{ marginBottom: 16 }} />
      <View style={styles.footer}>
        <SkeletonLoader width={80} height={24} />
        <SkeletonLoader width={70} height={24} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.surface,
  },
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
});
