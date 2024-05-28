
// footer.js
function loadFooter() {
    const footerHTML = `
        <footer>
            <p class="copyright"> © 2024 Erica Wong</p>
        </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }
  
  document.addEventListener('DOMContentLoaded', loadFooter);
  