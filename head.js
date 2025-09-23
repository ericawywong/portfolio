// head.js

document.addEventListener("DOMContentLoaded", function() {
    const headHTML = `
    <head>

        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Erica Wong | UX/UI Designer — Portfolio</title>
        <meta name="description" content="UX/UI designer in Vancouver, BC. Case studies across product design, newsletters, and illustration. Front-end experience and human-centered design.">

        <style>html.preload body{visibility:hidden}html.ready body{visibility:visible}</style>
  <script>document.documentElement.classList.add('preload');window.addEventListener('load',function(){document.documentElement.classList.remove('preload');document.documentElement.classList.add('ready');});</script>
        
        <link rel="icon" href="../favicon.png">
        <meta property="og:title" content="Erica Wong | UX/UI Designer">
        <meta property="og:description" content="Human-centered UX/UI work with measurable impact.">
        <meta property="og:image" content="og-card-home.jpg">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

        <link rel="stylesheet" href="../default.css">
        <link rel="stylesheet" href="../styles.css">

    </head>
    `;
    document.head.insertAdjacentHTML("beforeend", headHTML);
});
