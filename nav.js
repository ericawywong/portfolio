// nav.js

document.addEventListener("DOMContentLoaded", function() {
    const navHTML = `
    <nav>
        <div class="nav-container">
            <div class="icon logo"><h2>Erica Wong</h2></div> 
        </div>
        <div class="nav-container">
            <ul>
                <li><a class="icon home" href="../index.html"></a></li>
                <!-- <li><a href="#">Resume</a></li> -->
                <li><a class="icon instagram" href="https://www.instagram.com/littleinkventure/" target="_blank"></a></li>
                <!-- <li><a href="https://www.linkedin.com/in/ericawywong/" target="_blank">LinkedIn</a></li> -->
                <li><a class="icon email" href="mailto:ericawyw@gmail.com"></a></li>
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
