const profilePic = document.getElementById('profile-pic');
const introduction = document.getElementById('introduction');

profilePic.addEventListener('mouseover', () => {
    introduction.style.display = 'block';
});

profilePic.addEventListener('mouseout', () => {
    introduction.style.display = 'none';
});
