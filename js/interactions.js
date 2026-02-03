/**
 * Day-0 Foundry - Micro-Interactions Module
 * Scroll Progress, Section Reveals, Custom Cursor
 * 
 * Die Details die den Unterschied machen.
 */

// ═══════════════════════════════════════════════════════════════════
// SCROLL PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════

class ScrollProgress {
  constructor(options = {}) {
    this.config = {
      position: options.position || 'top',     // top, bottom
      height: options.height || '3px',
      color: options.color || 'var(--accent, #00ff88)',
      background: options.background || 'transparent',
      zIndex: options.zIndex || 9999,
      ...options
    };
    
    this.progressBar = null;
    this.init();
  }
  
  init() {
    this.createProgressBar();
    this.bindEvents();
    this.update();
    
    console.log('[ScrollProgress] Initialized 📊');
  }
  
  createProgressBar() {
    // Container
    this.container = document.createElement('div');
    this.container.className = 'scroll-progress-container';
    this.container.style.cssText = `
      position: fixed;
      ${this.config.position}: 0;
      left: 0;
      width: 100%;
      height: ${this.config.height};
      background: ${this.config.background};
      z-index: ${this.config.zIndex};
      pointer-events: none;
    `;
    
    // Progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'scroll-progress-bar';
    this.progressBar.style.cssText = `
      height: 100%;
      width: 0%;
      background: ${this.config.color};
      transition: width 0.1s ease-out;
      box-shadow: 0 0 10px ${this.config.color}40, 0 0 20px ${this.config.color}20;
    `;
    
    this.container.appendChild(this.progressBar);
    document.body.appendChild(this.container);
  }
  
  bindEvents() {
    // Listen to smooth scroll events
    window.addEventListener('smoothscroll', (e) => {
      this.setProgress(e.detail.progress);
    });
    
    // Fallback für native scroll
    window.addEventListener('scroll', () => {
      const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      this.setProgress(progress);
    }, { passive: true });
  }
  
  setProgress(progress) {
    const percentage = Math.min(Math.max(progress * 100, 0), 100);
    this.progressBar.style.width = `${percentage}%`;
  }
  
  update() {
    const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    this.setProgress(progress);
  }
  
  destroy() {
    this.container.remove();
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION REVEAL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════

class SectionReveal {
  constructor() {
    this.sections = document.querySelectorAll('[data-reveal]');
    this.elements = document.querySelectorAll('[data-reveal-element]');
    
    if (this.sections.length === 0 && this.elements.length === 0) return;
    
    this.init();
  }
  
  init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[SectionReveal] GSAP/ScrollTrigger required');
      this.fallbackInit();
      return;
    }
    
    this.setupSections();
    this.setupElements();
    this.setupStaggerGroups();
    
    console.log('[SectionReveal] Initialized ✨');
  }
  
  fallbackInit() {
    // Intersection Observer fallback
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.1 });
    
    [...this.sections, ...this.elements].forEach(el => {
      el.classList.add('reveal-hidden');
      observer.observe(el);
    });
  }
  
  setupSections() {
    this.sections.forEach(section => {
      const type = section.dataset.reveal || 'fade';
      const delay = parseFloat(section.dataset.revealDelay) || 0;
      
      // Initial state
      const fromVars = this.getFromVars(type);
      gsap.set(section, fromVars);
      
      // Animation
      gsap.to(section, {
        ...this.getToVars(type),
        duration: 1,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 20%',
          toggleActions: 'play none none reverse'
        }
      });
    });
  }
  
  setupElements() {
    this.elements.forEach(element => {
      const type = element.dataset.revealElement || 'fade';
      const delay = parseFloat(element.dataset.revealDelay) || 0;
      
      const fromVars = this.getFromVars(type);
      gsap.set(element, fromVars);
      
      gsap.to(element, {
        ...this.getToVars(type),
        duration: 0.8,
        delay: delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
  
  setupStaggerGroups() {
    document.querySelectorAll('[data-reveal-stagger]').forEach(group => {
      const children = group.querySelectorAll('[data-reveal-item]');
      const stagger = parseFloat(group.dataset.revealStagger) || 0.1;
      const type = group.dataset.revealType || 'fade-up';
      
      gsap.set(children, this.getFromVars(type));
      
      gsap.to(children, {
        ...this.getToVars(type),
        duration: 0.8,
        stagger: stagger,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
  
  getFromVars(type) {
    const variants = {
      'fade': { opacity: 0 },
      'fade-up': { opacity: 0, y: 60 },
      'fade-down': { opacity: 0, y: -60 },
      'fade-left': { opacity: 0, x: -60 },
      'fade-right': { opacity: 0, x: 60 },
      'scale': { opacity: 0, scale: 0.8 },
      'scale-up': { opacity: 0, scale: 0.8, y: 40 },
      'flip': { opacity: 0, rotationX: 90 },
      'blur': { opacity: 0, filter: 'blur(20px)' },
      'clip': { clipPath: 'inset(0 100% 0 0)' },
      'clip-up': { clipPath: 'inset(100% 0 0 0)' }
    };
    return variants[type] || variants['fade'];
  }
  
  getToVars(type) {
    const variants = {
      'fade': { opacity: 1 },
      'fade-up': { opacity: 1, y: 0 },
      'fade-down': { opacity: 1, y: 0 },
      'fade-left': { opacity: 1, x: 0 },
      'fade-right': { opacity: 1, x: 0 },
      'scale': { opacity: 1, scale: 1 },
      'scale-up': { opacity: 1, scale: 1, y: 0 },
      'flip': { opacity: 1, rotationX: 0 },
      'blur': { opacity: 1, filter: 'blur(0px)' },
      'clip': { clipPath: 'inset(0 0% 0 0)' },
      'clip-up': { clipPath: 'inset(0% 0 0 0)' }
    };
    return variants[type] || variants['fade'];
  }
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════════════

class CustomCursor {
  constructor(options = {}) {
    this.config = {
      size: options.size || 20,
      glowSize: options.glowSize || 40,
      color: options.color || 'var(--accent, #00ff88)',
      glowOpacity: options.glowOpacity || 0.3,
      ease: options.ease || 0.15,
      ...options
    };
    
    this.cursor = null;
    this.glow = null;
    this.mouse = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.glowPosition = { x: 0, y: 0 };
    this.isVisible = false;
    this.isHovering = false;
    
    this.init();
  }
  
  init() {
    // Skip on touch devices
    if (!window.matchMedia('(hover: hover)').matches) return;
    
    this.createCursor();
    this.bindEvents();
    this.render();
    
    console.log('[CustomCursor] Initialized 🎯');
  }
  
  createCursor() {
    // Main cursor dot
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${this.config.size}px;
      height: ${this.config.size}px;
      background: ${this.config.color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      mix-blend-mode: difference;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: width 0.3s, height 0.3s, opacity 0.3s;
    `;
    
    // Glow effect
    this.glow = document.createElement('div');
    this.glow.className = 'custom-cursor-glow';
    this.glow.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: ${this.config.glowSize}px;
      height: ${this.config.glowSize}px;
      background: radial-gradient(circle, ${this.config.color}${Math.round(this.config.glowOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99998;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: width 0.4s, height 0.4s, opacity 0.4s;
    `;
    
    document.body.appendChild(this.glow);
    document.body.appendChild(this.cursor);
    
    // Hide default cursor
    document.body.style.cursor = 'none';
  }
  
  bindEvents() {
    // Mouse move
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      if (!this.isVisible) {
        this.isVisible = true;
        this.cursor.style.opacity = '1';
        this.glow.style.opacity = '1';
      }
    });
    
    // Mouse leave window
    document.addEventListener('mouseleave', () => {
      this.isVisible = false;
      this.cursor.style.opacity = '0';
      this.glow.style.opacity = '0';
    });
    
    // Hover states
    const hoverElements = 'a, button, [data-cursor-hover], input, textarea, .magnetic';
    
    document.querySelectorAll(hoverElements).forEach(el => {
      el.addEventListener('mouseenter', () => this.onHoverEnter(el));
      el.addEventListener('mouseleave', () => this.onHoverLeave());
    });
    
    // MutationObserver für dynamische Elemente
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.matches && node.matches(hoverElements)) {
              node.addEventListener('mouseenter', () => this.onHoverEnter(node));
              node.addEventListener('mouseleave', () => this.onHoverLeave());
            }
            node.querySelectorAll?.(hoverElements).forEach(el => {
              el.addEventListener('mouseenter', () => this.onHoverEnter(el));
              el.addEventListener('mouseleave', () => this.onHoverLeave());
            });
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  onHoverEnter(element) {
    this.isHovering = true;
    
    const cursorType = element.dataset.cursorType || 'default';
    const scale = parseFloat(element.dataset.cursorScale) || 2;
    
    // Expand cursor
    this.cursor.style.width = `${this.config.size * scale}px`;
    this.cursor.style.height = `${this.config.size * scale}px`;
    this.glow.style.width = `${this.config.glowSize * scale}px`;
    this.glow.style.height = `${this.config.glowSize * scale}px`;
    
    this.cursor.classList.add('is-hovering');
    
    // Custom cursor types
    if (cursorType === 'view') {
      this.cursor.innerHTML = '<span style="font-size: 10px; color: #000;">VIEW</span>';
      this.cursor.style.display = 'flex';
      this.cursor.style.alignItems = 'center';
      this.cursor.style.justifyContent = 'center';
    }
  }
  
  onHoverLeave() {
    this.isHovering = false;
    
    this.cursor.style.width = `${this.config.size}px`;
    this.cursor.style.height = `${this.config.size}px`;
    this.glow.style.width = `${this.config.glowSize}px`;
    this.glow.style.height = `${this.config.glowSize}px`;
    
    this.cursor.classList.remove('is-hovering');
    this.cursor.innerHTML = '';
    this.cursor.style.display = '';
  }
  
  render() {
    // Smooth lerp for cursor
    this.position.x += (this.mouse.x - this.position.x) * this.config.ease;
    this.position.y += (this.mouse.y - this.position.y) * this.config.ease;
    
    // Even smoother lerp for glow
    this.glowPosition.x += (this.mouse.x - this.glowPosition.x) * (this.config.ease * 0.6);
    this.glowPosition.y += (this.mouse.y - this.glowPosition.y) * (this.config.ease * 0.6);
    
    this.cursor.style.left = `${this.position.x}px`;
    this.cursor.style.top = `${this.position.y}px`;
    
    this.glow.style.left = `${this.glowPosition.x}px`;
    this.glow.style.top = `${this.glowPosition.y}px`;
    
    requestAnimationFrame(this.render.bind(this));
  }
  
  destroy() {
    this.cursor?.remove();
    this.glow?.remove();
    document.body.style.cursor = '';
  }
}

// ═══════════════════════════════════════════════════════════════════
// TEXT SPLIT ANIMATION
// ═══════════════════════════════════════════════════════════════════

class TextSplit {
  constructor() {
    this.elements = document.querySelectorAll('[data-text-split]');
    if (this.elements.length === 0) return;
    
    this.init();
  }
  
  init() {
    this.elements.forEach(element => {
      const type = element.dataset.textSplit || 'chars'; // chars, words, lines
      const text = element.textContent;
      
      element.innerHTML = '';
      element.setAttribute('aria-label', text);
      
      if (type === 'chars') {
        this.splitChars(element, text);
      } else if (type === 'words') {
        this.splitWords(element, text);
      }
    });
    
    this.animate();
  }
  
  splitChars(element, text) {
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'split-char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(100%);
      `;
      span.dataset.index = i;
      element.appendChild(span);
    });
  }
  
  splitWords(element, text) {
    text.split(' ').forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'split-word';
      span.textContent = word;
      span.style.cssText = `
        display: inline-block;
        margin-right: 0.25em;
        opacity: 0;
        transform: translateY(100%);
      `;
      span.dataset.index = i;
      element.appendChild(span);
    });
  }
  
  animate() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    
    this.elements.forEach(element => {
      const chars = element.querySelectorAll('.split-char, .split-word');
      const stagger = parseFloat(element.dataset.textStagger) || 0.03;
      
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// HOVER EFFECTS
// ═══════════════════════════════════════════════════════════════════

class HoverEffects {
  constructor() {
    this.init();
  }
  
  init() {
    // Image hover zoom
    document.querySelectorAll('[data-hover-zoom]').forEach(el => {
      const img = el.querySelector('img') || el;
      const scale = parseFloat(el.dataset.hoverZoom) || 1.1;
      
      el.style.overflow = 'hidden';
      
      el.addEventListener('mouseenter', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(img, { scale, duration: 0.6, ease: 'power2.out' });
        }
      });
      
      el.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(img, { scale: 1, duration: 0.6, ease: 'power2.out' });
        }
      });
    });
    
    // Tilt effect
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const max = parseFloat(el.dataset.tilt) || 10;
      
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const rotateX = (y / rect.height - 0.5) * -max;
        const rotateY = (x / rect.width - 0.5) * max;
        
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

let scrollProgress = null;
let sectionReveal = null;
let customCursor = null;
let textSplit = null;
let hoverEffects = null;

function initInteractions(options = {}) {
  // Scroll Progress Bar
  if (options.scrollProgress !== false) {
    scrollProgress = new ScrollProgress(options.scrollProgress || {});
  }
  
  // Section Reveal Animations
  sectionReveal = new SectionReveal();
  
  // Custom Cursor (optional, enable with data attribute or config)
  if (options.customCursor || document.body.dataset.customCursor !== undefined) {
    customCursor = new CustomCursor(options.customCursor || {});
  }
  
  // Text Split Animations
  textSplit = new TextSplit();
  
  // Hover Effects
  hoverEffects = new HoverEffects();
  
  console.log('[Interactions] All micro-interactions initialized 🚀');
}

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  initInteractions({
    scrollProgress: {
      color: 'var(--accent, #00ff88)',
      height: '3px'
    },
    // Custom cursor deaktiviert by default, kann via data-custom-cursor aktiviert werden
    customCursor: document.body.dataset.customCursor !== undefined
  });
});

// Export
export { 
  ScrollProgress, 
  SectionReveal, 
  CustomCursor, 
  TextSplit, 
  HoverEffects,
  initInteractions,
  scrollProgress,
  sectionReveal,
  customCursor
};
