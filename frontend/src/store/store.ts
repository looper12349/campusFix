import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import issuesReducer from './issuesSlice';

// Configure Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issuesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['auth/restoreToken/fulfilled'],
      },
    }),
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
