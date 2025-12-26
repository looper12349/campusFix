import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import IssueListScreen from '../screens/IssueListScreen';
import CreateIssueScreen from '../screens/CreateIssueScreen';
import IssueDetailScreen from '../screens/IssueDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme';

// Stack param lists
export type IssuesStackParamList = {
  IssueList: undefined;
  CreateIssue: undefined;
  IssueDetail: { issueId: string };
};

export type StudentTabParamList = {
  IssuesTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();
const IssuesStack = createStackNavigator<IssuesStackParamList>();

// Issues Stack Navigator
const IssuesStackNavigator: React.FC = () => {
  return (
    <IssuesStack.Navigator
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
      <IssuesStack.Screen 
        name="IssueList" 
        component={IssueListScreen}
        options={{ title: 'My Issues' }}
      />
      <IssuesStack.Screen 
        name="CreateIssue" 
        component={CreateIssueScreen}
        options={{ title: 'Create Issue' }}
      />
      <IssuesStack.Screen 
        name="IssueDetail" 
        component={IssueDetailScreen}
        options={{ title: 'Issue Details' }}
      />
    </IssuesStack.Navigator>
  );
};

// Student Tab Navigator
const StudentNavigator: React.FC = () => {
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
        name="IssuesTab" 
        component={IssuesStackNavigator}
        options={{ 
          title: 'Issues',
          tabBarLabel: 'Issues',
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

export default StudentNavigator;
