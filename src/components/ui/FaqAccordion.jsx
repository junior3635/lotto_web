// src/components/ui/FaqAccordion.jsx
// Acordeón interactivo de Preguntas Frecuentes (FAQs) optimizado para SEO y Rich Snippets de Google

'use client';

import React, { useState } from 'react';

export default function FaqAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={index}
            className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-colors"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-200 hover:text-white transition-colors"
            >
              <span>{item.question}</span>
              <span className="text-slate-500 font-mono text-xs">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="px-5 pb-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
