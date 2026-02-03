/**
 * Day-0 Foundry - Magnetic Buttons Module
 * CTAs die den Cursor anziehen wie ein schwarzes Loch.
 * 
 * Usage: <button class="magnetic" data-magnetic-strength="0.5">Click me</button>
 */

class MagneticElement {
  constructor(element, options = {}) {
    this.element = element;
    this.isHovered = false;
    this.rafId = null;
    
    // Mouse position
    this.mouse = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    
    // Config
    this.config = {
      strength: parseFloat(element.dataset.magneticStrength) || 0.35,
      ease: parseFloat(element.dataset.magneticEase) || 0.15,
      scale: parseFloat(element.dataset.magneticScale) || 1.05,
      rotateStrength: parseFloat(element.dataset.magneticRotate) || 0,
      ...options
    };
    
    this.bounds = null;
    this.init();
  }
  
  init() {
    this.calculateBounds();
    this.bindEvents();
    this.render();
  }
  
  calculateBounds() {
    this.bounds = this.element.getBoundingClientRect();
  }
  
  bindEvents() {
    this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // Recalculate on resize
    window.addEventListener('resize', () => {
      this.calculateBounds();
    });
    
    // Recalculate on scroll
    window.addEventListener('smoothscroll', () => {
      if (this.isHovered) {
        this.calculateBounds();
      }
    });
  }
  
  onMouseEnter(e) {
    this.isHovered = true;
    this.calculateBounds();
    
    // Scale animation
    if (typeof gsap !== 'undefined') {
      gsap.to(this.element, {
        scale: this.config.scale,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)'
      });
    } else {
      this.element.style.transform = `scale(${this.config.scale})`;
    }
    
    this.element.classList.add('is-magnetic-hover');
  }
  
  onMouseLeave(e) {
    this.isHovered = false;
    
    // Reset animation
    if (typeof gsap !== 'undefined') {
      gsap.to(this.element, {
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.3)'
      });
    } else {
      this.element.style.transform = '';
    }
    
    this.element.classList.remove('is-magnetic-hover');
  }
  
  onMouseMove(e) {
    if (!this.isHovered) return;
    
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
  
  render() {
    if (this.isHovered && this.bounds) {
      // Center of element
      const centerX = this.bounds.left + this.bounds.width / 2;
      const centerY = this.bounds.top + this.bounds.height / 2;
      
      // Distance from center
      const deltaX = this.mouse.x - centerX;
      const deltaY = this.mouse.y - centerY;
      
      // Target position
      const targetX = deltaX * this.config.strength;
      const targetY = deltaY * this.config.strength;
      
      // Lerp for smooth movement
      this.position.x += (targetX - this.position.x) * this.config.ease;
      this.position.y += (targetY - this.position.y) * this.config.ease;
      
      // Optional rotation based on position
      const rotation = this.config.rotateStrength 
        ? (deltaX / this.bounds.width) * this.config.rotateStrength 
        : 0;
      
      // Apply transform
      if (typeof gsap !== 'undefined') {
        gsap.set(this.element, {
          x: this.position.x,
          y: this.position.y,
          rotation: rotation
        });
      } else {
        this.element.style.transform = `
          translate(${this.position.x}px, ${this.position.y}px) 
          scale(${this.config.scale})
          rotate(${rotation}deg)
        `;
      }
    }
    
    this.rafId = requestAnimationFrame(this.render.bind(this));
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

// Magnetic Text Effect (Text moves opposite to cursor)
class MagneticText {
  constructor(element) {
    this.element = element;
    this.text = element.querySelector('[data-magnetic-text]') || element;
    this.mouse = { x: 0, y: 0 };
    
    this.init();
  }
  
  init() {
    this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  }
  
  onMouseMove(e) {
    const bounds = this.element.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    
    // Inverse movement für den Text
    const deltaX = (e.clientX - centerX) * -0.2;
    const deltaY = (e.clientY - centerY) * -0.2;
    
    if (typeof gsap !== 'undefined') {
      gsap.to(this.text, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }
  
  onMouseLeave() {
    if (typeof gsap !== 'undefined') {
      gsap.to(this.text, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    }
  }
}

// Magnetic Manager
class MagneticManager {
  constructor() {
    this.elements = [];
    this.init();
  }
  
  init() {
    // Standard magnetic elements
    document.querySelectorAll('.magnetic, [data-magnetic]').forEach(el => {
      this.elements.push(new MagneticElement(el));
    });
    
    // Magnetic text elements
    document.querySelectorAll('[data-magnetic-text-wrapper]').forEach(el => {
      new MagneticText(el);
    });
    
    console.log(`[Magnetic] Initialized ${this.elements.length} magnetic elements 🧲`);
  }
  
  // Dynamically add magnetic effect
  add(element, options = {}) {
    const magnetic = new MagneticElement(element, options);
    this.elements.push(magnetic);
    return magnetic;
  }
  
  destroy() {
    this.elements.forEach(el => el.destroy());
    this.elements = [];
  }
}

// Auto-init
let magneticManager = null;

document.addEventListener('DOMContentLoaded', () => {
  // Nur auf Geräten mit Maus aktivieren
  if (window.matchMedia('(hover: hover)').matches) {
    magneticManager = new MagneticManager();
  }
});

// Export
export { MagneticElement, MagneticText, MagneticManager, magneticManager };
