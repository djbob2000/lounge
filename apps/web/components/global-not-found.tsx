export default function GlobalNotFound() {
  return (
    <div className="not-found-container">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          .not-found-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }
          
          .container {
            text-align: center;
            padding: 2rem;
            max-width: 600px;
          }
          
          .error-code {
            font-size: 8rem;
            font-weight: bold;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
          }
          
          .error-title {
            font-size: 2rem;
            margin-bottom: 1rem;
            opacity: 0.9;
          }
          
          .error-description {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            opacity: 0.8;
            line-height: 1.6;
          }
          
          .home-button {
            display: inline-block;
            padding: 12px 24px;
            background: rgba(25,255,255,0.2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            border: 2px solid rgba(255,255,255,0.3);
            transition: all 0.3s ease;
            font-weight: 500;
          }
          
          .home-button:hover {
            background: rgba(255,255,255,0.3);
            border-color: rgba(255,255,255,0.5);
            transform: translateY(-2px);
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @media (max-width: 768px) {
            .error-code {
              font-size: 6rem;
            }
            
            .error-title {
              font-size: 1.5rem;
            }
            
            .container {
              padding: 1rem;
            }
          }
        `,
        }}
      />
      <div className="container">
        <div className="error-code">404</div>
        <h1 className="error-title">Сторінка не знайдена</h1>
        <p className="error-description">
          На жаль, запитувана сторінка не існує або була переміщена. Перевірте правильність введеної
          адреси або поверніться на головну сторінку.
        </p>
        <a href="/" className="home-button">
          Повернутися на головну
        </a>
      </div>
    </div>
  );
}
