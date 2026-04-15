import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@/app/styles/index.css";
import App from "@/app";

import { ThemeProvider } from "@/shared/providers/ThemeProvider";
import { AuthProvider } from '@/shared/providers/AuthProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
