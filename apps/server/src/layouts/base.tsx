import { html, raw } from 'hono/html'
import { getFontStack, BORDER_RADIUS_OPTIONS } from '../lib/themes'

interface BaseLayoutProps {
  title: string
  description?: string
  children: any
  settings?: any
}

export const BaseLayout = ({ title, description, children, settings }: BaseLayoutProps) => {
  // Theme configuration with defaults
  const primaryColor = settings?.primaryColor || '#6366f1'
  const accentColor = settings?.accentColor || '#ff6b35'
  const backgroundLight = settings?.backgroundLight || '#f6f7f8'
  const backgroundDark = settings?.backgroundDark || '#101922'
  const fontDisplay = settings?.fontDisplay || 'Quicksand'
  const fontBody = settings?.fontBody || 'Plus Jakarta Sans'
  const borderRadius = settings?.borderRadius || 'lg'
  const darkMode = settings?.darkMode || 'system'

  // Build font list for Google Fonts v2 API
  const fonts = [fontDisplay, fontBody].filter((f, i, arr) => arr.indexOf(f) === i)
  const fontParams = fonts.map(f => `family=${f.replace(/\s+/g, '+')}:wght@400;500;600;700;800`).join('&')
  const fontUrl = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`

  // Build font stacks
  const fontDisplayStack = getFontStack(fontDisplay)
  const fontBodyStack = getFontStack(fontBody)

  // Get border radius value
  const radiusValue = BORDER_RADIUS_OPTIONS.find(o => o.id === borderRadius)?.value || '0.5rem'

  // Dark mode script
  const darkModeScript = `
    (function() {
      const mode = '${darkMode}';
      const storedTheme = localStorage.getItem('theme');
      
      const applyTheme = (theme) => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      if (storedTheme) {
        applyTheme(storedTheme);
      } else if (mode === 'dark') {
        applyTheme('dark');
      } else if (mode === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          applyTheme('dark');
        }
      }

      window.toggleTheme = function() {
        const isDark = document.documentElement.classList.toggle('dark');
        const newTheme = isDark ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        document.cookie = "theme=" + newTheme + "; path=/; max-age=31536000";
        if (window.lucide) window.lucide.createIcons();
        console.log('Theme toggled to:', newTheme);
      }

      document.addEventListener('click', function(e) {
        document.querySelectorAll('[id^="dropdown-"]').forEach(function(dropdown) {
          if (!dropdown.contains(e.target) && !e.target.closest('button[onclick^="document.getElementById"]')) {
            dropdown.classList.add('hidden');
            dropdown.classList.remove('block');
          }
        });
      });
    })();
  `

  return html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <meta name="description" content="${description || ''}" />
      <link rel="icon" type="image/png" href="${settings?.favicon || '/favicon.png'}" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="${fontUrl}" rel="stylesheet" />
      <link rel="stylesheet" href="/style.css" />     
      <script src="/lucide.min.js"></script>
      <style>
        ${raw(`
        :root {
          /* Theme Variables */
          --primary: ${primaryColor};
          --accent: ${accentColor};
          --font-display: ${fontDisplayStack};
          --font-body: ${fontBodyStack};
          --radius: ${radiusValue};
          
          /* Background and Text - Light Mode */
          --app-bg: ${backgroundLight};
          --app-text: #0f172a;
        }

        /* Dark Mode Overrides */
        .dark {
          --app-bg: ${backgroundDark};
          --app-text: #f8fafc;
        }

        html, body {
          min-height: 100dvh;
        }
        .hero-bg {
          background-image: linear-gradient(to bottom, ${primaryColor}E6, ${primaryColor}F2), url('https://lh3.googleusercontent.com/aida-public/AB6AXuC8gQRE-_OswKUwPWLGKJvUNEtiRYwAdZB2wtH7J0yZs9Jj2tJ5b2gxIeaYeBFhDd5UoKIqWOw1xoPaZZ2eUENMqq_V0fgNCqVYLGQjwyp4SusWXjJvCn92jQ8JVwG3FIJ7Ph0xOodvRV09fUgjbZVKkP1MuUFjZaMLv1rJcPfLx4fE9KoLHEgLDNNvoQu3_AifgxWLthDLut_OkYYPGhvnKqO9ehrCXVnl1vb0Y1i1_O9N2D_lz2DbNpGLsEh5dS2Hf0J1gHEcxxU');
          background-size: cover;
          background-position: center;
        }
        `)}
      </style>
      <script>${raw(darkModeScript)}</script>
    </head>
    <body class="font-body bg-app-bg text-app-text selection:bg-primary/20 antialiased">
      ${children}
      <script>
        if (window.lucide) lucide.createIcons();
      </script>
    </body>
  </html>
  `
}

