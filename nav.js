// nav.js

document.addEventListener("DOMContentLoaded", function() {
    const navHTML = `
    <nav>
        <div class="nav-container">
            <a class="logo" href="../index.html"></a>
        </div>
        <div class="nav-container">
            <ul>
                <li><a class="instagram" href="https://www.instagram.com/littleinkventure/" target="_blank"></a></li>
                <li><a class="email" href="mailto:ericawyw@gmail.com"></a></li>
            </ul>
            <div class="menu-icon">&#9776;</div>
        </div>
    </nav>
    `;
    document.body.insertAdjacentHTML("afterbegin", navHTML);

    // Add event listener for the menu icon
    const menuIcon = document.querySelector('.menu-icon');
    const navUl = document.querySelector('nav ul');

    menuIcon.addEventListener('click', () => {
        navUl.classList.toggle('active');
    });
});
