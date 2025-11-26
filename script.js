const toggleButton = document.getElementById('theme-toggle');
const icon = toggleButton.querySelector('.icon');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateIcon('dark');
}

toggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon(newTheme);
});

function updateIcon(theme) {
    if (theme === 'dark') {
        icon.textContent = '🌙';
    } else {
        icon.textContent = '☀️';
    }
}

// Certificate Carousel Logic
const certificates = document.querySelectorAll('.certificate-img');
const prevBtn = document.querySelector('.nav-btn.prev');
const nextBtn = document.querySelector('.nav-btn.next');
let currentCertIndex = 0;

function showCertificate(index, direction) {
    // Hide all certificates and remove animation classes
    certificates.forEach(cert => {
        cert.classList.remove('active', 'slide-in-right', 'slide-in-left');
    });

    // Handle wrapping
    if (index >= certificates.length) {
        currentCertIndex = 0;
    } else if (index < 0) {
        currentCertIndex = certificates.length - 1;
    } else {
        currentCertIndex = index;
    }

    // Show current certificate with animation
    const activeCert = certificates[currentCertIndex];
    activeCert.classList.add('active');

    if (direction === 'next') {
        activeCert.classList.add('slide-in-right');
    } else if (direction === 'prev') {
        activeCert.classList.add('slide-in-left');
    }
}

if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        showCertificate(currentCertIndex - 1, 'prev');
    });

    nextBtn.addEventListener('click', () => {
        showCertificate(currentCertIndex + 1, 'next');
    });
}

// Pixel Opening Animation
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('pixel-overlay');
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Optimize for mobile: larger pixels to reduce DOM count and improve performance
    const isMobile = screenWidth < 768;
    const pixelSize = isMobile ? 80 : 50;

    const cols = Math.ceil(screenWidth / pixelSize);
    const rows = Math.ceil(screenHeight / pixelSize);
    const totalPixels = cols * rows;

    // Create pixels
    for (let i = 0; i < totalPixels; i++) {
        const pixel = document.createElement('div');
        pixel.classList.add('pixel');
        pixel.style.width = `${pixelSize}px`;
        pixel.style.height = `${pixelSize}px`;
        overlay.appendChild(pixel);
    }

    // Animate pixels disappearing
    const pixels = document.querySelectorAll('.pixel');

    // Randomize the disappearance order
    const shuffledIndices = Array.from({ length: pixels.length }, (_, i) => i);
    for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
    }

    // Slower animation on mobile to prevent "too fast" feel
    const interval = isMobile ? 1.5 : 0.5;

    shuffledIndices.forEach((index, i) => {
        setTimeout(() => {
            pixels[index].style.opacity = '0';
            pixels[index].style.transform = 'scale(0)';
        }, i * interval);
    });

    // Remove overlay after animation
    const totalDuration = shuffledIndices.length * interval + 600;
    setTimeout(() => {
        overlay.style.display = 'none';
        // Clean up DOM
        overlay.innerHTML = '';
    }, totalDuration);
});
