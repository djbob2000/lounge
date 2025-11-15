import { SignIn, UserButton } from '@clerk/nextjs';
import { auth, currentUser } from '@clerk/nextjs/server';
import { UserRole } from '@lounge/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SignIn forceRedirectUrl="/admin" fallbackRedirectUrl="/admin" />
      </div>
    );
  }

  // Role check (additional protection, main check in middleware)
  const userRole = user.privateMetadata.role;

  if (userRole !== UserRole.ADMIN) {
    return redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin" className="text-lg font-bold text-foreground">
              Адмін-панель
            </Link>

            <nav className="ml-10 flex space-x-6">
              <Link
                href="/admin/categories"
                className="text-foreground/70 hover:text-foreground transition-colors font-medium"
              >
                Категорії
              </Link>
              <Link
                href="/admin/albums"
                className="text-foreground/70 hover:text-foreground transition-colors font-medium"
              >
                Альбоми
              </Link>
              <Link
                href="/admin/photos"
                className="text-foreground/70 hover:text-foreground transition-colors font-medium"
              >
                Фотографії
              </Link>
              <Link href="/" className="text-foreground/70 hover:text-foreground transition-colors font-medium">
                На сайт
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  );
}
