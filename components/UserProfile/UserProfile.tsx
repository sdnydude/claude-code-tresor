/**
 * UserProfile Component
 * Displays and optionally allows editing of user profile information
 * Generated: 2025-12-16
 */

import React, { useState, FormEvent } from 'react';
import { useUserProfile } from './useUserProfile';
import type { UserProfileProps, UpdateUserPayload } from './types';
import styles from './UserProfile.module.css';

export function UserProfile({
  userId,
  editable = false,
  onUpdate,
  onEditToggle,
  className,
}: UserProfileProps): JSX.Element {
  const { user, isLoading, error, isEditing, setEditing, updateUser, clearError } =
    useUserProfile({ userId, onUpdate });

  const [formData, setFormData] = useState<UpdateUserPayload>({});

  const handleEditClick = () => {
    const newEditState = !isEditing;
    setEditing(newEditState);
    onEditToggle?.(newEditState);

    if (newEditState && user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio || '',
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateUser(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading && !user) {
    return (
      <div className={`${styles.container} ${className || ''}`} data-testid="user-profile-loading">
        <div className={styles.skeleton}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonText} />
          <div className={styles.skeletonText} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${styles.error} ${className || ''}`} data-testid="user-profile-error">
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={clearError} className={styles.retryButton}>
          Dismiss
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${styles.container} ${className || ''}`} data-testid="user-profile-empty">
        <p>User not found</p>
      </div>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid="user-profile">
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          {user.avatar ? (
            <img src={user.avatar} alt={fullName} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
          )}
        </div>

        {editable && (
          <button
            onClick={handleEditClick}
            className={styles.editButton}
            aria-label={isEditing ? 'Cancel editing' : 'Edit profile'}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <button type="submit" className={styles.saveButton} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      ) : (
        <div className={styles.info}>
          <h2 className={styles.name}>{fullName}</h2>
          <p className={styles.email}>{user.email}</p>
          <span className={styles.role}>{user.role}</span>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
        </div>
      )}
    </div>
  );
}
