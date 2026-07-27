// src/app/page.js
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirección por defecto a EE. UU. (Fase 1 del proyecto)
  redirect('/us');
}
