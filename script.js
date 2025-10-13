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

// Scroll event listener for video and navbar
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
    
    // Rotate icon based on scroll position
    const rotatingIcon = document.querySelector('.rotating-icon');
    if (rotatingIcon) {
        const scrollAmount = window.scrollY;
        rotatingIcon.style.transform = `rotate(${scrollAmount / 3}deg)`;
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

// Hero text animation on load
document.addEventListener('DOMContentLoaded', () => {
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        const rect = heroText.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport && !heroText.classList.contains('visible')) {
            heroText.classList.add('visible');
        }
    }
    
    const introText = document.querySelector('.intro-text');
    if (introText) {
        const rect = introText.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport && !introText.classList.contains('visible')) {
            introText.classList.add('visible');
        }
    }
    
    animateServiceItems();
});

// Scroll animation checker
function checkAnimations() {
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
        const rect = heroText.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport && !heroText.classList.contains('visible')) {
            heroText.classList.add('visible');
        }
    }
    
    const introText = document.querySelector('.intro-text');
    if (introText) {
        const rect = introText.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isInViewport && !introText.classList.contains('visible')) {
            introText.classList.add('visible');
        }
    }
}

window.addEventListener('scroll', checkAnimations, { passive: true });

// Scroll button
const scrollBtn = document.getElementById('scrollBtn');
if (scrollBtn) {
    scrollBtn.addEventListener('click', () => {
        const projectTable = document.getElementById('project-table');
        if (projectTable) {
            projectTable.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

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
    
    // Handle click for desktop and touch for mobile
    row.addEventListener('click', (e) => {
        const projectName = row.querySelector('.project-name').textContent;
        handleProjectClick(projectName);
        // Toggle expanded state for mobile
        if (window.innerWidth <= 430) {
            row.classList.toggle('expanded');
        }
    });

    // Handle keyboard accessibility
    row.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            row.click();
        }
    });
});

// Service items animation (placeholder)
function animateServiceItems() {
    // Add your service items animation logic here
}