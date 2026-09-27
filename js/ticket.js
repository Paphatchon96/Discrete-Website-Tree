/* =========================================================
   ticket.js — page 4: ตั๋วเดินทาง (e-Ticket)
   Fare rows are real fare-table lookups per operator segment,
   cross-checked with .reduce() against the total from page 2.
   ========================================================= */

function ticketCode(state){
  const seed = `${state.origin}-${state.destination}-${state.chosenTotalFare}`;
  let h = 0;
  for (let i=0;i<seed.length;i++){ h = (h*31 + seed.charCodeAt(i)) >>> 0; }
  return "TRIP-" + (h % 900000 + 100000);
}

document.addEventListener("DOMContentLoaded", () => {
  const state = loadState();
  const empty = document.getElementById("empty-state");
  const area = document.getElementById("ticket-area");

  if (!state.chosenLegs || !state.chosenLegs.length){
    empty.style.display = "block";
    area.style.display = "none";
    return;
  }
  empty.style.display = "none";
  area.style.display = "block";

  document.getElementById("t-origin").textContent = state.origin;
  document.getElementById("t-dest").textContent = state.destination;
  document.getElementById("t-code").textContent = ticketCode(state);
  document.getElementById("t-date").textContent = new Date().toLocaleDateString("th-TH", { day:"numeric", month:"long", year:"numeric" });

  const groups = groupLegs(state.chosenLegs);
  document.getElementById("fare-body").innerHTML = groups.map((g,i) => {
    const fare = fareForGroup(g.mode, g.stops.length);
    return `<tr><td>${i+1}</td><td>${g.mode}: ${g.from} → ${g.to}</td><td>${Math.round(g.time)} นาที</td><td>${fare} บาท</td></tr>`;
  }).join("");

  const verifiedTotal = groups.reduce((sum, g) => sum + fareForGroup(g.mode, g.stops.length), 0); // .reduce() cross-check
  document.getElementById("t-total").textContent = verifiedTotal;
  document.getElementById("t-time").textContent = state.chosenTotalTime;
  document.getElementById("verify-note").textContent =
    verifiedTotal === state.chosenTotalFare
      ? `ยืนยันแล้ว: ยอดรวมตรงกับผลลัพธ์จากหน้าเลือกเส้นทาง`
      : `พบความคลาดเคลื่อนของยอดรวม`;
});

function restartAll(){
  localStorage.removeItem(STORE_KEY);
  window.location.href = "index.html";
}
