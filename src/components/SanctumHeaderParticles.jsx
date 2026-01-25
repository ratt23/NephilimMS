import React, { useRef, useEffect } from 'react';

export default function SanctumHeaderParticles({ className = '' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.parentElement.offsetWidth;
        let height = canvas.height = canvas.parentElement.offsetHeight;

        let particles = [];
        const particleCount = 60; // Enough for a header

        const colors = [
            'rgba(31, 106, 255, 0.6)', // Sanctum Accent Blue
            'rgba(255, 255, 255, 0.4)', // Faint White
            'rgba(40, 60, 100, 0.5)'    // Muted Navy
        ];

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.2; // Slow horizontal drift
                this.vy = (Math.random() - 0.5) * 0.2; // Slow vertical drift
                this.size = Math.random() * 2 + 0.5;
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges (or wrap) - Wrapping is smoother for header
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        // Initialize
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function drawLines() {
            let maxDist = 100;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxDist) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(31, 106, 255, ${0.1 * (1 - dist / maxDist)})`; // Very faint blue lines
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            // Clear with slight trail effect or pure clear
            ctx.clearRect(0, 0, width, height);

            // Draw background (optional, or let CSS handle it)
            // We'll let CSS handle the base color so it matches perfectly, this just draws particles

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            drawLines();
            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            if (canvas && canvas.parentElement) {
                width = canvas.width = canvas.parentElement.offsetWidth;
                height = canvas.height = canvas.parentElement.offsetHeight;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-0 pointer-events-none ${className}`}
        />
    );
}
