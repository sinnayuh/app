<script lang="ts">
    import { onMount } from 'svelte';

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    interface IParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
        update(): void;
        draw(): void;
    }

    class Particle implements IParticle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;

        constructor(
            x: number,
            y: number,
            vx: number,
            vy: number,
            radius: number
        ) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.radius = radius;
        }

        update(): void {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw(): void {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff05';
            ctx.fill();
            ctx.closePath();
        }
    }

    function createParticles(count: number): Particle[] {
        const particles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const vx = Math.random() * 2 - 1;
            const vy = Math.random() * 2 - 1;
            const radius = Math.random() * 2 + 1;
            particles.push(new Particle(x, y, vx, vy, radius));
        }
        return particles;
    }

    function drawLines(particles: Particle[]): void {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }

    onMount(() => {
        if (!canvas) return;

        ctx = canvas.getContext('2d')!;
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = createParticles(150);

        function animate(): void {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.update();
                p.draw();
            });

            drawLines(particles);
            requestAnimationFrame(animate);
        }

        animate();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    });
</script>

<div class="particles-container">
    <canvas bind:this={canvas} id="particles-canvas"></canvas>
</div>

<style>
    .particles-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.3);
        z-index: 1;
    }

    canvas {
        width: 100%;
        height: 100%;
        display: block;
        pointer-events: none;
    }
</style>