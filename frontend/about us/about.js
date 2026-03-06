const cards = document.querySelectorAll(".team-card");
const modal = document.getElementById("teamModal");
const modalName = document.getElementById("modalName");
const modalRole = document.getElementById("modalRole");
const modalDesc = document.getElementById("modalDesc");
const closeBtn = document.querySelector(".close-btn");

cards.forEach(card => {
  card.addEventListener("click", () => {
    modalName.innerText = card.dataset.name;
    modalRole.innerText = card.dataset.role;
    modalDesc.innerText = card.dataset.desc;
    modal.style.display = "flex";
  });
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});