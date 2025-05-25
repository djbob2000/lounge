import type { AuthObject } from '@clerk/backend';

declare global {
  namespace Express {
    interface Request {
      auth: AuthObject;
    }
  }
}

// Export an empty object to make this a module
export {};
