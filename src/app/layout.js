// src/app/layout.js
import './globals.css';

export const metadata = {
  title: 'LottoHQ | Resultados Oficiales de Loterías de EE. UU. y el Mundo',
  description: 'Consulta los últimos resultados, números ganadores, botes acumulados y premios del Powerball, Mega Millions y loterías por estado.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-red-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
