// Animaciones para las estadísticas
document.addEventListener('DOMContentLoaded', function() {
    // Configurar intersection observer para activar animaciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Activar animaciones basadas en las clases
                if (element.classList.contains('animate-grow')) {
                    element.style.animationPlayState = 'running';
                }
                
                if (element.classList.contains('animate-fade-in')) {
                    element.style.animationPlayState = 'running';
                }
                
                // Animar números con contador - buscar en el elemento y sus hijos
                const statNumbers = element.querySelectorAll('.stat-number');
                statNumbers.forEach(numberElement => {
                    animateNumber(numberElement);
                });
                
                // Si el elemento mismo es un .stat-number, también animarlo
                if (element.classList.contains('stat-number')) {
                    animateNumber(element);
                }
                
                // Animar barras de progreso
                const progressBars = element.querySelectorAll('.stat-progress');
                progressBars.forEach(bar => {
                    bar.style.animationPlayState = 'running';
                });
                
                // No seguir observando este elemento
                observer.unobserve(element);
            }
        });
    }, observerOptions);

    // Observar elementos animables
    const animatedElements = document.querySelectorAll('.animate-grow, .animate-fade-in, .stat-card, .artist-card, .chart-section, .music-stats-grid');
    
    animatedElements.forEach(element => {
        // Pausar las animaciones inicialmente
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    });

    // Función para animar números
    function animateNumber(element) {
        // Usar data-target si existe, si no, usar el texto actual
        const target = element.getAttribute('data-target');
        if (target) {
            const finalNumber = parseInt(target);
            const duration = 2000; // 2 segundos
            const startTime = performance.now();
            
            function updateNumber(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function (ease-out)
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                const currentNumber = Math.floor(finalNumber * easeProgress);
                
                // Formatear número con comas para números grandes
                let displayText = currentNumber.toLocaleString();
                
                element.textContent = displayText;
                
                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                }
            }
            
            requestAnimationFrame(updateNumber);
        } else {
            // Fallback para elementos sin data-target
            const text = element.textContent;
            const hasPlus = text.includes('+');
            const hasHours = text.includes('h');
            const numberMatch = text.match(/\d+/);
            
            if (numberMatch) {
                const finalNumber = parseInt(numberMatch[0]);
                const duration = 2000; // 2 segundos
                const startTime = performance.now();
                
                function updateNumber(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Easing function (ease-out)
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const currentNumber = Math.floor(finalNumber * easeProgress);
                    
                    let displayText = currentNumber.toString();
                    if (hasPlus) displayText += '+';
                    if (hasHours) displayText += 'h';
                    
                    element.textContent = displayText;
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateNumber);
                    }
                }
                
                requestAnimationFrame(updateNumber);
            }
        }
    }

    // Activar animaciones de los géneros musicales
    const genreTags = document.querySelectorAll('.genre-tag');
    genreTags.forEach((tag, index) => {
        tag.style.animationDelay = `${index * 0.1}s`;
        tag.classList.add('animate-fade-in');
    });

    // Efectos hover adicionales para las tarjetas
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Efectos de pulsación para los géneros
    genreTags.forEach(tag => {
        tag.addEventListener('click', function() {
            this.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 300);
        });
    });

    // Animación especial para el gráfico de barras
    const chartSection = document.querySelector('.chart-section');
    if (chartSection) {
        const chartObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bars = entry.target.querySelectorAll('.chart-bar');
                    bars.forEach((bar, index) => {
                        setTimeout(() => {
                            bar.style.animation = 'chartBarGrow 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
                        }, index * 100);
                    });
                    chartObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        chartObserver.observe(chartSection);
    }
    
    // Fallback específico para las estadísticas de música
    setTimeout(function() {
        const musicStatsGrid = document.querySelector('.music-stats-grid');
        if (musicStatsGrid) {
            const statNumbers = musicStatsGrid.querySelectorAll('.stat-number[data-target]');
            statNumbers.forEach(numberElement => {
                // Solo animar si aún muestra "0" o está vacío
                if (numberElement.textContent === '0' || numberElement.textContent.trim() === '') {
                    animateNumber(numberElement);
                }
            });
        }
    }, 1000); // Esperar 1 segundo después de cargar la página
    
    // También animar cuando el usuario haga scroll a la sección de aficiones
    const hobbiesSection = document.getElementById('hobbies');
    if (hobbiesSection) {
        const hobbiesObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number[data-target]');
                    statNumbers.forEach(numberElement => {
                        if (numberElement.textContent === '0' || numberElement.textContent.trim() === '') {
                            animateNumber(numberElement);
                        }
                    });
                    hobbiesObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        hobbiesObserver.observe(hobbiesSection);
    }
});

// Función para añadir efectos de partículas (opcional)
function createParticleEffect(element) {
    const rect = element.getBoundingClientRect();
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'var(--primary-color)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 5;
        const velocity = 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        let opacity = 1;
        let x = 0;
        let y = 0;
        
        function animateParticle() {
            x += vx * 0.016;
            y += vy * 0.016;
            opacity -= 0.02;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }
        
        requestAnimationFrame(animateParticle);
    }
}
