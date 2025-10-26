export default function GlobalNotFound() {
  return (
    <div className="font-sans bg-gradient-to-br from-blue-500 to-purple-600 min-h-screen flex items-center justify-center text-white">
      <div className="text-center p-8 max-w-lg">
        <div className="text-8xl font-bold mb-4 text-shadow animate-pulse">404</div>
        <h1 className="text-3xl mb-4 opacity-90">Сторінка не знайдена</h1>
        <p className="text-lg mb-8 opacity-80 leading-relaxed">
          На жаль, запитувана сторінка не існує або була переміщена. Перевірте правильність введеної
          адреси або поверніться на головну сторінку.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-white/20 border-2 border-white/30 rounded-lg hover:bg-white/30 hover:border-white/50 transition-all duration-300 font-medium"
        >
          Повернутися на головну
        </a>
      </div>
    </div>
  );
}
