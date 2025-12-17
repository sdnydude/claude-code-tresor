/**
 * useUserProfile Hook
 * Custom hook for managing user profile state and operations
 * Generated: 2025-12-16
 */

import { useState, useEffect, useCallback } from 'react';
import type { User, UserProfileState, UpdateUserPayload } from './types';

interface UseUserProfileOptions {
  userId: string;
  onUpdate?: (user: User) => void;
}

interface UseUserProfileReturn extends UserProfileState {
  fetchUser: () => Promise<void>;
  updateUser: (payload: UpdateUserPayload) => Promise<void>;
  setEditing: (isEditing: boolean) => void;
  clearError: () => void;
}

export function useUserProfile({
  userId,
  onUpdate,
}: UseUserProfileOptions): UseUserProfileReturn {
  const [state, setState] = useState<UserProfileState>({
    user: null,
    isLoading: true,
    error: null,
    isEditing: false,
  });

  const fetchUser = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Replace with your actual API call
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const user: User = await response.json();
      setState((prev) => ({ ...prev, user, isLoading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user';
      setState((prev) => ({ ...prev, error: message, isLoading: false }));
    }
  }, [userId]);

  const updateUser = useCallback(
    async (payload: UpdateUserPayload) => {
      if (!state.user) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Replace with your actual API call
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to update user: ${response.statusText}`);
        }

        const updatedUser: User = await response.json();
        setState((prev) => ({
          ...prev,
          user: updatedUser,
          isLoading: false,
          isEditing: false,
        }));

        onUpdate?.(updatedUser);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update user';
        setState((prev) => ({ ...prev, error: message, isLoading: false }));
      }
    },
    [userId, state.user, onUpdate]
  );

  const setEditing = useCallback((isEditing: boolean) => {
    setState((prev) => ({ ...prev, isEditing }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    ...state,
    fetchUser,
    updateUser,
    setEditing,
    clearError,
  };
}
