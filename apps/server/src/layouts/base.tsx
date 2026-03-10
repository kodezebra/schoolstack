import { html } from 'hono/html'

export const BaseLayout = ({ title, description, children }: { title: string, description?: string, children: any }) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <meta name="description" content="${description || ''}" />
      <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; }
        .prose p { margin-bottom: 1.5rem; }
      </style>
    </head>
    <body class="bg-white text-slate-900 selection:bg-blue-100 antialiased">
      ${children}
    </body>
  </html>
`
