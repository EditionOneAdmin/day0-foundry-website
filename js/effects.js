/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DAY-0 FOUNDRY - VISUAL EFFECTS ENGINE
 * Bleeding-edge effects that make visitors say "How did they do that?!"
 * ═══════════════════════════════════════════════════════════════════════════
 */

class Day0Effects {
  constructor() {
    this.mouse = { x: 0, y: 0 };
    this.smoothMouse = { x: 0, y: 0 };
    this.rafId = null;
    this.isTouch = 'ontouchstart' in window;
    
    this.init();
  }
  
  init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    this.setupGradientMesh();
    this.setupBentoCards();
    this.setupGlowLines();
    this.setupSpotlights();
    this.setupRevealAnimations();
    this.setupMagneticButtons();
    this.setupCustomCursor();
    this.setupParallax();
    this.startAnimationLoop();
    
    // Global mouse tracking
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    
    console.log('✨ Day-0 Effects Engine Initialized');
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     GRADIENT MESH BACKGROUND
     ═══════════════════════════════════════════════════════════════════════════ */
  
  setupGradientMesh() {
    const meshContainer = document.querySelector('.gradient-mesh');
    if (!meshContainer) return;
    
    // Create dynamic gradient orbs
    const orbs = [
      { class: 'gradient-orb gradient-orb--primary gradient-orb--1' },
      { class: 'gradient-orb gradient-orb--secondary gradient-orb--2' },
      { class: 'gradient-orb gradient-orb--primary gradient-orb--3' },
      { class: 'gradient-orb gradient-orb--secondary gradient-orb--4' }
    ];
    
    orbs.forEach(orb => {
      const element = document.createElement('div');
      element.className = orb.class;
      meshContainer.appendChild(element);
    });
    
    // Add mouse-reactive gradient
    this.meshOverlay = document.createElement('div');
    this.meshOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      background: radial-gradient(
        800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
        rgba(0, 212, 255, 0.08),
        transparent 40%
      );
    `;
    meshContainer.appendChild(this.meshOverlay);
  }
  
  updateGradientMesh() {
    if (!this.meshOverlay) return;
    
    const x = (this.smoothMouse.x / window.innerWidth) * 100;
    const y = (this.smoothMouse.y / window.innerHeight) * 100;
    
    this.meshOverlay.style.setProperty('--mouse-x', `${x}%`);
    this.meshOverlay.style.setProperty('--mouse-y', `${y}%`);
    this.meshOverlay.style.opacity = '1';
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     BENTO CARD EFFECTS
     ═══════════════════════════════════════════════════════════════════════════ */
  
  setupBentoCards() {
    const bentoItems = document.querySelectorAll('.bento-item');
    
    bentoItems.forEach(item => {
      item.addEventListener('mousemove', (e) => this.handleBentoHover(e, item));
      item.addEventListener('mouseleave', () => this.handleBentoLeave(item));
    });
  }
  
  handleBentoHover(e, item) {
    const rect = item.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    item.style.setProperty('--mouse-x', `${x}%`);
    item.style.setProperty('--mouse-y', `${y}%`);
    
    // 3D tilt effect
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left - centerX;
    const mouseY = e.clientY - rect.top - centerY;
    
    const rotateX = (mouseY / centerY) * -5;
    const rotateY = (mouseX / centerX) * 5;
    
    const inner = item.querySelector('.bento-item__inner');
    if (inner) {
      inner.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        translateY(-5px)
      `;
    }
  }
  
  handleBentoLeave(item) {
    const inner = item.querySelector('.bento-item__inner');
    if (inner) {
      inner.style.transform = '';
    }
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     GLOW LINES / SVG PATHS
     ═══════════════════════════════════════════════════════════════════════════ */
  
  setupGlowLines() {
    const glowContainer = document.querySelector('.glow-lines');
    if (!glowContainer) return;
    
    // Create SVG with glow filter
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1920 1080');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.innerHTML = `
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00D4FF" stop-opacity="0"/>
          <stop offset="50%" stop-color="#00D4FF" stop-opacity="1"/>
          <stop offset="100%" stop-color="#7C3AED" stop-opacity="0"/>
        </linearGradient>
      </defs>
      
      <!-- Flowing connection lines -->
      <path class="glow-line glow-line--primary glow-line--flow" 
            d="M0,200 Q400,100 800,200 T1600,150 T1920,200"/>
      
      <path class="glow-line glow-line--secondary glow-line--flow" 
            d="M0,400 Q300,350 600,400 T1200,350 T1920,400"
            style="animation-delay: -1s"/>
      
      <path class="glow-line glow-line--primary glow-line--animated" 
            d="M0,600 C200,550 400,650 600,600 S1000,650 1200,600 S1600,550 1920,600"/>
      
      <path class="glow-line glow-line--secondary glow-line--pulse" 
            d="M960,0 Q960,200 800,400 T960,800 T960,1080"/>
      
      <!-- Connection dots -->
      <circle class="glow-dot" cx="400" cy="200" r="4"/>
      <circle class="glow-dot" cx="800" cy="200" r="4" style="animation-delay: -0.5s"/>
      <circle class="glow-dot" cx="1200" cy="200" r="4" style="animation-delay: -1s"/>
      <circle class="glow-dot" cx="600" cy="400" r="4" style="animation-delay: -0.3s"/>
      <circle class="glow-dot" cx="1000" cy="400" r="4" style="animation-delay: -0.7s"/>
    `;
    
    glowContainer.appendChild(svg);
    
    // Store reference for animation
    this.glowPaths = svg.querySelectorAll('.glow-line--flow');
  }
  
  updateGlowLines() {
    // Optional: Add mouse-reactive glow path movement
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     SPOTLIGHT EFFECTS
     ═══════════════════════════════════════════════════════════════════════════ */
  
  setupSpotlights() {
    const spotlights = document.querySelectorAll('.spotlight');
    
    spotlights.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        element.style.setProperty('--spotlight-x', `${x}%`);
        element.style.setProperty('--spotlight-y', `${y}%`);
      });
    });
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     REVEAL ON SCROLL ANIMATIONS
     ═══════════════════════════════════════════════════════════════════════════ */
  
  setupRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            // Optionally unobserve after reveal
            // observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      revealElements.forEach(el => observer.observe(el));
    } else {
      // Fallback: show all
      revealElements.forEach(el => el.classList.add('reveal--visible'));
    }
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     MAGNETIC BUTTONS
     ═══════════════════════════════════════════════════════════════════════════ */
  
  setupMagneticButtons() {
    const magneticElements = document.querySelectorAll('.btn-magnetic');
    
    magneticElements.forEach(btn => {
      btn.addEventListener('mousemove', (e) => this.handleMagneticMove(e, btn));
      btn.addEventListener('mouseleave', () => this.handleMagneticLeave(btn));
    });
  }
  
  handleMagneticMove(e, btn) {
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * 0.3;
    const deltaY = (e.clientY - centerY) * 0.3;
    
    btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }
  
  handleMagneticLeave(btn) {
    btn.style.transform = '';
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     CUSTOM CURSOR
     ═══════════════════════════════════════════════════════════════════════════ */
  
  setupCustomCursor() {
    if (this.isTouch) return;
    
    // Create cursor elements
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    
    this.cursorDot = document.createElement('div');
    this.cursorDot.className = 'custom-cursor custom-cursor--dot';
    
    document.body.appendChild(this.cursor);
    document.body.appendChild(this.cursorDot);
    
    // Track hover states
    const hoverTargets = document.querySelectorAll('a, button, .bento-item, [data-cursor-hover]');
    
    hoverTargets.forEach(target => {
      target.addEventListener('mouseenter', () => {
        this.cursor.classList.add('custom-cursor--hover');
      });
      target.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('custom-cursor--hover');
      });
    });
    
    // Click state
    document.addEventListener('mousedown', () => {
      this.cursor.classList.add('custom-cursor--click');
    });
    document.addEventListener('mouseup', () => {
      this.cursor.classList.remove('custom-cursor--click');
    });
  }
  
  updateCursor() {
    if (!this.cursor || !this.cursorDot) return;
    
    // Outer cursor (smooth follow)
    this.cursor.style.left = `${this.smoothMouse.x}px`;
    this.cursor.style.top = `${this.smoothMouse.y}px`;
    
    // Inner dot (direct follow)
    this.cursorDot.style.left = `${this.mouse.x}px`;
    this.cursorDot.style.top = `${this.mouse.y}px`;
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     PARALLAX EFFECTS
     ═══════════════════════════════════════════════════════════════════════════ */
  
  setupParallax() {
    this.parallaxElements = document.querySelectorAll('[data-parallax]');
  }
  
  updateParallax() {
    const scrollY = window.scrollY;
    
    this.parallaxElements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const offset = scrollY * speed;
      el.style.transform = `translateY(${offset}px)`;
    });
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     MOUSE HANDLING
     ═══════════════════════════════════════════════════════════════════════════ */
  
  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
  
  smoothMouseUpdate() {
    // Smooth interpolation
    const ease = 0.15;
    this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * ease;
    this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * ease;
  }
  

  /* ═══════════════════════════════════════════════════════════════════════════
     ANIMATION LOOP
     ═══════════════════════════════════════════════════════════════════════════ */
  
  startAnimationLoop() {
    const animate = () => {
      this.smoothMouseUpdate();
      this.updateCursor();
      this.updateGradientMesh();
      this.updateParallax();
      this.updateGlowLines();
      
      this.rafId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   TEXT EFFECTS
   ═══════════════════════════════════════════════════════════════════════════ */

class TextEffects {
  static splitText(element, type = 'chars') {
    const text = element.textContent;
    element.innerHTML = '';
    element.setAttribute('aria-label', text);
    
    if (type === 'chars') {
      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--char-index', i);
        span.className = 'split-char';
        element.appendChild(span);
      });
    } else if (type === 'words') {
      text.split(' ').forEach((word, i) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.setProperty('--word-index', i);
        span.className = 'split-word';
        element.appendChild(span);
        element.appendChild(document.createTextNode(' '));
      });
    }
    
    return element;
  }
  
  static typewriter(element, options = {}) {
    const {
      speed = 50,
      delay = 0,
      cursor = true
    } = options;
    
    const text = element.textContent;
    element.textContent = '';
    element.style.visibility = 'visible';
    
    if (cursor) {
      element.classList.add('typewriter-cursor');
    }
    
    let i = 0;
    setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(interval);
          if (cursor) {
            setTimeout(() => element.classList.remove('typewriter-cursor'), 1000);
          }
        }
      }, speed);
    }, delay);
  }
  
  static scramble(element, options = {}) {
    const {
      duration = 1000,
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    } = options;
    
    const originalText = element.textContent;
    const length = originalText.length;
    const iterations = duration / 50;
    let frame = 0;
    
    const interval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < frame / 3) {
            return originalText[index];
          }
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');
      
      frame++;
      
      if (frame >= iterations) {
        element.textContent = originalText;
        clearInterval(interval);
      }
    }, 50);
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   NUMBER COUNTER
   ═══════════════════════════════════════════════════════════════════════════ */

class NumberCounter {
  static animate(element, options = {}) {
    const {
      start = 0,
      end = parseInt(element.textContent) || 100,
      duration = 2000,
      prefix = '',
      suffix = '',
      decimals = 0
    } = options;
    
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = start + (end - start) * eased;
      element.textContent = prefix + current.toFixed(decimals) + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  }
  
  static observeAndAnimate(selector) {
    const elements = document.querySelectorAll(selector);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = 'true';
          NumberCounter.animate(entry.target, {
            end: parseInt(entry.target.dataset.count) || parseInt(entry.target.textContent),
            prefix: entry.target.dataset.prefix || '',
            suffix: entry.target.dataset.suffix || '',
            decimals: parseInt(entry.target.dataset.decimals) || 0
          });
        }
      });
    }, { threshold: 0.5 });
    
    elements.forEach(el => observer.observe(el));
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   PARTICLE SYSTEM (Lightweight)
   ═══════════════════════════════════════════════════════════════════════════ */

class ParticleSystem {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    if (!this.container) return;
    
    this.options = {
      count: options.count || 50,
      color: options.color || '#00D4FF',
      minSize: options.minSize || 2,
      maxSize: options.maxSize || 6,
      speed: options.speed || 1,
      connectDistance: options.connectDistance || 150,
      ...options
    };
    
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Create particles
    for (let i = 0; i < this.options.count; i++) {
      this.particles.push(this.createParticle());
    }
    
    this.animate();
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }
  
  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * this.options.speed,
      vy: (Math.random() - 0.5) * this.options.speed,
      size: Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize,
      opacity: Math.random() * 0.5 + 0.3
    };
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.options.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fill();
    });
    
    // Draw connections
    if (this.options.connectDistance) {
      this.ctx.globalAlpha = 0.2;
      this.ctx.strokeStyle = this.options.color;
      this.ctx.lineWidth = 1;
      
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < this.options.connectDistance) {
            this.ctx.globalAlpha = (1 - dist / this.options.connectDistance) * 0.2;
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    }
    
    this.ctx.globalAlpha = 1;
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas) {
      this.canvas.remove();
    }
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL-TRIGGERED ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

class ScrollAnimations {
  constructor() {
    this.sections = [];
    this.init();
  }
  
  init() {
    // Setup scroll-based color transitions
    this.setupSectionColors();
    
    // Setup progress indicators
    this.setupScrollProgress();
    
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
  }
  
  setupSectionColors() {
    const sections = document.querySelectorAll('[data-section-color]');
    const mesh = document.querySelector('.gradient-mesh');
    
    if (!mesh || sections.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const colorScheme = entry.target.dataset.sectionColor;
          mesh.className = `gradient-mesh gradient-mesh--${colorScheme}`;
        }
      });
    }, { threshold: 0.5 });
    
    sections.forEach(section => observer.observe(section));
  }
  
  setupScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    
    this.progressBar = progressBar;
  }
  
  onScroll() {
    if (this.progressBar) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / scrollHeight) * 100;
      this.progressBar.style.width = `${scrollProgress}%`;
    }
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   INITIALIZE EVERYTHING
   ═══════════════════════════════════════════════════════════════════════════ */

// Auto-initialize on load
let day0Effects;
let scrollAnimations;

document.addEventListener('DOMContentLoaded', () => {
  day0Effects = new Day0Effects();
  scrollAnimations = new ScrollAnimations();
  
  // Auto-initialize counters
  NumberCounter.observeAndAnimate('[data-count]');
  
  // Auto-initialize particles if container exists
  const particleContainer = document.querySelector('.particles-container');
  if (particleContainer) {
    new ParticleSystem(particleContainer, {
      count: 40,
      color: 'rgba(0, 212, 255, 0.6)',
      connectDistance: 120
    });
  }
});

// Export for use in other scripts
window.Day0Effects = Day0Effects;
window.TextEffects = TextEffects;
window.NumberCounter = NumberCounter;
window.ParticleSystem = ParticleSystem;
window.ScrollAnimations = ScrollAnimations;
