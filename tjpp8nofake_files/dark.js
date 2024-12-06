// function to set a given theme/color-scheme
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.className = themeName;
    document.getElementById("sunimgid");
}

// function to toggle between light and dark theme
function toggleTheme() {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-light');
        document.getElementById("sunimgid").setAttribute("src", "/templates/gamestorgreen/images/sunny.png");
    } else {
        setTheme('theme-dark');
        document.getElementById("sunimgid").setAttribute("src", "/templates/gamestorgreen/images/moon.png");
    }
}

// Immediately invoked function to set the theme on initial load
(function () {
    if (localStorage.getItem('theme') === 'theme-dark') {
        setTheme('theme-dark');
        document.getElementById("sunimgid").setAttribute("src", "/templates/gamestorgreen/images/moon.png");
    } else {
        setTheme('theme-light');
        document.getElementById("sunimgid").setAttribute("src", "/templates/gamestorgreen/images/sunny.png");
    }
})();