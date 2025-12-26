import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Issue, Category, IssueStatus, CreateIssueRequest } from '../types';
import { RootState } from './store';
import { issuesService } from '../services';

// Issues state interface
export interface IssuesState {
  items: Issue[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category: Category | null;
    status: IssueStatus | null;
  };
}

// Initial state
const initialState: IssuesState = {
  items: [],
  isLoading: false,
  error: null,
  filters: {
    category: null,
    status: null,
  },
};

// Async thunks
export const fetchIssues = createAsyncThunk<
  Issue[],
  { isAdmin?: boolean },
  { rejectValue: string; state: RootState }
>(
  'issues/fetchIssues',
  async ({ isAdmin = false }, { rejectWithValue, getState }) => {
    try {
      const { issues } = getState();
      
      const filters = {
        category: issues.filters.category,
        status: issues.filters.status,
      };

      const response = isAdmin
        ? await issuesService.getAllIssues(filters)
        : await issuesService.getMyIssues(filters);
      
      return response;
    } catch (error: any) {
      const message = error.message || 'Failed to fetch issues';
      return rejectWithValue(message);
    }
  }
);

export const createIssue = createAsyncThunk<
  Issue,
  CreateIssueRequest,
  { rejectValue: string; state: RootState }
>(
  'issues/createIssue',
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await issuesService.createIssue(issueData);
      return response;
    } catch (error: any) {
      const message = error.message || 'Failed to create issue';
      return rejectWithValue(message);
    }
  }
);

export const updateIssueStatus = createAsyncThunk<
  Issue,
  { issueId: string; status: IssueStatus },
  { rejectValue: string; state: RootState }
>(
  'issues/updateIssueStatus',
  async ({ issueId, status }, { rejectWithValue }) => {
    try {
      const response = await issuesService.updateIssueStatus(issueId, status);
      return response;
    } catch (error: any) {
      const message = error.message || 'Failed to update issue status';
      return rejectWithValue(message);
    }
  }
);

export const addRemark = createAsyncThunk<
  Issue,
  { issueId: string; remark: string },
  { rejectValue: string; state: RootState }
>(
  'issues/addRemark',
  async ({ issueId, remark }, { rejectWithValue }) => {
    try {
      const response = await issuesService.addRemark(issueId, remark);
      return response;
    } catch (error: any) {
      const message = error.message || 'Failed to add remark';
      return rejectWithValue(message);
    }
  }
);

// Issues slice
const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<{ category?: Category | null; status?: IssueStatus | null }>) => {
      if (action.payload.category !== undefined) {
        state.filters.category = action.payload.category;
      }
      if (action.payload.status !== undefined) {
        state.filters.status = action.payload.status;
      }
    },
    clearFilters: (state) => {
      state.filters.category = null;
      state.filters.status = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch issues
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch issues';
      });

    // Create issue
    builder
      .addCase(createIssue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload); // Add new issue to the beginning
        state.error = null;
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create issue';
      });

    // Update issue status
    builder
      .addCase(updateIssueStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(issue => issue._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateIssueStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update issue status';
      });

    // Add remark
    builder
      .addCase(addRemark.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addRemark.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.items.findIndex(issue => issue._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(addRemark.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to add remark';
      });
  },
});

export const { setFilters, clearFilters, clearError } = issuesSlice.actions;
export default issuesSlice.reducer;
