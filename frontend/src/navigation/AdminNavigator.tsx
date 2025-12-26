import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminIssueDetailScreen from '../screens/AdminIssueDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

// Stack param lists
export type AdminIssuesStackParamList = {
  AdminDashboard: undefined;
  AdminIssueDetail: { issueId: string };
};

export type AdminStackParamList = AdminIssuesStackParamList;

export type AdminTabParamList = {
  AllIssuesTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();
const AdminIssuesStack = createStackNavigator<AdminIssuesStackParamList>();

// Admin Issues Stack Navigator
const AdminIssuesStackNavigator: React.FC = () => {
  return (
    <AdminIssuesStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <AdminIssuesStack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen}
        options={{ title: 'All Issues' }}
      />
      <AdminIssuesStack.Screen 
        name="AdminIssueDetail" 
        component={AdminIssueDetailScreen}
        options={{ title: 'Manage Issue' }}
      />
    </AdminIssuesStack.Navigator>
  );
};

// Admin Tab Navigator
const AdminNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="AllIssuesTab" 
        component={AdminIssuesStackNavigator}
        options={{ 
          title: 'All Issues',
          tabBarLabel: 'All Issues',
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
