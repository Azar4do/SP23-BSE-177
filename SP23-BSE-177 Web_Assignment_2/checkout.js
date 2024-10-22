document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById('checkout-form');

    form.addEventListener('submit', function(event) {
        let isValid = true;

        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(msg => {
            msg.textContent = '';
        });

        // Validate Name
        const name = document.getElementById('name').value.trim();
        if (!name) {
            isValid = false;
            document.getElementById('name-error').textContent = 'Name is required.';
        }

        // Validate Email
        const email = document.getElementById('email').value.trim();
        if (!email) {
            isValid = false;
            document.getElementById('email-error').textContent = 'Email is required.';
        } else if (!validateEmail(email)) {
            isValid = false;
            document.getElementById('email-error').textContent = 'Invalid email format.';
        }

        // Validate Address
        const address = document.getElementById('address').value.trim();
        if (!address) {
            isValid = false;
            document.getElementById('address-error').textContent = 'Address is required.';
        }

        // Validate City
        const city = document.getElementById('city').value.trim();
        if (!city) {
            isValid = false;
            document.getElementById('city-error').textContent = 'City is required.';
        }

        // Prevent form submission if validation fails
        if (!isValid) {
            event.preventDefault();
        }
    });

    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
});
