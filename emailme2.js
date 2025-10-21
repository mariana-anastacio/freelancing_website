document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    fetch(this.action, {
        method: 'POST',
        body: new FormData(this),
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            window.location.href = 'thankyou.html'; // Redirect to thank you page
        } else {
            alert('There was a problem with your submission. Please try again.');
        }
    }).catch(error => {
        alert('There was a problem with your submission. Please try again.');
    });
});
