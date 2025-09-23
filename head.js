// head.js

document.addEventListener("DOMContentLoaded", function() {
    const headHTML = `
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erica Wong | UX/UI Designer</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
        <link rel="icon" href="../favicon.png">
        <link rel="stylesheet" href="../grid-columns.css">
        <link rel="stylesheet" href="../default.css">
        <link rel="stylesheet" href="../styles.css">
    `;
    document.head.insertAdjacentHTML("beforeend", headHTML);
});
