/**
 * UserProfile Component Tests
 * Generated: 2025-12-16
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../UserProfile';
import type { User } from '../types';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUser: User = {
  id: 'user-123',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Software developer',
  role: 'user',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-12-16T00:00:00Z',
};

describe('UserProfile', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('Loading State', () => {
    it('shows loading skeleton initially', () => {
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<UserProfile userId="user-123" />);

      expect(screen.getByTestId('user-profile-loading')).toBeInTheDocument();
    });
  });

  describe('Successful Data Fetch', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });
    });

    it('displays user information after loading', async () => {
      render(<UserProfile userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('Software developer')).toBeInTheDocument();
    });

    it('displays avatar when provided', async () => {
      render(<UserProfile userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByRole('img')).toHaveAttribute(
          'src',
          'https://example.com/avatar.jpg'
        );
      });
    });

    it('displays initials when no avatar', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockUser, avatar: undefined }),
      });

      render(<UserProfile userId="user-123" />);

      await waitFor(() => {
        expect(screen.getByText('JD')).toBeInTheDocument();
      });
    });

    it('applies custom className', async () => {
      render(<UserProfile userId="user-123" className="custom-class" />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toHaveClass('custom-class');
      });
    });
  });

  describe('Error State', () => {
    it('displays error message on fetch failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      render(<UserProfile userId="invalid-id" />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-error')).toBeInTheDocument();
      });

      expect(screen.getByText(/Failed to fetch user/)).toBeInTheDocument();
    });

    it('clears error when dismiss button clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      render(<UserProfile userId="invalid-id" />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-error')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Dismiss'));

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-empty')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });
    });

    it('does not show edit button when editable is false', async () => {
      render(<UserProfile userId="user-123" editable={false} />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('shows edit button when editable is true', async () => {
      render(<UserProfile userId="user-123" editable />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });
    });

    it('toggles to edit mode when edit button clicked', async () => {
      const user = userEvent.setup();

      render(<UserProfile userId="user-123" editable />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    });

    it('calls onEditToggle callback when edit mode changes', async () => {
      const onEditToggle = jest.fn();
      const user = userEvent.setup();

      render(<UserProfile userId="user-123" editable onEditToggle={onEditToggle} />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit profile/i }));
      expect(onEditToggle).toHaveBeenCalledWith(true);

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onEditToggle).toHaveBeenCalledWith(false);
    });

    it('pre-fills form with current user data', async () => {
      const user = userEvent.setup();

      render(<UserProfile userId="user-123" editable />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      expect(screen.getByLabelText('First Name')).toHaveValue('John');
      expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
      expect(screen.getByLabelText('Bio')).toHaveValue('Software developer');
    });
  });

  describe('Form Submission', () => {
    const updatedUser: User = {
      ...mockUser,
      firstName: 'Jane',
      lastName: 'Smith',
    };

    beforeEach(() => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => updatedUser,
        });
    });

    it('submits updated data when form is saved', async () => {
      const user = userEvent.setup();
      const onUpdate = jest.fn();

      render(<UserProfile userId="user-123" editable onUpdate={onUpdate} />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      const firstNameInput = screen.getByLabelText('First Name');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');

      const lastNameInput = screen.getByLabelText('Last Name');
      await user.clear(lastNameInput);
      await user.type(lastNameInput, 'Smith');

      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/users/user-123', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Jane'),
        });
      });

      expect(onUpdate).toHaveBeenCalledWith(updatedUser);
    });

    it('exits edit mode after successful save', async () => {
      const user = userEvent.setup();

      render(<UserProfile userId="user-123" editable />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit profile/i }));
      await user.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });
    });

    it('has accessible edit button', async () => {
      render(<UserProfile userId="user-123" editable />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
      });
    });

    it('has properly labeled form fields', async () => {
      const user = userEvent.setup();

      render(<UserProfile userId="user-123" editable />);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /edit profile/i }));

      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
    });
  });
});
