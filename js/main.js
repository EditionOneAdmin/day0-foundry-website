/**
 * Day-0 Foundry - Main JavaScript
 * Orchestrates all site functionality
 */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    initScrollProgress();
    initNavigation();
    initSectionReveals();
    initCounters();
    initAccordion();
    initMagneticButtons();
    initCursorGlow();
    initSmoothScroll();
    initHeroAnimations();
});

/**
 * Scroll Progress Bar
 */
function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });
}

/**
 * Navigation scroll effect
 */
function initNavigation() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/**
 * Section reveal on scroll
 */
function initSectionReveals() {
    const sections = document.querySelectorAll('.section[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
}

/**
 * Animated counters
 */
function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.counter);
                const duration = 2000;
                const start = 0;
                const startTime = performance.now();
                
                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(start + (target - start) * easeOut);
                    
                    counter.textContent = current;
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                }
                
                requestAnimationFrame(updateCounter);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

/**
 * FAQ Accordion
 */
function initAccordion() {
    const triggers = document.querySelectorAll('.accordion-trigger');
    
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.accordion-item');
            const isOpen = item.classList.contains('open');
            
            // Close all others
            document.querySelectorAll('.accordion-item.open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                }
            });
            
            // Toggle current
            item.classList.toggle('open', !isOpen);
        });
    });
}

/**
 * Magnetic Buttons
 */
function initMagneticButtons() {
    const magneticBtns = document.querySelectorAll('.magnetic-wrap');
    
    magneticBtns.forEach(wrap => {
        const btn = wrap.querySelector('.btn');
        if (!btn) return;
        
        wrap.addEventListener('mousemove', (e) => {
            const rect = wrap.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        wrap.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
        
        wrap.addEventListener('mouseenter', () => {
            btn.style.transition = 'transform 0.1s';
        });
    });
}

/**
 * Cursor glow effect
 */
function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow) return;
    
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animate() {
        // Smooth follow
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        
        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

/**
 * Lenis Smooth Scroll
 */
function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;
    
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
    });
    
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);
    
    // Connect GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        
        gsap.ticker.lagSmoothing(0);
    }
}

/**
 * Hero Animations with GSAP
 */
function initHeroAnimations() {
    if (typeof gsap === 'undefined') return;
    
    // Register plugins
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero text reveal
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDesc = document.querySelector('.hero-desc');
    const heroCta = document.querySelector('.hero-cta');
    
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    if (heroTitle) {
        // Split text if SplitType is available
        if (typeof SplitType !== 'undefined') {
            const split = new SplitType(heroTitle, { types: 'chars, words' });
            
            tl.from(split.chars, {
                opacity: 0,
                y: 100,
                rotateX: -90,
                stagger: 0.02,
                duration: 1,
            });
        } else {
            tl.from(heroTitle, {
                opacity: 0,
                y: 60,
                duration: 1,
            });
        }
    }
    
    if (heroSubtitle) {
        tl.from(heroSubtitle, {
            opacity: 0,
            y: 40,
            duration: 0.8,
        }, '-=0.5');
    }
    
    if (heroDesc) {
        tl.from(heroDesc, {
            opacity: 0,
            y: 30,
            duration: 0.8,
        }, '-=0.4');
    }
    
    if (heroCta) {
        tl.from(heroCta.children, {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.6,
        }, '-=0.3');
    }
    
    // Parallax on scroll
    gsap.to('.gradient-orb', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
        }
    });
    
    // Cards stagger reveal
    gsap.utils.toArray('.card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            delay: i * 0.05,
            ease: 'power2.out'
        });
    });
    
    // Timeline items
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
            },
            opacity: 0,
            x: -30,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power2.out'
        });
    });
}

/**
 * 3D Tilt Effect for Cards
 */
function initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// Initialize tilt cards after load
window.addEventListener('load', initTiltCards);

/**
 * Live Application Counter (Mock)
 */
function initLiveCounter() {
    const counter = document.querySelector('[data-live-counter]');
    if (!counter) return;
    
    // Simulate live counter updates
    let count = parseInt(counter.textContent) || 127;
    
    setInterval(() => {
        if (Math.random() > 0.7) {
            count += Math.floor(Math.random() * 3) + 1;
            counter.textContent = count;
            counter.classList.add('pulse');
            setTimeout(() => counter.classList.remove('pulse'), 500);
        }
    }, 5000);
}

window.addEventListener('load', initLiveCounter);
