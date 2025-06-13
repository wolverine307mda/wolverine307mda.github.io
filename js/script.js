// modoOscuroDiurno.js
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Aplicar el tema guardado al cargar la página
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Escuchar clic en el botón de cambio de tema
    themeToggle.addEventListener('click', toggleTheme);
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Cambiar el tema
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Actualizar el icono
        updateThemeIcon(newTheme);
        
        // Agregar animación al icono
        animateThemeToggle();
    }
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
    
    function animateThemeToggle() {
        themeToggle.style.transform = 'scale(1.2)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 300);
    }
    
    // Detectar preferencia del sistema operativo
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Aplicar tema del sistema si no hay preferencia guardada
    if (!localStorage.getItem('theme')) {
        const systemTheme = prefersDarkScheme.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        updateThemeIcon(systemTheme);
    }
    
    // Escuchar cambios en la preferencia del sistema
    prefersDarkScheme.addListener((e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});


// Script para el mosaico de fotos aleatorias
document.addEventListener('DOMContentLoaded', function () {
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
    './Imgs/fotos/imagen19.jpg',
  ];

  const NUM_IMAGES = 12;
  const SIZE_CLASSES = ['wide', 'tall', 'big', '', '', '', 'wide', 'tall', '', 'wide', '', 'wide'];

  const gallery = document.getElementById('photoGallery');

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
});

