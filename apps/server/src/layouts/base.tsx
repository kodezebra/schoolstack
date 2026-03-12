import { html } from 'hono/html'

export const BaseLayout = ({ title, description, children, settings }: { title: string, description?: string, children: any, settings?: any }) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <meta name="description" content="${description || ''}" />
      <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries,typography"></script>
      <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <script src="https://unpkg.com/lucide@latest"></script>
      <script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              colors: {
                "primary": "${settings?.primaryColor || '#6366f1'}",
                "accent": "${settings?.accentColor || '#ff6b35'}",
                "electric-teal": "#00f5d4",
                "background-light": "#ffffff",
                "background-dark": "#0f172a",
              },
              fontFamily: {
                "display": ["Quicksand", "sans-serif"],
                "body": ["Plus Jakarta Sans", "sans-serif"],
                "sans": ["Inter", "sans-serif"]
              },
              borderRadius: {"DEFAULT": "0.5rem", "lg": "0.75rem", "xl": "1.25rem", "full": "9999px"},
            },
          },
        }
      </script>
      <style>
        body {
          min-height: max(884px, 100dvh);
        }
        .hero-bg {
          background-image: linear-gradient(to bottom, ${settings?.primaryColor || '#6366f1'}E6, ${settings?.primaryColor || '#6366f1'}F2), url('https://lh3.googleusercontent.com/aida-public/AB6AXuC8gQRE-_OswKUwPWLGKJvUNEtiRYwAdZB2wtH7J0yZs9Jj2tJ5b2gxIeaYeBFhDd5UoKIqWOw1xoPaZZ2eUENMqq_V0fgNCqVYLGQjwyp4SusWXjJvCn92jQ8JVwG3FIJ7Ph0xOodvRV09fUgjbZVKkP1MuUFjZaMLv1rJcPfLx4fE9KoLHEgLDNNvoQu3_AifgxWLthDLut_OkYYPGhvnKqO9ehrCXVnl1vb0Y1i1_O9N2D_lz2DbNpGLsEh5dS2Hf0J1gHEcxxU');
          background-size: cover;
          background-position: center;
        }
      </style>
    </head>
    <body class="font-body bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 selection:bg-primary/20 antialiased">
      ${children}
      <script>
        lucide.createIcons();
      </script>
    </body>
  </html>
`

