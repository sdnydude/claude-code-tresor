/**
 * useUserProfile Hook Tests
 * Generated: 2025-12-16
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserProfile } from '../useUserProfile';
import type { User } from '../types';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUser: User = {
  id: 'user-123',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-12-16T00:00:00Z',
};

describe('useUserProfile', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('Initial Fetch', () => {
    it('fetches user on mount', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const { result } = renderHook(() =>
        useUserProfile({ userId: 'user-123' })
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/users/user-123');
      expect(result.current.user).toEqual(mockUser);
    });

    it('sets error on fetch failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      const { result } = renderHook(() =>
        useUserProfile({ userId: 'invalid-id' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch user: Not Found');
      expect(result.current.user).toBeNull();
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() =>
        useUserProfile({ userId: 'user-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Refetch on userId change', () => {
    it('refetches when userId changes', async () => {
      const user2: User = { ...mockUser, id: 'user-456', firstName: 'Jane' };

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockUser })
        .mockResolvedValueOnce({ ok: true, json: async () => user2 });

      const { result, rerender } = renderHook(
        ({ userId }) => useUserProfile({ userId }),
        { initialProps: { userId: 'user-123' } }
      );

      await waitFor(() => {
        expect(result.current.user?.id).toBe('user-123');
      });

      rerender({ userId: 'user-456' });

      await waitFor(() => {
        expect(result.current.user?.id).toBe('user-456');
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });
    });

    it('updates user successfully', async () => {
      const updatedUser: User = { ...mockUser, firstName: 'Jane' };

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockUser })
        .mockResolvedValueOnce({ ok: true, json: async () => updatedUser });

      const onUpdate = jest.fn();
      const { result } = renderHook(() =>
        useUserProfile({ userId: 'user-123', onUpdate })
      );

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.updateUser({ firstName: 'Jane' });
      });

      expect(mockFetch).toHaveBeenLastCalledWith('/api/users/user-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Jane' }),
      });

      expect(result.current.user).toEqual(updatedUser);
      expect(onUpdate).toHaveBeenCalledWith(updatedUser);
    });

    it('sets error on update failure', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockUser })
        .mockResolvedValueOnce({ ok: false, statusText: 'Forbidden' });

      const { result } = renderHook(() =>
        useUserProfile({ userId: 'user-123' })
      );

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      await act(async () => {
        await result.current.updateUser({ firstName: 'Jane' });
      });

      expect(result.current.error).toBe('Failed to update user: Forbidden');
    });

    it('does nothing if user is null', async () => {
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Not Found' });

      const { result } = renderHook(() =>
        useUserProfile({ userId: 'invalid-id' })
      );

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      const fetchCallCount = mockFetch.mock.calls.length;

      await act(async () => {
        await result.current.updateUser({ firstName: 'Jane' });
      });

      expect(mockFetch).toHaveBeenCalledTimes(fetchCallCount);
    });

    it('exits edit mode after successful update', async () => {
      const updatedUser: User = { ...mockUser, firstName: 'Jane' };

      mockFetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockUser })
        .mockResolvedValueOnce({ ok: true, json: async () => updatedUser });

      const { result } = renderHook(() =>
        useUserProfile({ userId: 'user-123' })
      );

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      act(() => {
        result.current.setEditing(true);
      });

      expect(result.current.isEditing).toBe(true);

      await act(async () => {
        await result.current.updateUser({ firstName: 'Jane' });
      });

      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('setEditing', () => {
    it('toggles editing state', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => mockUser });

      const { result } = renderHook(() =>
        useUserProfile({ userId: 'user-123' })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isEditing).toBe(false);

      act(() => {
        result.current.setEditing(true);
      });

      expect(result.current.isEditing).toBe(true);

      act(() => {
        result.current.setEditing(false);
      });

      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('clearError', () => {
    it('clears error state', async () => {
      mockFetch.mockResolvedValue({ ok: false, statusText: 'Not Found' });

      const { result } = renderHook(() =>
        useUserProfile({ userId: 'invalid-id' })
      );

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('fetchUser', () => {
    it('can manually refetch user', async () => {
      mockFetch.mockResolvedValue({ ok: true, json: async () => mockUser });

      const { result } = renderHook(() =>
        useUserProfile({ userId: 'user-123' })
      );

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      const updatedUser: User = { ...mockUser, bio: 'Updated bio' };
      mockFetch.mockResolvedValue({ ok: true, json: async () => updatedUser });

      await act(async () => {
        await result.current.fetchUser();
      });

      expect(result.current.user).toEqual(updatedUser);
    });
  });
});
