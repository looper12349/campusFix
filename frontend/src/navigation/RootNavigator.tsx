import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { restoreToken } from '../store/authSlice';
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import AdminNavigator from './AdminNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, user, isLoading } = useAppSelector((state) => state.auth);

  // Restore token on app start
  useEffect(() => {
    dispatch(restoreToken());
  }, [dispatch]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!token ? (
        // User is not authenticated - show auth screens
        <AuthNavigator />
      ) : user?.role === 'admin' ? (
        // User is authenticated as admin - show admin navigator
        <AdminNavigator />
      ) : (
        // User is authenticated as student - show student navigator
        <StudentNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default RootNavigator;
