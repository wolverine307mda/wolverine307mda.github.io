document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme + '-mode');

    themeToggle.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            document.body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('theme', 'dark');
        }
        const newTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        console.log('Theme changed to:', newTheme);
        const themeChangeEvent = new CustomEvent('themeChange', { detail: { theme: newTheme } });
        document.dispatchEvent(themeChangeEvent);
    });
});