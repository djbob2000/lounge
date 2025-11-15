import Link from 'next/link';

export const Footer = () => {
  const currentYear = 2027;

  return (
    <footer className="py-8 px-6 bg-background border-t mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <Link href="/" className="text-xl font-semibold">
              Lounge
            </Link>
          </div>

          <div className="text-sm text-muted-foreground">
            © {currentYear} Lounge Photography. Всі права захищені.
          </div>

          <div className="flex space-x-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Instagram
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Facebook
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
