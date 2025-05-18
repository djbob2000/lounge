import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const user = await currentUser();

  // Authentication check (additional protection, main check in middleware)
  if (!userId || !user) {
    return redirect("/sign-in");
  }

  // Role check (additional protection, main check in middleware)
  if (user.privateMetadata.role !== "admin") {
    return redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/admin" className="text-lg font-bold text-gray-900">
              Адмін-панель
            </Link>

            <nav className="ml-10 flex space-x-6">
              <Link
                href="/admin/categories"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Категорії
              </Link>
              <Link
                href="/admin/albums"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Альбоми
              </Link>
              <Link
                href="/admin/photos"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Фотографії
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                На сайт
              </Link>
            </nav>
          </div>

          <div className="flex items-center">
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
