// frontend/assets/js/authGuard.js
// Redirect to login if not logged in (except on login/register)
const publicPages = ['login.html', 'register.html'];
const currPage = window.location.pathname.split('/').pop();
if (!publicPages.includes(currPage)) {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    window.location.href = 'login.html';
  }
}
