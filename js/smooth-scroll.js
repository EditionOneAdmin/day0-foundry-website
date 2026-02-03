/**
 * Day-0 Foundry - Smooth Scroll Module
 * Lenis + GSAP ScrollTrigger Integration
 * 
 * Das Scroll-Feeling das süchtig macht.
 */

class SmoothScroll {
  constructor(options = {}) {
    this.lenis = null;
    this.isEnabled = true;
    
    // Default config für buttery smooth feeling
    this.config = {
      duration: 1.2,           // Scroll duration
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,      // Native touch für mobile
      touchMultiplier: 2,
      ...options
    };
    
    this.init();
  }
  
  init() {
    // Warte auf Lenis
    if (typeof Lenis === 'undefined') {
      console.warn('[SmoothScroll] Lenis not loaded, retrying...');
      setTimeout(() => this.init(), 100);
      return;
    }
    
    this.createLenis();
    this.connectGSAP();
    this.setupRAF();
    this.setupAnchors();
    
    console.log('[SmoothScroll] Initialized ✨');
  }
  
  createLenis() {
    this.lenis = new Lenis(this.config);
    
    // Expose globally für andere Module
    window.lenis = this.lenis;
    
    // Events
    this.lenis.on('scroll', this.onScroll.bind(this));
  }
  
  connectGSAP() {
    // GSAP ScrollTrigger mit Lenis verbinden
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      this.lenis.on('scroll', ScrollTrigger.update);
      
      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });
      
      gsap.ticker.lagSmoothing(0);
    }
  }
  
  setupRAF() {
    // Fallback RAF loop falls GSAP nicht verfügbar
    if (typeof gsap === 'undefined') {
      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }
  
  setupAnchors() {
    // Smooth scroll zu Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          this.scrollTo(target, {
            offset: -100,
            duration: 1.5
          });
        }
      });
    });
  }
  
  onScroll({ scroll, limit, velocity, direction, progress }) {
    // Dispatch custom event für andere Module
    window.dispatchEvent(new CustomEvent('smoothscroll', {
      detail: { scroll, limit, velocity, direction, progress }
    }));
    
    // CSS custom properties für CSS-only effects
    document.documentElement.style.setProperty('--scroll-progress', progress);
    document.documentElement.style.setProperty('--scroll-velocity', velocity);
  }
  
  // Public API
  scrollTo(target, options = {}) {
    this.lenis.scrollTo(target, {
      offset: options.offset || 0,
      duration: options.duration || this.config.duration,
      easing: options.easing || this.config.easing,
      immediate: options.immediate || false,
      lock: options.lock || false,
      onComplete: options.onComplete
    });
  }
  
  stop() {
    this.lenis.stop();
    this.isEnabled = false;
  }
  
  start() {
    this.lenis.start();
    this.isEnabled = true;
  }
  
  destroy() {
    this.lenis.destroy();
    window.lenis = null;
  }
}

// Section Parallax Effect
class ParallaxSections {
  constructor() {
    this.sections = document.querySelectorAll('[data-parallax]');
    if (this.sections.length === 0) return;
    
    this.init();
  }
  
  init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[ParallaxSections] GSAP/ScrollTrigger required');
      return;
    }
    
    this.sections.forEach(section => {
      const speed = parseFloat(section.dataset.parallax) || 0.5;
      const inner = section.querySelector('[data-parallax-inner]') || section.firstElementChild;
      
      if (!inner) return;
      
      gsap.to(inner, {
        yPercent: speed * 30,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }
}

// Horizontal Scroll Sections
class HorizontalScroll {
  constructor(selector = '[data-horizontal-scroll]') {
    this.containers = document.querySelectorAll(selector);
    if (this.containers.length === 0) return;
    
    this.init();
  }
  
  init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[HorizontalScroll] GSAP/ScrollTrigger required');
      return;
    }
    
    this.containers.forEach(container => {
      const wrapper = container.querySelector('[data-horizontal-wrapper]');
      if (!wrapper) return;
      
      const items = wrapper.children;
      const totalWidth = Array.from(items).reduce((acc, item) => acc + item.offsetWidth, 0);
      
      gsap.to(wrapper, {
        x: () => -(totalWidth - container.offsetWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1
        }
      });
    });
  }
}

// Auto-init
let smoothScrollInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Nur auf Desktop aktivieren (touch devices haben natives smooth scroll)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  smoothScrollInstance = new SmoothScroll({
    smooth: !isTouchDevice || window.innerWidth > 1024,
    smoothTouch: false
  });
  
  // Parallax & Horizontal Scroll
  new ParallaxSections();
  new HorizontalScroll();
});

// Export für ES6 modules
export { SmoothScroll, ParallaxSections, HorizontalScroll, smoothScrollInstance };
