document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.getElementById("footer-container");

  if (!footerContainer) return;

  fetch("/common/footer.html")
    .then(res => res.text())
    .then(data => {
      footerContainer.innerHTML = data;
    });
});