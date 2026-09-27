/* =========================================================
   search.js — page 1: ค้นหาเส้นทาง
   ========================================================= */

function onStationPicked(target, name){
  const field = document.getElementById(target === "origin" ? "origin-value" : "dest-value");
  field.textContent = name;
  field.classList.remove("placeholder");
  saveState({ [target]: name });
  refreshSearchButton();
}

function refreshSearchButton(){
  const s = loadState();
  const btn = document.getElementById("search-btn");
  const ok = s.origin && s.destination && s.origin !== s.destination;
  btn.toggleAttribute("disabled", !ok);
}

function swapStations(){
  const s = loadState();
  if (!s.origin && !s.destination) return;
  const next = saveState({ origin: s.destination || "", destination: s.origin || "" });
  paintFields(next);
  refreshSearchButton();
}

function paintFields(state){
  const o = document.getElementById("origin-value");
  const d = document.getElementById("dest-value");
  if (state.origin){ o.textContent = state.origin; o.classList.remove("placeholder"); }
  if (state.destination){ d.textContent = state.destination; d.classList.remove("placeholder"); }
}

function pickPopular(route){
  saveState({ origin: route.from, destination: route.to });
  window.location.href = "compare.html";
}

function renderPopular(){
  const grid = document.getElementById("popular-grid");
  const thumbs = {
    siam: "linear-gradient(135deg,#274690,#4C7CE8)",
    asok: "linear-gradient(135deg,#1B2A57,#2F6FED)",
    rama9: "linear-gradient(135deg,#C97B27,#F2A65A)",
    sanamluang: "linear-gradient(135deg,#3A3A3A,#6B6B6B)"
  };
  grid.innerHTML = POPULAR_ROUTES.map(r => `
    <div class="route-card" onclick='pickPopular(${JSON.stringify(r)})'>
      <div class="thumb" style="background:${thumbs[r.img]}"></div>
      <div class="rc-body">
        <div class="rc-title">${r.from} → ${r.to}</div>
        <div class="rc-meta">~${r.time} นาที · เริ่มต้น ${r.fare} บาท</div>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderPopular();
  const state = loadState();
  paintFields(state);
  refreshSearchButton();

  document.getElementById("origin-field").addEventListener("click", () => openPicker("origin"));
  document.getElementById("dest-field").addEventListener("click", () => openPicker("destination"));
  document.getElementById("swap-btn").addEventListener("click", swapStations);
  document.getElementById("picker-close").addEventListener("click", closePicker);
  document.getElementById("picker-overlay").addEventListener("click", (e) => {
    if (e.target.id === "picker-overlay") closePicker();
  });

  document.querySelectorAll(".mode-pill").forEach(p => {
    p.addEventListener("click", () => {
      document.querySelectorAll(".mode-pill").forEach(x => x.classList.remove("active"));
      p.classList.add("active");
    });
  });

  document.getElementById("search-btn").addEventListener("click", () => {
    const s = loadState();
    if (!s.origin || !s.destination || s.origin === s.destination) return;
    window.location.href = "compare.html";
  });

  const dateEl = document.getElementById("travel-date");
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString("th-TH", { day:"numeric", month:"long", year:"numeric" });
});
