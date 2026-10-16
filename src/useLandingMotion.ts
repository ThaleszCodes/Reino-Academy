import { useLayoutEffect, type RefObject } from 'react';

// Progressive enhancement: content is visible until the observers are ready.
// No scroll listeners, animation library, or permanent will-change layers.
export function useLandingMotion(rootRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !('IntersectionObserver' in window)) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const elements = Array.from(root.querySelectorAll<HTMLElement>([
      '.lp-hero-copy > *', '.lp-section-intro > *', '.lp-resource',
      '.lp-disclaimer', '.lp-routine-copy > *', '.lp-routine-list li',
      '.lp-offer', '.lp-pricing-trust', '.lp-guarantee > *',
      '.lp-faq-item', '.lp-faq-support', '.lp-final-cta > *',
      '.lp-footer-top', '.lp-footer-bottom',
    ].join(',')));
    let revealObserver: IntersectionObserver | undefined;
    let frame = 0;

    const reveal = (element: HTMLElement, immediate = false) => {
      if (immediate) {
        element.style.setProperty('--reveal-duration', '0ms');
        element.style.setProperty('--reveal-delay', '0ms');
      }
      element.dataset.reveal = 'visible';
      revealObserver?.unobserve(element);
    };

    const configureMotion = () => {
      cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      elements.forEach(element => {
        delete element.dataset.reveal;
        element.style.removeProperty('--reveal-delay');
        element.style.removeProperty('--reveal-duration');
      });
      if (preference.matches) return;

      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

      const initial: HTMLElement[] = [];
      elements.forEach(element => {
        const bounds = element.getBoundingClientRect();
        // Never hide content already above the viewport (restored scroll/deep links).
        if (bounds.bottom <= 0) return;
        const index = Array.from(element.parentElement!.children).indexOf(element);
        element.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 65}ms`);
        element.dataset.reveal = 'pending';
        if (bounds.top < window.innerHeight - 24) initial.push(element);
        else revealObserver!.observe(element);
      });
      frame = requestAnimationFrame(() => initial.forEach(element => reveal(element)));
    };

    // Keyboard users should never land on an invisible link during an entrance.
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      elements.forEach(element => {
        if (element.contains(target)) reveal(element, true);
      });
    };
    configureMotion();
    preference.addEventListener('change', configureMotion);
    root.addEventListener('focusin', handleFocus);

    // Pause button reflections outside the viewport. Also clear the bottom glass
    // when the end of the page is visible, so footer content remains unobscured.
    const polishObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const element = entry.target as HTMLElement;
        if (element.classList.contains('lp-page-end')) {
          root.classList.toggle('lp-at-end', entry.isIntersecting);
        } else {
          element.dataset.inView = String(entry.isIntersecting);
        }
      });
    });
    root.querySelectorAll('.lp-cta-premium, .lp-page-end').forEach(element => polishObserver.observe(element));

    return () => {
      cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      polishObserver.disconnect();
      preference.removeEventListener('change', configureMotion);
      root.removeEventListener('focusin', handleFocus);
      elements.forEach(element => {
        delete element.dataset.reveal;
        element.style.removeProperty('--reveal-delay');
        element.style.removeProperty('--reveal-duration');
      });
    };
  }, [rootRef]);
}
