document.addEventListener("DOMContentLoaded", function() {
    // Delay to ensure all resources are processed
    setTimeout(function() {
        document.getElementById("loader").style.display = "none";
        document.querySelector(".pagina").style.display = "block";
    }, 1500); // Optional delay to show loader (adjust as needed)
});