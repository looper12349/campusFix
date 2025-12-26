import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthResponse, RegisterRequest, LoginRequest } from '../types';
import { authService } from '../services';

// Auth state interface
export interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const register = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { rejectValue: string }
>(
  'auth/register',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      return response;
    } catch (error: any) {
      const message = error.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const login = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      const message = error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const restoreToken = createAsyncThunk<
  string | null,
  void,
  { rejectValue: string }
>(
  'auth/restoreToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = await authService.restoreToken();
      return token;
    } catch (error: any) {
      return rejectWithValue('Failed to restore token');
    }
  }
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      return rejectWithValue('Failed to logout');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });

    // Restore token
    builder
      .addCase(restoreToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
      })
      .addCase(restoreToken.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Logout failed';
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
