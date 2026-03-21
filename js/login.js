// js/login.js - Local-Only Login (Hardcoded Owner Credentials)

// Hardcoded credentials (owner only)
const OWNER_EMAIL = "admin@echo.com";
const OWNER_PASSWORD = "123456";

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
        document.getElementById("login-section").classList.remove("active");
        document.getElementById("login-section").classList.add("hidden");

        document.getElementById("dashboard-section").classList.remove("hidden");
        document.getElementById("dashboard-section").classList.add("active");
        sessionStorage.setItem('loggedIn', 'true');
    } else {
      if (loginError) {
        loginError.textContent = 'Invalid credentials.';
        loginError.classList.remove('hidden');
      }
    }
  }
});

