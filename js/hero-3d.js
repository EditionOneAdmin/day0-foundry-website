/**
 * Day-0 Foundry - Hero 3D Element
 * Awwwards-worthy Three.js experience
 */

class Hero3D {
    constructor(container) {
        this.container = container;
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.time = 0;
        this.particles = [];
        this.connections = [];
        
        this.init();
        this.createParticleSystem();
        this.createFloatingShapes();
        this.createGlowOrbs();
        this.bindEvents();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;

        // Renderer with transparency
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        this.container.appendChild(this.renderer.domElement);

        // Post-processing glow (simulated with ambient light)
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(this.ambientLight);

        // Point lights for dramatic effect
        this.pointLight1 = new THREE.PointLight(0x00D4FF, 2, 100);
        this.pointLight1.position.set(20, 20, 20);
        this.scene.add(this.pointLight1);

        this.pointLight2 = new THREE.PointLight(0x7C3AED, 2, 100);
        this.pointLight2.position.set(-20, -20, 20);
        this.scene.add(this.pointLight2);
    }

    createParticleSystem() {
        // Main particle sphere - the centerpiece
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = [];

        // Create particles on sphere surface with organic distribution
        for (let i = 0; i < particleCount; i++) {
            // Fibonacci sphere distribution for even spacing
            const phi = Math.acos(-1 + (2 * i) / particleCount);
            const theta = Math.sqrt(particleCount * Math.PI) * phi;
            
            const radius = 8 + Math.random() * 2;
            const x = radius * Math.cos(theta) * Math.sin(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Gradient colors: cyan to purple
            const t = Math.random();
            colors[i * 3] = t * 0.486 + (1 - t) * 0; // R: purple to cyan
            colors[i * 3 + 1] = t * 0.227 + (1 - t) * 0.831; // G
            colors[i * 3 + 2] = t * 0.929 + (1 - t) * 1; // B

            sizes[i] = Math.random() * 3 + 1;

            // Store velocity for animation
            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.02,
                originalX: x,
                originalY: y,
                originalZ: z
            });
        }

        this.particleVelocities = velocities;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Custom shader material for glowing particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                mouseX: { value: 0 },
                mouseY: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;
                varying float vAlpha;
                uniform float time;
                uniform float mouseX;
                uniform float mouseY;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    
                    // Organic wave motion
                    float wave = sin(pos.x * 0.5 + time) * cos(pos.y * 0.5 + time) * 0.5;
                    pos += normalize(pos) * wave;
                    
                    // Mouse influence - particles push away from mouse
                    float mouseInfluence = 2.0;
                    pos.x += mouseX * mouseInfluence * (1.0 - length(pos) / 15.0);
                    pos.y += mouseY * mouseInfluence * (1.0 - length(pos) / 15.0);
                    
                    // Breathing effect
                    float breath = sin(time * 0.5) * 0.3 + 1.0;
                    pos *= breath;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Size attenuation
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    
                    // Distance-based alpha
                    vAlpha = 1.0 - smoothstep(5.0, 15.0, length(pos));
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    // Circular particle with soft edge
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                    alpha *= vAlpha;
                    
                    // Glow effect
                    vec3 glow = vColor * 1.5;
                    
                    gl_FragColor = vec4(glow, alpha * 0.8);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);

        // Create connection lines between nearby particles
        this.createConnections();
    }

    createConnections() {
        // Dynamic line connections (wireframe effect)
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00D4FF,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });

        // We'll update this dynamically
        this.connectionLines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.connectionLines);
    }

    updateConnections() {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const connectionDistance = 3;
        const linePositions = [];

        // Sample subset for performance
        const sampleRate = 10;
        for (let i = 0; i < positions.length / 3; i += sampleRate) {
            const x1 = positions[i * 3];
            const y1 = positions[i * 3 + 1];
            const z1 = positions[i * 3 + 2];

            for (let j = i + sampleRate; j < positions.length / 3; j += sampleRate) {
                const x2 = positions[j * 3];
                const y2 = positions[j * 3 + 1];
                const z2 = positions[j * 3 + 2];

                const dist = Math.sqrt(
                    Math.pow(x2 - x1, 2) +
                    Math.pow(y2 - y1, 2) +
                    Math.pow(z2 - z1, 2)
                );

                if (dist < connectionDistance) {
                    linePositions.push(x1, y1, z1, x2, y2, z2);
                }
            }
        }

        this.connectionLines.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(linePositions, 3)
        );
    }

    createFloatingShapes() {
        // Floating geometric shapes in background
        this.floatingShapes = [];

        const shapes = [
            { geometry: new THREE.IcosahedronGeometry(1, 0), count: 5 },
            { geometry: new THREE.OctahedronGeometry(0.8, 0), count: 4 },
            { geometry: new THREE.TetrahedronGeometry(0.6, 0), count: 6 }
        ];

        shapes.forEach(({ geometry, count }) => {
            for (let i = 0; i < count; i++) {
                const material = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? 0x00D4FF : 0x7C3AED,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.3
                });

                const mesh = new THREE.Mesh(geometry, material);
                
                // Random positions around the scene
                mesh.position.set(
                    (Math.random() - 0.5) * 60,
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 20 - 10
                );

                mesh.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );

                mesh.userData = {
                    rotationSpeed: {
                        x: (Math.random() - 0.5) * 0.01,
                        y: (Math.random() - 0.5) * 0.01,
                        z: (Math.random() - 0.5) * 0.01
                    },
                    floatSpeed: Math.random() * 0.5 + 0.5,
                    floatOffset: Math.random() * Math.PI * 2,
                    originalY: mesh.position.y,
                    parallaxFactor: Math.random() * 0.5 + 0.5
                };

                this.scene.add(mesh);
                this.floatingShapes.push(mesh);
            }
        });
    }

    createGlowOrbs() {
        // Dynamic glowing orbs
        this.glowOrbs = [];

        const orbPositions = [
            { x: -15, y: 10, z: -5, color: 0x00D4FF, size: 3 },
            { x: 18, y: -8, z: -8, color: 0x7C3AED, size: 4 },
            { x: 0, y: -15, z: -3, color: 0x00D4FF, size: 2 }
        ];

        orbPositions.forEach(({ x, y, z, color, size }) => {
            const geometry = new THREE.SphereGeometry(size, 32, 32);
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(color) }
                },
                vertexShader: `
                    varying vec3 vNormal;
                    void main() {
                        vNormal = normalize(normalMatrix * normal);
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float time;
                    uniform vec3 color;
                    varying vec3 vNormal;
                    
                    void main() {
                        float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                        float pulse = sin(time * 2.0) * 0.1 + 0.9;
                        gl_FragColor = vec4(color * intensity * pulse, intensity * 0.5);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
            });

            const orb = new THREE.Mesh(geometry, material);
            orb.position.set(x, y, z);
            orb.userData = {
                originalPos: { x, y, z },
                floatSpeed: Math.random() * 0.3 + 0.2,
                floatRange: Math.random() * 2 + 1
            };

            this.scene.add(orb);
            this.glowOrbs.push(orb);
        });
    }

    bindEvents() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Touch support
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        });

        // Resize
        window.addEventListener('resize', () => this.onResize());

        // Scroll parallax
        window.addEventListener('scroll', () => this.onScroll());
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.particleSystem.material.uniforms.pixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }

    onScroll() {
        const scrollY = window.scrollY;
        const maxScroll = window.innerHeight;
        
        // Parallax effect on shapes
        this.floatingShapes.forEach(shape => {
            const factor = shape.userData.parallaxFactor;
            shape.position.y = shape.userData.originalY - (scrollY * factor * 0.05);
        });

        // Fade out particle system on scroll
        if (this.particleSystem) {
            const opacity = Math.max(0, 1 - scrollY / maxScroll);
            this.particleSystem.material.opacity = opacity;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.time += 0.01;

        // Smooth mouse interpolation
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

        // Update particle system uniforms
        if (this.particleSystem) {
            this.particleSystem.material.uniforms.time.value = this.time;
            this.particleSystem.material.uniforms.mouseX.value = this.mouse.x;
            this.particleSystem.material.uniforms.mouseY.value = this.mouse.y;

            // Rotate entire particle system
            this.particleSystem.rotation.y += 0.002;
            this.particleSystem.rotation.x = this.mouse.y * 0.2;
            this.particleSystem.rotation.z = this.mouse.x * 0.1;
        }

        // Update connection lines periodically
        if (Math.floor(this.time * 10) % 3 === 0) {
            this.updateConnections();
        }

        // Animate floating shapes
        this.floatingShapes.forEach(shape => {
            const { rotationSpeed, floatSpeed, floatOffset, originalY } = shape.userData;
            
            shape.rotation.x += rotationSpeed.x;
            shape.rotation.y += rotationSpeed.y;
            shape.rotation.z += rotationSpeed.z;
            
            // Floating motion
            shape.position.y = originalY + Math.sin(this.time * floatSpeed + floatOffset) * 2;
            
            // Subtle parallax with mouse
            shape.position.x += this.mouse.x * 0.01;
        });

        // Animate glow orbs
        this.glowOrbs.forEach(orb => {
            orb.material.uniforms.time.value = this.time;
            
            const { originalPos, floatSpeed, floatRange } = orb.userData;
            orb.position.y = originalPos.y + Math.sin(this.time * floatSpeed) * floatRange;
            orb.position.x = originalPos.x + Math.cos(this.time * floatSpeed * 0.7) * floatRange * 0.5;
        });

        // Animate point lights
        this.pointLight1.position.x = Math.sin(this.time * 0.5) * 25;
        this.pointLight1.position.y = Math.cos(this.time * 0.5) * 25;
        
        this.pointLight2.position.x = Math.cos(this.time * 0.3) * 25;
        this.pointLight2.position.y = Math.sin(this.time * 0.3) * 25;

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        // Cleanup
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
}

// ============================================
// GSAP Text Animations
// ============================================

class HeroAnimations {
    constructor() {
        this.initSplitText();
        this.initParallaxElements();
        this.initGradientOrbs();
        this.initScrollAnimations();
    }

    initSplitText() {
        // Wait for SplitType to be available
        if (typeof SplitType === 'undefined') {
            console.warn('SplitType not loaded');
            return;
        }

        // Split the headline
        const headline = document.querySelector('.hero-headline');
        if (!headline) return;

        const split = new SplitType(headline, { 
            types: 'chars, words',
            tagName: 'span'
        });

        // Initial state
        gsap.set(split.chars, { 
            opacity: 0, 
            y: 100,
            rotateX: -90,
            transformOrigin: 'center bottom'
        });

        // Animate characters
        gsap.to(split.chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1,
            ease: 'power4.out',
            stagger: {
                each: 0.03,
                from: 'start'
            },
            delay: 0.5
        });

        // Add hover effect to each character
        split.chars.forEach(char => {
            char.addEventListener('mouseenter', () => {
                gsap.to(char, {
                    y: -10,
                    color: '#00D4FF',
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });
            char.addEventListener('mouseleave', () => {
                gsap.to(char, {
                    y: 0,
                    color: 'inherit',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Subheadline animation
        const subheadline = document.querySelector('.hero-subheadline');
        if (subheadline) {
            gsap.from(subheadline, {
                opacity: 0,
                y: 30,
                duration: 1,
                ease: 'power3.out',
                delay: 1.2
            });
        }

        // CTA buttons animation
        const ctas = document.querySelectorAll('.hero-cta-btn');
        gsap.from(ctas, {
            opacity: 0,
            y: 40,
            scale: 0.9,
            duration: 0.8,
            ease: 'back.out(1.7)',
            stagger: 0.15,
            delay: 1.5
        });
    }

    initParallaxElements() {
        // Create floating particles in the background
        const particleContainer = document.querySelector('.floating-particles');
        if (!particleContainer) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: ${Math.random() > 0.5 ? '#00D4FF' : '#7C3AED'};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.5 + 0.2};
                pointer-events: none;
            `;
            particleContainer.appendChild(particle);

            // Animate each particle
            gsap.to(particle, {
                y: `${(Math.random() - 0.5) * 100}`,
                x: `${(Math.random() - 0.5) * 50}`,
                duration: Math.random() * 10 + 10,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }

        // Mouse parallax for floating elements
        document.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;

            gsap.to('.parallax-slow', {
                x: moveX * 10,
                y: moveY * 10,
                duration: 1,
                ease: 'power2.out'
            });

            gsap.to('.parallax-fast', {
                x: moveX * 30,
                y: moveY * 30,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    }

    initGradientOrbs() {
        const orbs = document.querySelectorAll('.gradient-orb-animated');
        
        orbs.forEach((orb, i) => {
            // Base floating animation
            gsap.to(orb, {
                y: '+=30',
                x: '+=20',
                duration: 4 + i,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            // Scale pulse
            gsap.to(orb, {
                scale: 1.2,
                duration: 3 + i * 0.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            // Opacity pulse
            gsap.to(orb, {
                opacity: 0.6,
                duration: 2 + i * 0.3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        });
    }

    initScrollAnimations() {
        if (typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // Parallax on scroll for hero content
        gsap.to('.hero-content', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 200,
            opacity: 0,
            scale: 0.9
        });

        // 3D container parallax
        gsap.to('.hero-3d-container', {
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            },
            y: 100,
            opacity: 0
        });
    }
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D scene
    const container = document.getElementById('hero-3d-container');
    if (container) {
        window.hero3D = new Hero3D(container);
    }

    // Initialize text animations
    window.heroAnimations = new HeroAnimations();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Hero3D, HeroAnimations };
}
