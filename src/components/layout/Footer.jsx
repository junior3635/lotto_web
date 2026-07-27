// src/components/layout/Footer.jsx
// Footer global con enlaces de navegación rápida y descargos de responsabilidad legal estilo 

import React from 'react';
import Link from 'next/link';

export default function Footer({ currentCountry = 'us' }) {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Brand & Disclaimer */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎰</span>
              <span className="font-black text-lg text-white tracking-tight">LottoHQ</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Tu fuente confiable para verificar los números ganadores, botes acumulados y resultados en tiempo real de las principales loterías del mundo.
            </p>
          </div>

          {/* Columna 2: Loterías Destacadas */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Loterías Principales</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href={`/${currentCountry}/powerball`} className="hover:text-amber-400 transition-colors">Powerball EE. UU.</Link></li>
              <li><Link href={`/${currentCountry}/mega-millions`} className="hover:text-amber-400 transition-colors">Mega Millions EE. UU.</Link></li>
              <li><Link href="/es/euromillones" className="hover:text-amber-400 transition-colors">EuroMillones España</Link></li>
              <li><Link href="/mx/melate" className="hover:text-amber-400 transition-colors">Melate México</Link></li>
            </ul>
          </div>

          {/* Columna 3: Estados Populares */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Loterías por Estado</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href={`/${currentCountry}/estado/florida`} className="hover:text-white transition-colors">Florida (FL)</Link></li>
              <li><Link href={`/${currentCountry}/estado/texas`} className="hover:text-white transition-colors">Texas (TX)</Link></li>
              <li><Link href={`/${currentCountry}/estado/california`} className="hover:text-white transition-colors">California (CA)</Link></li>
              <li><Link href={`/${currentCountry}/estado/new-york`} className="hover:text-white transition-colors">New York (NY)</Link></li>
            </ul>
          </div>

          {/* Columna 4: Juego Responsable */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm">Juego Responsable</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Juega de manera responsable. La información de esta página es únicamente informativa. Verifica siempre tus boletos físicos en una tienda o agente oficial autorizado.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} LottoHQ. Inspirado en estándares globales de transparencia.</p>
          <div className="flex items-center gap-4">
            <span>Privacidad</span>
            <span>Términos de Servicio</span>
            <span>Contacto</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
