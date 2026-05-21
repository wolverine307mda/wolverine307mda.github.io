document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            color: 'rgba(74, 222, 128, 0.8)',
            dx: Math.random() - 0.5,
            dy: Math.random() - 0.5
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
    }

    function updateParticles() {
        particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        });
    }

    function animate() {
        drawParticles();
        updateParticles();
        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    function updateParticleColors(theme) {
        const color = theme === 'light' 
            ? ['rgba(138, 43, 226, 0.8)', 'rgba(30, 144, 255, 0.8)'][Math.floor(Math.random() * 2)] 
            : 'rgba(74, 222, 128, 0.8)';
        particles.forEach(p => p.color = color);
    }

    // Listen for theme changes
    document.addEventListener('themeChange', (event) => {
        console.log('ThemeChange event received. New theme:', event.detail.theme);
        updateParticleColors(event.detail.theme);
    });

    // Initialize particle colors based on the current theme
    const initialTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    updateParticleColors(initialTheme);
});