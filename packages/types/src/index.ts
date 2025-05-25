// Export shared types
export * from "./models";
export * from "./api";

// Legacy types
export interface Message {
  text: string;
}

/**
 * User roles constants
 */
export const UserRole = {
  ADMIN: "admin",
  USER: "user",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
