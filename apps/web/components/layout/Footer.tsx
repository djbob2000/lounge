import Link from 'next/link';

export const Footer = () => {
  const currentYear = 2027;

  return (
    <footer className="py-8 px-6 bg-secondary/50 border-t mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <Link href="/" className="text-xl font-bold text-foreground">
              Lounge Photo
            </Link>
          </div>

          <div className="text-sm text-foreground/70">
            © {currentYear} Lounge Photography. Всі права захищені.
          </div>

          <div className="flex space-x-6">
            <Link
              href="#"
              className="text-foreground/70 hover:text-primary transition-colors font-medium"
            >
              Instagram
            </Link>
            <Link
              href="#"
              className="text-foreground/70 hover:text-primary transition-colors font-medium"
            >
              Facebook
            </Link>
            <Link
              href="#"
              className="text-foreground/70 hover:text-primary transition-colors font-medium"
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
