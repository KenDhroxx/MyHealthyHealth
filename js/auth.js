// Authentication JavaScript for My Healthy Health

// Update the API base URL - try both options
const API_BASE_URL = 'http://localhost:5000/api';
// If that doesn't work, try:
// const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Navigation management
function updateNavigation() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Get navigation elements
  const authLinks = document.querySelector('.auth-links');
  const userMenu = document.querySelector('.user-menu');
  
  if (token && user.name) {
    // User is logged in - hide auth links, show user menu
    if (authLinks) authLinks.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'block';
      
      // Update user avatar and name
      const avatar = document.getElementById('userAvatar');
      const nameElement = document.getElementById('userName');
      
      if (avatar) {
        avatar.textContent = user.name.charAt(0).toUpperCase();
      }
      if (nameElement) {
        nameElement.textContent = user.name;
      }
      
      // Show admin dashboard link if user is admin
      const adminLink = document.querySelector('.admin-only');
      if (adminLink) {
        if (user.role === 'admin') {
          adminLink.style.display = 'flex';
        } else {
          adminLink.style.display = 'none';
        }
      }
    }
    
    // Show welcome message on home page
    showWelcomeMessage(user.name, user.role);
    
  } else {
    // User is not logged in - show auth links, hide user menu
    if (authLinks) authLinks.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
  }
}

// Show welcome message for logged-in users
function showWelcomeMessage(userName, userRole) {
  // Only show on home page
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    const heroSection = document.querySelector('.hero__content');
    if (heroSection && !document.querySelector('.welcome-back-message')) {
      const isAdmin = userRole === 'admin';
      const welcomeMessage = document.createElement('div');
      welcomeMessage.className = 'welcome-back-message';
      welcomeMessage.innerHTML = `
        <div class="alert alert-success" style="display: block; margin-bottom: 2rem;">
          <i class="fas fa-user-check"></i>
          Welcome back, <strong>${userName}</strong>${isAdmin ? ' (Admin)' : ''}! Ready to continue your healthy journey?
          ${isAdmin ? '<br><small><i class="fas fa-crown"></i> You have admin privileges</small>' : ''}
        </div>
      `;
      heroSection.insertBefore(welcomeMessage, heroSection.firstChild);
    }
  }
}

// Utility functions
function showAlert(message, type = 'error') {
    const alertId = type === 'error' ? 'errorAlert' : 'successAlert';
    const alertElement = document.getElementById(alertId);
    
    if (alertElement) {
        alertElement.textContent = message;
        alertElement.classList.add('show');
        
        // Hide other alert type
        const otherAlertId = type === 'error' ? 'successAlert' : 'errorAlert';
        const otherAlert = document.getElementById(otherAlertId);
        if (otherAlert) {
            otherAlert.classList.remove('show');
        }
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            alertElement.classList.remove('show');
        }, 5000);
    }
}

function hideAlerts() {
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    
    if (errorAlert) errorAlert.classList.remove('show');
    if (successAlert) successAlert.classList.remove('show');
}

function setLoading(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = isLoading;
        if (isLoading) {
            button.classList.add('loading');
        } else {
            button.classList.remove('loading');
        }
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field && errorElement) {
        field.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (field && errorElement) {
        field.classList.remove('error');
        errorElement.classList.remove('show');
    }
}

function clearAllFieldErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const inputElements = document.querySelectorAll('input.error');
    
    errorElements.forEach(el => el.classList.remove('show'));
    inputElements.forEach(el => el.classList.remove('error'));
}

// API calls
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        throw error;
    }
}

// Login functionality
async function handleLogin(event) {
    event.preventDefault();
    
    hideAlerts();
    clearAllFieldErrors();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    let hasErrors = false;
    
    if (!email) {
        showFieldError('email', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email');
        hasErrors = true;
    }
    
    if (!password) {
        showFieldError('password', 'Password is required');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    setLoading('loginBtn', true);
    
    try {
        const data = await makeRequest(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            showAlert('Login successful! Redirecting to home...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect to home page
            }, 1500);
        }
    } catch (error) {
        showAlert(error.message || 'Login failed. Please try again.');
    } finally {
        setLoading('loginBtn', false);
    }
}

// Register functionality
async function handleRegister(event) {
    event.preventDefault();
    
    hideAlerts();
    clearAllFieldErrors();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Get selected health goals
    const healthGoalsCheckboxes = document.querySelectorAll('input[name="healthGoals"]:checked');
    const healthGoals = Array.from(healthGoalsCheckboxes).map(cb => cb.value);
    
    // Validation
    let hasErrors = false;
    
    if (!name) {
        showFieldError('name', 'Name is required');
        hasErrors = true;
    } else if (name.length < 2) {
        showFieldError('name', 'Name must be at least 2 characters');
        hasErrors = true;
    }
    
    if (!email) {
        showFieldError('email', 'Email is required');
        hasErrors = true;
    } else if (!validateEmail(email)) {
        showFieldError('email', 'Please enter a valid email');
        hasErrors = true;
    }
    
    if (!password) {
        showFieldError('password', 'Password is required');
        hasErrors = true;
    } else if (password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters');
        hasErrors = true;
    }
    
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Please confirm your password');
        hasErrors = true;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    setLoading('registerBtn', true);
    
    try {
        const data = await makeRequest(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify({ name, email, password, healthGoals })
        });
        
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            showAlert('Account created successfully! Welcome to My Healthy Health!', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html'; // Redirect to home page
            }, 1500);
        }
    } catch (error) {
        showAlert(error.message || 'Registration failed. Please try again.');
    } finally {
        setLoading('registerBtn', false);
    }
}

// Initialize forms when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation based on login status
    updateNavigation();
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // Clear errors when user starts typing
        ['email', 'password'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => clearFieldError(fieldId));
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Clear errors when user starts typing
        ['name', 'email', 'password', 'confirmPassword'].forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => clearFieldError(fieldId));
            }
        });
    }
});

// Check if user is already logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    // If on login/register page and user is logged in, redirect to home instead
    if (token && user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        window.location.href = 'index.html'; // Changed from dashboard.html to index.html
    }
}

// Logout function
async function handleLogout() {
  try {
    // You can add API call here later if needed
    // await makeRequest(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove welcome message if it exists
    const welcomeMessage = document.querySelector('.welcome-back-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }
    
    // Update navigation
    updateNavigation();
    
    // Show logout success message
    showAlert('Logged out successfully!', 'success');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, clear local data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavigation();
  }
}

// Toggle user menu dropdown
function toggleUserMenu() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('user-dropdown');
  
  if (dropdown && userMenu && !userMenu.contains(event.target)) {
    dropdown.classList.remove('show');
  }
});

// Call auth check on page load
checkAuthStatus();

// Add to the end of your auth.js file to make functions globally available

// Make functions available globally for onclick handlers
window.toggleUserMenu = toggleUserMenu;
window.handleLogout = handleLogout;

// Add this temporary function at the end of the file (for testing only):

// TEMPORARY: Function to make current user admin (remove in production)
function makeCurrentUserAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
        user.role = 'admin';
        localStorage.setItem('user', JSON.stringify(user));
        updateNavigation();
        alert('You are now an admin! Refresh the page to see admin features.');
    } else {
        alert('Please login first');
    }
}

// Add this to global scope for testing
window.makeCurrentUserAdmin = makeCurrentUserAdmin;