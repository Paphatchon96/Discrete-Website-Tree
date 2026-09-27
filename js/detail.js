/* =========================================================
   detail.js — page 3: รายละเอียดการเดินทาง
   Uses groupLegs() from compare.js (already loaded) — the same
   grouping used to price the route — for the itinerary display.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const state = loadState();
  const empty = document.getElementById("empty-state");
  const area = document.getElementById("detail-area");

  if (!state.chosenLegs || !state.chosenLegs.length){
    empty.style.display = "block";
    area.style.display = "none";
    return;
  }
  empty.style.display = "none";
  area.style.display = "block";

  document.getElementById("d-origin").textContent = state.origin;
  document.getElementById("d-dest").textContent = state.destination;
  document.getElementById("d-time").textContent = state.chosenTotalTime;
  document.getElementById("d-fare").textContent = state.chosenTotalFare;

  const groups = groupLegs(state.chosenLegs);
  document.getElementById("steps").innerHTML = groups.map((g, i) => {
    const color = MODE_COLOR[g.mode] || "#888";
    const isLast = i === groups.length - 1;
    const fare = fareForGroup(g.mode, g.stops.length);
    return `
    <div class="itin-step">
      <div class="itin-col">
        <div class="itin-dot" style="background:${color}"></div>
        ${isLast ? "" : `<div class="itin-line"></div>`}
      </div>
      <div style="flex:1;">
        <div class="itin-title">${g.mode} · ${g.from} → ${g.to}</div>
        <div class="itin-sub">${g.stops.length} ช่วงป้าย/สถานี${fare ? ` · ${fare} บาท` : ""}</div>
      </div>
      <div class="itin-time">${Math.round(g.time)} นาที</div>
    </div>`;
  }).join("");

  const stations = [state.origin, ...state.chosenLegs.map(l => l.to)];
  document.getElementById("d-path").innerHTML = stations
    .map((n,i) => `<span class="crumb ${i===stations.length-1?'leaf':''}">${n}</span>`)
    .join('<span class="arrow">→</span>');
});
