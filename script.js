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
    const navbarRect = navbar.getBoundingClientRect();
    const serviceRect = servicesSection.getBoundingClientRect();
    
    if (navbarRect.bottom > serviceRect.top && navbarRect.top < serviceRect.bottom) {
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

    // Rotate wheel1 based on scroll position
    const wheel1 = document.querySelector('.services-section h2 img');
    if (wheel1) {
        const scrollAmount = window.scrollY;
        wheel1.style.transform = `rotate(${scrollAmount / 3}deg)`;
    }
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

// Animate buttons pop-in effect
function animateServiceButtons() {
    const buttons = document.querySelectorAll('.services-list button');
    if (buttons.length === 0 || buttons[0].classList.contains('animated')) return;

    buttons.forEach((button, index) => {
        if (button.style.visibility !== 'hidden') {
            button.classList.add('animated');
            button.style.opacity = '0';
            button.style.transform = 'scale(0.5)';
            button.style.animation = `popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
            button.style.animationDelay = `${index * 0.1}s`;
        }
    });
}

// Intersection Observer for services section
const servicesObserverOptions = {
    threshold: 0.3,
    rootMargin: '0px'
};

const servicesObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateHeading();
            animateServiceButtons();
            servicesObserver.unobserve(entry.target);
        }
    });
}, servicesObserverOptions);

document.addEventListener('DOMContentLoaded', () => {
    const servicesSection = document.querySelector('.services-section');
    if (servicesSection) {
        servicesObserver.observe(servicesSection);
    }
});

// Scroll button
const scrollBtn = document.getElementById('scrollBtn');
if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
        const projectTable = document.getElementById('intro-section');
        if (projectTable) {
            projectTable.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// ========== EVASIVE BUTTON MOVEMENT ==========
function setupEvasiveButtons() {
    const buttons = document.querySelectorAll('.services-list button');
    
    buttons.forEach(button => {
        // Clear animation styles that might be interfering
        button.style.animation = 'none';
        button.style.opacity = '1';
        button.style.transform = 'scale(1)';
        button.style.transition = 'transform 0.2s ease-out';
        
        const maxMove = 130;
        const triggerDistance = 140;
        let lastX = 0;
        let lastY = 0;

        function moveButtonAway(event) {
            const rect = button.getBoundingClientRect();
            const buttonCenterX = rect.left + rect.width / 2;
            const buttonCenterY = rect.top + rect.height / 2;
            const mouseX = event.clientX;
            const mouseY = event.clientY;

            const dx = mouseX - buttonCenterX;
            const dy = mouseY - buttonCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            let newX = 0;
            let newY = 0;

            if (distance < triggerDistance) {
                const angle = Math.atan2(dy, dx);
                const strength = 1 - distance / triggerDistance;
                newX = -Math.cos(angle) * maxMove * strength;
                newY = -Math.sin(angle) * maxMove * strength;
            }

            // Only update if movement is significant (reduce jitter)
            if (Math.abs(newX - lastX) > 2 || Math.abs(newY - lastY) > 2) {
                button.style.transform = `translate(${newX}px, ${newY}px)`;
                lastX = newX;
                lastY = newY;
            }
        }

        document.addEventListener('mousemove', moveButtonAway, { passive: true });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
            lastX = 0;
            lastY = 0;
        });
    });
}

// Call this after services animations are done
document.addEventListener('DOMContentLoaded', () => {
    const servicesSection = document.querySelector('.services-section');
    if (servicesSection) {
        // Observe services section - wait until it's fully in viewport before triggering animations
        const tempObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Trigger animations when fully visible
                    animateHeading();
                    animateServiceButtons();
                    
                    // Wait for animations to complete before setting up hover
                    setTimeout(() => {
                        setupEvasiveButtons();
                    }, 1000);
                    tempObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 1 }); // Changed from 0.3 to 1 - waits for entire section to be visible
        
        tempObserver.observe(servicesSection);
    }
});

// Remove the old servicesObserver that was auto-triggering animations
// The animations are now called above when threshold is 1 (fully visible)

// Scroll to selected works
const projectLink = document.querySelector('a[href="#project-table"]');
if (projectLink) {
    projectLink.addEventListener('click', function(e) {
        e.preventDefault();
        const projectTable = document.getElementById('project-table');
        if (projectTable) {
            projectTable.scrollIntoView({ 
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