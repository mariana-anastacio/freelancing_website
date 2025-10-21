const videoContainer = document.querySelector('.video-container');
const video = document.getElementById('myVideo');
const navbar = document.querySelector('.navbar');
const muteBtn = document.getElementById('muteBtn');

// Set video to autoplay muted
video.muted = true;

// Initialize mute button state
function updateButtonState() {
    if (video.muted) {
        muteBtn.classList.add('muted');
    } else {
        muteBtn.classList.remove('muted');
    }
}

updateButtonState();

// Handle mute button clicks
muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    updateButtonState();
});

// Audio Visualizer Setup
const visualizer = document.getElementById('visualizer');
let audioCtx = null;
let analyser = null;
let animationFrameId = null;

function initAudioVisualizer() {
    if (audioCtx) return;
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(video);
    
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Create bars
    const numBars = 20;
    for (let i = 0; i < numBars; i++) {
        const bar = document.createElement('div');
        bar.classList.add('bar');
        visualizer.appendChild(bar);
    }
    const bars = document.querySelectorAll('.bar');
    
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        analyser.getByteFrequencyData(dataArray);
        
        bars.forEach((bar, index) => {
            const value = dataArray[index * Math.floor(bufferLength / numBars)] || 0;
            const scale = (value / 255) * 5;
            bar.style.transform = `scaleY(${scale})`;
        });
    }
    
    animate();
}

video.addEventListener('play', () => {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    initAudioVisualizer();
});

video.addEventListener('pause', () => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
});

// Scroll event listener for video, navbar, and rotations
window.addEventListener('scroll', () => {
    const rect = videoContainer.getBoundingClientRect();
    const isInViewport = !(rect.bottom < 0 || rect.top > window.innerHeight);
    
    if (!isInViewport && !video.paused) {
        video.pause();
    } else if (isInViewport && video.paused && !video.ended) {
        video.play().catch(err => {
            console.log('Autoplay prevented:', err);
        });
    }
    
    if (window.scrollY > 50) {
        navbar.classList.add('visible');
        videoContainer.classList.add('scrolled');
    } else {
        navbar.classList.remove('visible');
        videoContainer.classList.remove('scrolled');
    }
    
    // Check if navbar is over services section (light background)
    const servicesSection = document.querySelector('.services-section');
    const aboutSection = document.querySelector('.about-section');
    const navbarRect = navbar.getBoundingClientRect();
    const serviceRect = servicesSection.getBoundingClientRect();
    const aboutRect = aboutSection.getBoundingClientRect();

    // Check if navbar is over EITHER services OR about section
    if (
        (navbarRect.bottom > aboutRect.top && navbarRect.top < aboutRect.bottom)) {
        navbar.classList.add('inverted');
    } else {
        navbar.classList.remove('inverted');
    }
    

    // Rotate icon based on scroll position (for .rotating-icon)
    const rotatingIcon = document.querySelector('.rotating-icon');
    if (rotatingIcon) {
        const scrollAmount = window.scrollY;
        rotatingIcon.style.transform = `rotate(${scrollAmount / 3}deg)`;
    }

    // Rotate wheel1 based on scroll position (for both services and selected works)
    const wheels = document.querySelectorAll('.services-section h2 img, .sworks-section h2 img');
    wheels.forEach(wheel => {
        if (wheel) {
            const scrollAmount = window.scrollY;
            wheel.style.transform = `rotate(${scrollAmount * 1.5}deg)`;
        }
    });
}, { passive: true });

// Fallback play button for mobile
window.addEventListener('load', () => {
    const rect = videoContainer.getBoundingClientRect();
    const isInViewport = !(rect.bottom < 0 || rect.top > window.innerHeight);
    if (isInViewport) {
        video.play().catch(err => {
            console.log('Autoplay prevented by browser:', err);
            if (!document.querySelector('.play-btn')) {
                const playBtn = document.createElement('button');
                playBtn.className = 'play-btn';
                playBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" stroke-width="2" fill="none">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                `;
                playBtn.style.position = 'absolute';
                playBtn.style.top = '50%';
                playBtn.style.left = '50%';
                playBtn.style.transform = 'translate(-50%, -50%)';
                videoContainer.appendChild(playBtn);

                playBtn.addEventListener('click', () => {
                    video.play();
                    playBtn.remove();
                });
            }
        });
    }
});

// Intersection Observer for intro text animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('Intro text is in viewport');
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Hero text animation on load (only hero text, not intro)
document.addEventListener('DOMContentLoaded', () => {
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        const rect = heroText.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport && !heroText.classList.contains('visible')) {
            heroText.classList.add('visible');
        }
    }
});

// Observe intro text separately - only trigger on scroll/viewport
document.addEventListener('DOMContentLoaded', () => {
    const introText = document.querySelector('.intro-text');
    if (introText) {
        observer.observe(introText);
    }
});

// ========== SERVICES SECTION ANIMATIONS ==========

// Animate h2 heading letter by letter
function animateHeading() {
    const heading = document.querySelector('.services-section h2');
    if (!heading || heading.classList.contains('animated')) return;

    // Store the image element
    const img = heading.querySelector('img');
    
    // Get text content (without the image)
    const textNode = Array.from(heading.childNodes).find(node => node.nodeType === 3);
    const text = textNode ? textNode.textContent.trim() : 'SERVICES';
    
    // Clear the heading
    heading.innerHTML = '';
    heading.classList.add('animated');
    
    // Create spans for each letter
    text.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.animation = `fadeInLetter 0.1s ease forwards`;
        span.style.animationDelay = `${index * 0.05}s`;
        heading.appendChild(span);
    });
    
    // Re-add the image with animation
    if (img) {
        img.style.opacity = '0';
        img.style.animation = `fadeInImage 0.4s ease forwards`;
        img.style.animationDelay = `${text.length * 0.05 + 0.1}s`;
        heading.appendChild(img);
        
        // Remove animation styles after animation completes
        const delay = (text.length * 0.05 + 0.1) * 1000;
        const duration = 400;
        setTimeout(() => {
            img.style.animation = 'none';
            img.style.opacity = '1';
        }, delay + duration + 50);
    }
}

// ========== CARDS ANIMATION ON VIEWPORT ==========

function animateCards() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.classList.add('animate');
    });
}

// Intersection Observer for cards - triggers when 50% of services section is visible
const cardsObserverOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const cardsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCards();
            cardsObserver.unobserve(entry.target);
        }
    });
}, cardsObserverOptions);

// Intersection Observer for services section heading
const servicesObserverOptions = {
    threshold: 0.3,
    rootMargin: '0px'
};

const servicesObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateHeading();
            servicesObserver.unobserve(entry.target);
        }
    });
}, servicesObserverOptions);

document.addEventListener('DOMContentLoaded', () => {
    const servicesSection = document.querySelector('.services-section');
    if (servicesSection) {
        servicesObserver.observe(servicesSection);
        // Observe the services section for cards animation
        cardsObserver.observe(servicesSection);
    }
});

// ========== SELECTED WORKS SECTION ANIMATIONS ==========

// Animate Selected Works h2 heading letter by letter
function animateSelectedWorksHeading() {
    const heading = document.querySelector('.sworks-section h2');
    if (!heading || heading.classList.contains('animated')) return;

    // Store the image element and the wrapper spans
    const img = heading.querySelector('img');
    const selectedSpan = heading.querySelector('.selected-text');
    const worksSpan = heading.querySelector('.works-text');
    
    if (!selectedSpan || !worksSpan) return; // Safety check
    
    // Get the text content from each span
    const selectedText = selectedSpan.textContent.trim();
    const worksText = worksSpan.textContent.trim();
    
    // Clear the heading
    heading.innerHTML = '';
    heading.classList.add('animated');
    
    // Create new wrapper for SELECTED line
    const selectedWrapper = document.createElement('span');
    selectedWrapper.className = 'selected-text';
    selectedWrapper.style.display = 'block';
    
    // Animate SELECTED letters
    selectedText.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.animation = `fadeInLetter 0.1s ease forwards`;
        span.style.animationDelay = `${index * 0.05}s`;
        selectedWrapper.appendChild(span);
    });
    
    heading.appendChild(selectedWrapper);
    heading.appendChild(document.createElement('br'));
    
    // Create new wrapper for WORKS line
    const worksWrapper = document.createElement('span');
    worksWrapper.className = 'works-text';
    worksWrapper.style.display = 'inline-block';
    
    // Animate WORKS letters
    worksText.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.animation = `fadeInLetter 0.1s ease forwards`;
        const totalIndex = selectedText.length + index;
        span.style.animationDelay = `${totalIndex * 0.05}s`;
        worksWrapper.appendChild(span);
    });
    
    heading.appendChild(worksWrapper);
    
    // Re-add the image with animation
    if (img) {
        img.style.opacity = '0';
        img.style.animation = `fadeInImage 0.4s ease forwards`;
        const totalLetters = selectedText.length + worksText.length;
        img.style.animationDelay = `${totalLetters * 0.05 + 0.1}s`;
        heading.appendChild(img);
        
        // Remove animation styles after animation completes
        const delay = (totalLetters * 0.05 + 0.1) * 1000;
        const duration = 400;
        setTimeout(() => {
            img.style.animation = 'none';
            img.style.opacity = '1';
        }, delay + duration + 50);
    }
}

// Intersection Observer for selected works section
const sworksObserverOptions = {
    threshold: 0.3,
    rootMargin: '0px'
};

const sworksObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateSelectedWorksHeading();
            sworksObserver.unobserve(entry.target);
        }
    });
}, sworksObserverOptions);

document.addEventListener('DOMContentLoaded', () => {
    const sworksSection = document.querySelector('.sworks-section');
    if (sworksSection) {
        sworksObserver.observe(sworksSection);
    }
});

// Scroll button
const scrollBtn = document.getElementById('scrollBtn');
if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
        const introSection = document.getElementById('intro-section');
        if (introSection) {
            introSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// Scroll to selected works
const projectLink = document.querySelector('a[href="#sworks-section"]');
if (projectLink) {
    projectLink.addEventListener('click', function(e) {
        e.preventDefault();
        const projectTable = document.getElementById('sworks-section');
        if (projectTable) {
            projectTable.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// Smooth scroll for about me link
const aboutLink = document.querySelector('a[href="#about-section"]');
if (aboutLink) {
    aboutLink.addEventListener('click', function(e) {
        e.preventDefault();
        const aboutSection = document.getElementById('about-section');
        if (aboutSection) {
            aboutSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// Selected Projects Touch and Click Handling
function handleProjectClick(projectName) {
    console.log('Clicked project:', projectName);
}

document.querySelectorAll('.project-row').forEach((row) => {
    row.setAttribute('tabindex', '0');
    
    row.addEventListener('click', (e) => {
        const projectName = row.querySelector('.project-name').textContent;
        handleProjectClick(projectName);
        if (window.innerWidth <= 430) {
            row.classList.toggle('expanded');
        }
    });

    row.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            row.click();
        }
    });
});

// Intersection Observer for about section animation
const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            aboutObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5, rootMargin: '0px' });

document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        aboutObserver.observe(aboutSection);
    }
});

// PDF Overlay Logic
const curriculumBtn = document.querySelector('.curriculum-btn');
const philosophyBtn = document.querySelector('.philosophy-btn');
const pdfOverlay = document.createElement('div');
pdfOverlay.className = 'pdf-overlay';
document.body.appendChild(pdfOverlay);

if (curriculumBtn) {
    curriculumBtn.addEventListener('click', () => {
        pdfOverlay.innerHTML = `
            <div class="pdf-container">
                <button class="close-btn">X</button>
                <button class="download-btn">⬇</button>
                <iframe class="pdf-content" src="MarianaAnastacio_CV.pdf#toolbar=0&navpanes=0&scrollbar=0"></iframe>
            </div>
        `;
        pdfOverlay.classList.add('active');

        const closeBtn = pdfOverlay.querySelector('.close-btn');
        const downloadBtn = pdfOverlay.querySelector('.download-btn');
        closeBtn.addEventListener('click', () => {
            pdfOverlay.classList.remove('active');
        });
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = 'MarianaAnastacio_CV.pdf';
            link.download = 'MarianaAnastacio_CV.pdf';
            link.click();
        });
    });
}

// ========== CONTACT SECTION ANIMATIONS ==========
// Animate contact h2 heading letter by letter
function animateContactHeading() {
    const heading = document.querySelector('.contact-section h2');
    if (!heading || heading.classList.contains('animated')) return;

    // Get text content
    const text = heading.textContent.trim();
    
    // Clear the heading
    heading.innerHTML = '';
    heading.classList.add('animated');
    
    // Create spans for each letter (including spaces)
    text.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.animation = `fadeInLetter 0.1s ease forwards`;
        span.style.animationDelay = `${index * 0.05}s`;
        heading.appendChild(span);
    });
}

// Intersection Observer for scroll-triggered animation
const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateContactHeading();
            contactObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.3
});

// Observe the contact section
const contactSection = document.querySelector('.contact-section');
if (contactSection) {
    contactObserver.observe(contactSection);
}