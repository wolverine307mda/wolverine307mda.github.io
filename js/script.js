// Script principal
document.addEventListener('DOMContentLoaded', function() {
    // Configurar año actual en el footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 10) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Galería de fotos
    const allPhotos = [
    './Imgs/fotos/imagen1.jpg',
    './Imgs/fotos/imagen2.jpg',
    './Imgs/fotos/imagen3.jpg',
    './Imgs/fotos/imagen4.jpg',
    './Imgs/fotos/imagen5.jpg',
    './Imgs/fotos/imagen6.jpg',
    './Imgs/fotos/imagen7.jpg',
    './Imgs/fotos/imagen8.jpg',
    './Imgs/fotos/imagen9.jpg',
    './Imgs/fotos/imagen10.jpg',
    './Imgs/fotos/imagen11.jpg',
    './Imgs/fotos/imagen12.jpg',
    './Imgs/fotos/imagen13.jpg',
    './Imgs/fotos/imagen14.jpg',
    './Imgs/fotos/imagen15.jpg',
    './Imgs/fotos/imagen16.jpg',
    './Imgs/fotos/imagen17.jpg',
    './Imgs/fotos/imagen18.jpg',
    './Imgs/fotos/imagen19.jpg'
  ];

  const NUM_IMAGES = 15;
  const SIZE_CLASSES = ['wide', 'tall', 'big', '', '', 'big', 'wide', '', 'big', '', 'wide', '', 'wide', '', 'wide'];

  const gallery = document.getElementById('photoGallery');
  
  if (gallery) {
    function getRandomImages(n) {
      const shuffled = [...allPhotos].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, n);
    }

    function renderGallery() {
      gallery.innerHTML = '';
      const selectedImages = getRandomImages(NUM_IMAGES);

      selectedImages.forEach((url, index) => {
        const div = document.createElement('div');
        div.classList.add('photo-item');

        const size = SIZE_CLASSES[index % SIZE_CLASSES.length];
        if (size) div.classList.add(size);

        const img = document.createElement('img');
        img.src = url;
        img.alt = `Imagen ${index + 1}`;
        img.loading = 'lazy';

        div.appendChild(img);
        gallery.appendChild(div);
      });
    }

    function updateImages() {
      const newImages = getRandomImages(NUM_IMAGES);
      const imgs = document.querySelectorAll('.photo-item img');

      imgs.forEach((img, i) => {
        img.src = newImages[i];
      });
    }

    renderGallery();
    setInterval(updateImages, 10000); // actualiza cada 10s
  }

  // Animación de números para las estadísticas musicales
function animateNumbers() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-target'));
        const duration = 2000; // 2 segundos
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateNumber = () => {
          current += increment;
          if (current < target) {
            entry.target.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateNumber);
          } else {
            entry.target.textContent = target.toLocaleString();
          }
        };
        
        updateNumber();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  statNumbers.forEach(num => observer.observe(num));
}

// Inicializar animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  animateNumbers();
});
});