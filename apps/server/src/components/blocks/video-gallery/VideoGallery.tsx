import { html, raw } from 'hono/html'
import { renderIcon } from '../utils'
import type { VideoItem } from '@/lib/video-utils'

export const VideoGallery = ({ content }: { content: any }) => {
  const paddingStyleStr = content.styles?.paddingY !== undefined 
    ? `padding-top: ${content.styles.paddingY}px; padding-bottom: ${content.styles.paddingY}px;` 
    : ''

  const items = (content.items || []) as VideoItem[]

  return html`
    <section class="py-32 bg-slate-50 dark:bg-slate-900/50" data-animate="fade-up" style="${paddingStyleStr}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-3xl mx-auto mb-20" data-animate-item>
          ${content.tagline ? html`<h2 class="text-accent font-display font-bold tracking-[0.2em] uppercase text-sm mb-4">${content.tagline}</h2>` : ''}
          <h3 class="text-4xl font-display font-bold text-slate-900 dark:text-white sm:text-5xl mb-6">
            ${content.title || "Video Showcase"}
          </h3>
          ${content.subtitle ? html`<p class="mt-6 text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">${content.subtitle}</p>` : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-video-gallery>
          ${items.map((item, index) => {
            const isPortrait = item.platform === 'tiktok'
            const aspectClass = isPortrait ? 'aspect-[9/16] max-h-[80vh]' : 'aspect-video'
            return raw(`
            <div 
              class="video-item group rounded-2xl overflow-hidden ${aspectClass} bg-slate-200 dark:bg-slate-800 shadow-lg card-hover relative" 
              data-video-index="${index}"
              data-platform="${item.platform}"
              data-embed-url="${item.embedUrl || ''}"
              data-original-url="${item.url || ''}"
              data-embed-allowed="${item.embedAllowed !== false}"
              data-animate-item
            >
              <div class="video-thumbnail absolute inset-0" style="${item.thumbnail ? `background-image: url('${item.thumbnail}'); background-size: cover; background-position: center;` : ''}">
                ${!item.thumbnail ? `
                  <div class="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <span class="text-slate-500 dark:text-slate-600 font-medium text-sm uppercase">${item.platform || 'Video'}</span>
                  </div>
                ` : ''}
                <div class="absolute inset-0 bg-slate-900/40 flex items-center justify-center group-hover:bg-slate-900/50 transition-colors">
                  ${item.embedAllowed !== false ? `
                    <button class="play-btn w-16 h-16 bg-primary/90 backdrop-blur-md rounded-full flex items-center justify-center border border-primary/50 cursor-pointer hover:scale-110 hover:bg-primary transition-all shadow-xl" data-play="${index}">
                      ${renderIcon('play', 'w-8 h-8 text-white ml-1')}
                    </button>
                  ` : `
                    <button class="play-btn tiktok-btn flex items-center gap-2 px-5 py-3 bg-slate-900/90 backdrop-blur-md rounded-full border border-slate-700 cursor-pointer hover:bg-slate-800 hover:scale-105 transition-all shadow-xl" data-play="${index}" data-external="${item.url}">
                      ${renderIcon('play', 'w-5 h-5 text-white')}
                      <span class="text-white font-semibold text-sm">Watch on TikTok</span>
                    </button>
                  `}
                </div>
                ${item.title ? `
                  <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900/80 to-transparent">
                    <p class="text-white font-bold text-sm">${item.title}</p>
                  </div>
                ` : ''}
              </div>
              <div class="video-player absolute inset-0 hidden">
                <iframe 
                  class="video-iframe w-full h-full"
                  data-index="${index}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
                <button class="close-btn absolute top-2 right-2 w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white z-10 transition-colors" data-close="${index}">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div class="tiktok-fallback absolute inset-0 hidden bg-slate-900 flex flex-col items-center justify-center p-6">
                <div class="text-center">
                  <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg class="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                    </svg>
                  </div>
                  <p class="text-white font-medium mb-2">Unable to embed video</p>
                  <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-full transition-colors">
                    ${renderIcon('external-link', 'w-4 h-4')}
                    Watch on TikTok
                  </a>
                </div>
              </div>
            </div>
          `)})}
        </div>
      </div>
      <script>
        (function() {
          function initVideoGallery() {
            document.querySelectorAll('[data-video-gallery]').forEach(gallery => {
              gallery.querySelectorAll('.play-btn[data-play]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  const index = parseInt(btn.dataset.play);
                  const container = btn.closest('.video-item');
                  
                  if (container && container.dataset.platform === 'tiktok') {
                    const embedUrl = container.dataset.embedUrl;
                    const originalUrl = container.dataset.originalUrl;
                    playTikTokVideo(index, embedUrl, originalUrl, container);
                  } else {
                    playVideo(index);
                  }
                });
              });
              
              gallery.querySelectorAll('.close-btn[data-close]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  const index = parseInt(btn.dataset.close);
                  closeVideo(index);
                });
              });
            });
          }
          
          function playVideo(index) {
            const container = document.querySelector('[data-video-index="' + index + '"]');
            if (!container) return;
            
            const thumbnail = container.querySelector('.video-thumbnail');
            const player = container.querySelector('.video-player');
            const iframe = container.querySelector('.video-iframe');
            
            if (thumbnail && player && iframe) {
              const embedUrl = container.dataset.embedUrl;
              thumbnail.classList.add('hidden');
              iframe.src = embedUrl;
              player.classList.remove('hidden');
            }
          }
          
          function playTikTokVideo(index, embedUrl, originalUrl, container) {
            const thumbnail = container.querySelector('.video-thumbnail');
            const player = container.querySelector('.video-player');
            const iframe = container.querySelector('.video-iframe');
            const fallback = container.querySelector('.tiktok-fallback');
            
            if (!thumbnail || !player || !iframe || !fallback) return;
            
            thumbnail.classList.add('hidden');
            iframe.src = embedUrl;
            player.classList.remove('hidden');
            
            let failed = false;
            
            iframe.onerror = function() {
              failed = true;
              showTikTokFallback(container, thumbnail, player, fallback);
            };
            
            setTimeout(function() {
              if (failed || iframe.document && iframe.document.readyState === 'loading') {
                try {
                  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                  if (iframeDoc && iframeDoc.body && iframeDoc.body.innerHTML.includes('unavailable')) {
                    failed = true;
                    showTikTokFallback(container, thumbnail, player, fallback);
                  }
                } catch (e) {
                  showTikTokFallback(container, thumbnail, player, fallback);
                }
              }
            }, 5000);
          }
          
          function showTikTokFallback(container, thumbnail, player, fallback) {
            iframe = container.querySelector('.video-iframe');
            if (iframe) iframe.src = '';
            if (player) player.classList.add('hidden');
            if (fallback) fallback.classList.remove('hidden');
          }
          
          function closeVideo(index) {
            const container = document.querySelector('[data-video-index="' + index + '"]');
            if (!container) return;
            
            const thumbnail = container.querySelector('.video-thumbnail');
            const player = container.querySelector('.video-player');
            const iframe = container.querySelector('.video-iframe');
            const fallback = container.querySelector('.tiktok-fallback');
            
            if (iframe) iframe.src = '';
            if (player) player.classList.add('hidden');
            if (fallback) fallback.classList.add('hidden');
            if (thumbnail) thumbnail.classList.remove('hidden');
          }
          
          var iframe = null;
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initVideoGallery);
          } else {
            initVideoGallery();
          }
        })();
      </script>
    </section>
  `
}
