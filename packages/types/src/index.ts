// Export shared types

export * from './api';
export * from './models';

// Legacy types
export interface Message {
  text: string;
}

/**
 * User roles constants
 */
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
