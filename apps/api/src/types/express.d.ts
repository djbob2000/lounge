import type { AuthObject } from '@clerk/backend';

export interface User {
  userId: string;
  sessionId: string;
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      auth: AuthObject;
      user?: User;
    }
  }
}
