const navbar = document.querySelector('.navbar');

// Codifying text effect
function codifyEffect(element, speed = 25, scrambleSpeed = 15, scrambleCount = 1) {
    const originalText = element.getAttribute('data-text');
    let displayText = '';
    let charIndex = 0;
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

    function getRandomChar() {
        return possibleChars[Math.floor(Math.random() * possibleChars.length)];
    }

    function scrambleChar(finalChar, iterations, callback) {
        let count = 0;
        const scrambleInterval = setInterval(() => {
            element.textContent = displayText + getRandomChar();
            count++;
            if (count >= iterations) {
                clearInterval(scrambleInterval);
                displayText += finalChar;
                element.textContent = displayText;
                callback();
            }
        }, scrambleSpeed);
    }

    function typeNextChar() {
        if (charIndex < originalText.length) {
            scrambleChar(originalText[charIndex], scrambleCount, () => {
                charIndex++;
                setTimeout(typeNextChar, speed);
            });
        }
    }

    element.textContent = '';
    typeNextChar();
}

// Apply codifying effect to elements with .codify-text class when in viewport
const codifyText = document.querySelector('.codify-text');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('codified')) {
            codifyEffect(entry.target);
            entry.target.classList.add('codified');
        }
    });
}, { threshold: 0.5 });

if (codifyText) {
    observer.observe(codifyText);
}

// Navbar visibility on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('visible');
    } else {
        navbar.classList.remove('visible');
    }
});

// Hero text and stickers animation
document.addEventListener('DOMContentLoaded', () => {
    const heroText = document.querySelector('.hero-text');
    const stickersContainer = document.querySelector('.stickers-container');
    const rect = heroText.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport && !heroText.classList.contains('visible')) {
        heroText.classList.add('visible');
        stickersContainer.classList.add('visible');
    }
});

document.addEventListener('scroll', () => {
    const heroText = document.querySelector('.hero-text');
    const stickersContainer = document.querySelector('.stickers-container');
    const rect = heroText.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport && !heroText.classList.contains('visible')) {
        heroText.classList.add('visible');
        stickersContainer.classList.add('visible');
    }
});

// Scroll to selected works
document.querySelector('a[href="#project-table"]').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('project-table').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
});

// Background text animation
const backgroundText = document.querySelector('.background-text');
const currentlyText = document.querySelector('.currently-text');

const backgroundObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.8 });

if (backgroundText) {
    backgroundObserver.observe(backgroundText);
}

if (currentlyText) {
    backgroundObserver.observe(currentlyText);
}

// Cursor follower for carousel
function initCursorFollower() {
    const carousel = document.querySelector('.carousel');
    const follower = document.querySelector('.cursor-follower');
    
    if (!carousel || !follower) return;
    
    carousel.addEventListener('mouseenter', () => {
        follower.classList.add('visible');
    });
    
    carousel.addEventListener('mouseleave', () => {
        follower.classList.remove('visible');
    });
    
    carousel.addEventListener('mousemove', (e) => {
        follower.style.left = e.clientX + 'px';
        follower.style.top = e.clientY + 'px';
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initCursorFollower);

// Animate service items on scroll
function animateServiceItems() {
    const sticker = document.querySelector('.services-sticker');
    const serviceItems = document.querySelectorAll('.service-item');
    
    if (!sticker || serviceItems.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    sticker.classList.add('visible');
                }, 100);
                
                serviceItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('visible');
                    }, 300 + (index * 150));
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    observer.observe(document.querySelector('.services-section'));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', animateServiceItems);

// Selected Projects Hover
function handleProjectClick(projectName) {
    console.log('Clicked project:', projectName);
}

document.querySelectorAll('.project-row').forEach((row) => {
    row.setAttribute('tabindex', '0');
    row.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            row.click();
        }
    });
});