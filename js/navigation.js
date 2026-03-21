// js/navigation.js - Dashboard Navigation

const sections = document.querySelectorAll('.section');

// Show specific section
window.showSection = function(sectionId) {
  sections.forEach(section => {
    section.classList.remove('active');
    section.classList.add('hidden');
  });
  const targetSection = document.getElementById(`${sectionId}-section`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
    targetSection.classList.add('active');
    
    // Init module if not dashboard
    if (sectionId !== 'dashboard') {
      window[`init${capitalize(sectionId)}`]?.();
    }
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Logout (clear session, redirect to login)
window.logout = function() {
  sessionStorage.removeItem('loggedIn');
  window.location.href = 'index.html';
};

// Init navigation after DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Check login status
  if (sessionStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'index.html';
  }
  window.updateConnectionStatus?.();
});

