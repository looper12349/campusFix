// Export store configuration
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Export hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Export auth slice
export { 
  clearError as clearAuthError, 
  setUser,
  register,
  login,
  logout,
  restoreToken,
} from './authSlice';
export type { AuthState } from './authSlice';

// Export issues slice
export {
  setFilters,
  clearFilters,
  clearError as clearIssuesError,
  fetchIssues,
  createIssue,
  updateIssueStatus,
  addRemark,
} from './issuesSlice';
export type { IssuesState } from './issuesSlice';
