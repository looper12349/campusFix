# Redux Store Documentation

## Overview

This Redux store implementation uses Redux Toolkit with TypeScript for type-safe state management. It includes two main slices: auth and issues.

## Store Structure

```
store/
├── authSlice.ts      # Authentication state and actions
├── issuesSlice.ts    # Issues state and actions
├── store.ts          # Store configuration
├── hooks.ts          # Typed Redux hooks
└── index.ts          # Public exports
```

## Usage

### 1. Wrap your app with the Redux Provider

```tsx
import { Provider } from 'react-redux';
import { store } from './src/store';

export default function App() {
  return (
    <Provider store={store}>
      {/* Your app components */}
    </Provider>
  );
}
```

### 2. Use typed hooks in components

```tsx
import { useAppDispatch, useAppSelector } from './store/hooks';
import { login, fetchIssues } from './store';

function MyComponent() {
  const dispatch = useAppDispatch();
  const { user, token, isLoading } = useAppSelector(state => state.auth);
  const { items: issues } = useAppSelector(state => state.issues);

  const handleLogin = async () => {
    await dispatch(login({ email: 'user@example.com', password: 'password' }));
  };

  return (
    // Your component JSX
  );
}
```

### 3. Restore token on app startup

```tsx
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { restoreToken } from './store';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreToken());
  }, [dispatch]);

  return (
    // Your app
  );
}
```

## Auth Slice

### State
- `token`: JWT token (stored in AsyncStorage)
- `user`: User object with id, name, email, role
- `isLoading`: Loading state for async operations
- `error`: Error message if any

### Actions
- `register(credentials)`: Register a new user
- `login(credentials)`: Login with email and password
- `logout()`: Logout and clear token
- `restoreToken()`: Restore token from AsyncStorage on app start
- `clearError()`: Clear error state
- `setUser(user)`: Manually set user data

## Issues Slice

### State
- `items`: Array of issues
- `isLoading`: Loading state for async operations
- `error`: Error message if any
- `filters`: Object with category and status filters

### Actions
- `fetchIssues({ isAdmin })`: Fetch issues (student's own or all for admin)
- `createIssue(issueData)`: Create a new issue
- `updateIssueStatus({ issueId, status })`: Update issue status (admin only)
- `addRemark({ issueId, remark })`: Add remark to issue (admin only)
- `setFilters({ category?, status? })`: Set filter values
- `clearFilters()`: Clear all filters
- `clearError()`: Clear error state

## Environment Configuration

Set the API base URL in your environment:

```
EXPO_PUBLIC_API_URL=http://your-api-url.com/api
```

If not set, defaults to `http://localhost:3000/api`

## Persistence

The auth token is automatically persisted to AsyncStorage on login/register and restored on app startup using the `restoreToken` action.
