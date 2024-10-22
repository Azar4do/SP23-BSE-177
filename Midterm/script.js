// Select the profile image and the introduction section
const profileImage = document.getElementById('profile');
const intro = document.getElementById('intro');

// Show introduction on hover
profileImage.addEventListener('mouseover', function() {
    intro.classList.add('show-intro');
});

// Hide introduction when not hovering
profileImage.addEventListener('mouseout', function() {
    intro.classList.remove('show-intro');
});
