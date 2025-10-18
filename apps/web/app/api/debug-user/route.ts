import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      privateMetadata: user.privateMetadata,
      role: user.privateMetadata.role,
      hasAdminRole: user.privateMetadata.role === 'admin',
      isMiddlewareAdmin: hasAdminRole(user),
    });
  } catch (error) {
    console.error('Error in debug-user route:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 },
    );
  }
}

// Helper function to check for admin role (copied from middleware)
const hasAdminRole = (user: any): boolean => {
  if (
    user &&
    typeof user.privateMetadata === 'object' &&
    user.privateMetadata !== null &&
    'role' in user.privateMetadata
  ) {
    return (user.privateMetadata as { role?: unknown }).role === 'admin';
  }
  return false;
};
