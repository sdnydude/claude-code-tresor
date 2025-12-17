/**
 * UserProfile Component Types
 * Generated: 2025-12-16
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface UserProfileProps {
  /** User ID to fetch and display */
  userId: string;
  /** Show edit controls */
  editable?: boolean;
  /** Callback when user data is updated */
  onUpdate?: (user: User) => void;
  /** Callback when edit mode is toggled */
  onEditToggle?: (isEditing: boolean) => void;
  /** Custom CSS class */
  className?: string;
}

export interface UserProfileState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
}
