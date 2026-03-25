import { html, raw } from 'hono/html'

export const animationScript = () => raw(`
<script type="module">
  import { animate, inView, stagger, spring } from 'https://esm.sh/motion@11.18.0';

  const gentleSpring = { stiffness: 80, damping: 20 };
  const defaultSpring = { stiffness: 100, damping: 15 };
  const bouncySpring = { stiffness: 300, damping: 20 };

  // Wait for DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initBannerAnimations();
    initHeroAnimations();
    initSectionAnimations();
    initHoverAnimations();
    initLenis();
  });

  function initLenis() {
    // Smooth scroll with Lenis-like effect using native CSS
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  function initBannerAnimations() {
    const eyebrow = document.querySelector('.banner-eyebrow');
    const title = document.querySelector('.banner-title');
    const divider = document.querySelector('.banner-divider');
    const subtitle = document.querySelector('.banner-subtitle');
    const offsetImage = document.querySelector('.banner-offset-image');

    const sequence = [
      [eyebrow, { opacity: [0, 1], y: [20, 0] }, 0],
      [title, { opacity: [0, 1], y: [40, 0] }, 0.15],
      [divider, { scaleX: [0, 1], opacity: [0, 1] }, 0.4],
      [subtitle, { opacity: [0, 1], y: [20, 0] }, 0.6]
    ];

    sequence.forEach(([el, keyframes, delay]) => {
      if (!el) return;
      animate(el, keyframes, {
        duration: 0.9,
        delay,
        easing: [0.22, 1, 0.36, 1] // custom ease-out-quart
      });
    });

    // Offset image subtle float
    if (offsetImage) {
      animate(offsetImage, { y: [0, -15, 0] }, {
        duration: 6,
        repeat: Infinity,
        easing: 'ease-in-out',
        delay: 1
      });
    }
  }

  function initHeroAnimations() {
    const badge = document.querySelector('.hero-badge');
    const title = document.querySelector('.hero-title');
    const subtitle = document.querySelector('.hero-subtitle');
    const ctas = document.querySelectorAll('.hero-cta');

    const elements = [
      [badge, { opacity: [0, 1], scale: [0.95, 1] }],
      [title, { opacity: [0, 1], y: [50, 0] }],
      [subtitle, { opacity: [0, 1], y: [30, 0] }]
    ];

    elements.forEach(([el, keyframes], i) => {
      if (!el) return;
      animate(el, keyframes, {
        duration: 1,
        delay: 0.2 + i * 0.2,
        easing: [0.22, 1, 0.36, 1]
      });
    });

    if (ctas.length > 0) {
      animate(ctas, { opacity: [0, 1], y: [20, 0] }, {
        duration: 0.8,
        delay: 0.8,
        easing: [0.22, 1, 0.36, 1],
        ...stagger(0.12)
      });
    }
  }

  function initSectionAnimations() {
    // Animate sections with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach((section) => {
      const animationType = section.getAttribute('data-animate');
      const delay = parseFloat(section.getAttribute('data-delay') || '0');
      const children = section.querySelectorAll('[data-animate-item]');

      inView(section, () => {
        if (animationType === 'fade-up') {
          if (children.length > 0) {
            animate(children, { opacity: [0, 1], y: [40, 0] }, {
              duration: 0.8,
              delay,
              easing: [0.22, 1, 0.36, 1],
              ...stagger(0.08)
            });
          } else {
            animate(section, { opacity: [0, 1], y: [40, 0] }, {
              duration: 0.8,
              delay,
              easing: [0.22, 1, 0.36, 1]
            });
          }
        } else if (animationType === 'fade-in') {
          animate(section, { opacity: [0, 1] }, {
            duration: 0.8,
            delay,
            easing: [0.22, 1, 0.36, 1]
          });
        } else if (animationType === 'scale-in') {
          animate(section, { opacity: [0, 1], scale: [0.95, 1] }, {
            duration: 0.8,
            delay,
            easing: [0.22, 1, 0.36, 1]
          });
        } else if (animationType === 'slide-left') {
          animate(section, { opacity: [0, 1], x: [-60, 0] }, {
            duration: 0.9,
            delay,
            easing: [0.22, 1, 0.36, 1]
          });
        } else if (animationType === 'slide-right') {
          animate(section, { opacity: [0, 1], x: [60, 0] }, {
            duration: 0.9,
            delay,
            easing: [0.22, 1, 0.36, 1]
          });
        }

        return () => {};
      });
    });

    // Expand width animations (dividers, progress bars)
    document.querySelectorAll('[data-expand]').forEach((el) => {
      inView(el, () => {
        animate(el, { scaleX: [0, 1], opacity: [0, 1] }, {
          duration: 1.2,
          delay: 0.3,
          easing: [0.22, 1, 0.36, 1]
        });
        return () => {};
      });
    });
  }

  function initHoverAnimations() {
    // Enhanced hover effects for cards
    document.querySelectorAll('.card-hover').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        animate(card, { y: -8, scale: 1.02 }, { duration: 0.4, easing: [0.22, 1, 0.36, 1] });
      });
      card.addEventListener('mouseleave', () => {
        animate(card, { y: 0, scale: 1 }, { duration: 0.4, easing: [0.22, 1, 0.36, 1] });
      });
    });

    // Button hover effects
    document.querySelectorAll('.btn-animated').forEach((btn) => {
      btn.addEventListener('mouseenter', () => {
        animate(btn, { scale: 1.05 }, { duration: 0.2, easing: [0.22, 1, 0.36, 1] });
      });
      btn.addEventListener('mouseleave', () => {
        animate(btn, { scale: 1 }, { duration: 0.2, easing: [0.22, 1, 0.36, 1] });
      });
    });

    // Image zoom on hover
    document.querySelectorAll('.img-zoom').forEach((wrapper) => {
      const img = wrapper.querySelector('img');
      if (!img) return;
      wrapper.addEventListener('mouseenter', () => {
        animate(img, { scale: 1.1 }, { duration: 0.6, easing: [0.22, 1, 0.36, 1] });
      });
      wrapper.addEventListener('mouseleave', () => {
        animate(img, { scale: 1 }, { duration: 0.6, easing: [0.22, 1, 0.36, 1] });
      });
    });

    // Grayscale to color on team cards
    document.querySelectorAll('.team-card').forEach((card) => {
      const img = card.querySelector('img');
      if (!img) return;
      card.addEventListener('mouseenter', () => {
        animate(img, { filter: ['grayscale(100%)', 'grayscale(0%)'] }, { duration: 0.6 });
      });
      card.addEventListener('mouseleave', () => {
        animate(img, { filter: 'grayscale(100%)' }, { duration: 0.6 });
      });
    });
  }
</script>
`)

export const reducedMotionScript = raw(`
<script>
  // Respect user's motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--motion-duration', '0ms');
  }
</script>
`)
