document.querySelectorAll('.input-label').forEach(label => {
    label.addEventListener('click', function() {
        const inputField = document.getElementById(label.getAttribute('for'));
        inputField.focus(); // Focus the input field
    });
});

// Function to manage label visibility on input field blur
document.querySelectorAll('.input-field').forEach(input => {
    input.addEventListener('blur', function() {
        if (input.value === '') {
            const label = document.querySelector(`label[for="${input.id}"]`);
            label.style.display = 'block'; // Show label if input is empty
        }
    });
});

// Form submission handler
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const submitButton = document.getElementById('send-button');
    const originalText = submitButton.textContent;
    
    // Show loading state
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    fetch(this.action, {
        method: 'POST',
        body: new FormData(this),
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            // Success - redirect to thank you page
            window.location.href = 'thankyou.html';
        } else {
            // Error handling
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            alert('There was a problem with your submission. Please try again.');
        }
    }).catch(error => {
        // Network error handling
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        alert('There was a problem with your submission. Please try again.');
    });
});

// Optional: Add visual feedback when dropdown changes
document.getElementById('reason').addEventListener('change', function() {
    if (this.value) {
        this.style.color = '#333';
    }
});

// Optional: Enhance dropdown hover effects (requires additional styling)
const dropdownOptions = document.querySelectorAll('#reason option');
dropdownOptions.forEach(option => {
    option.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#333';
        this.style.color = 'white';
    });
    option.addEventListener('mouseleave', function() {
        if (!this.selected) {
            this.style.backgroundColor = 'white';
            this.style.color = '#333';
        }
    });
});
