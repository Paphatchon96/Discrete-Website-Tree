/* =========================================================
   compare.js — page 2: เลือกเส้นทาง
   Runs Dijkstra's Algorithm on the real station graph with
   different cost functions to explore เร็วที่สุด / ประหยัดที่สุด /
   แนะนำ. Displayed fares always come from the real BTS/MRT
   station-count fare tables via fareForGroup() in data.js —
   never from a raw per-edge number.
   ========================================================= */

function dijkstra(graph, source, costFn){
  const dist = {}, prev = {}, visited = new Set();
  Object.keys(graph).forEach(v => dist[v] = Infinity);
  dist[source] = 0;
  const queue = new Set(Object.keys(graph));

  while (queue.size){
    let u = null, best = Infinity;
    queue.forEach(v => { if (dist[v] < best){ best = dist[v]; u = v; } }); // Step 3
    if (u === null) break;
    queue.delete(u); visited.add(u);

    (graph[u] || []).forEach(edge => {                                    // Step 4
      if (visited.has(edge.to)) return;
      const alt = dist[u] + costFn(edge);
      if (alt < dist[edge.to]){                                            // Step 5: relax
        dist[edge.to] = alt;
        prev[edge.to] = { from: u, edge };
      }
    });
  }
  return { dist, prev };
}

function rebuildLegs(prev, source, target){
  const legs = [];
  let cur = target;
  while (cur !== source){
    const p = prev[cur];
    if (!p) return null;
    legs.unshift({ from: p.from, to: cur, time: p.edge.time, mode: p.edge.mode });
    cur = p.from;
  }
  return legs;
}

/* Group consecutive legs travelling on the same operator/mode into
   one fare-bearing "ขา" — mirrors: edgePath[j].line === lineKey */
function groupLegs(legs){
  const groups = [];
  legs.forEach(leg => {
    const last = groups[groups.length - 1];
    if (last && last.mode === leg.mode){
      last.to = leg.to;
      last.time += leg.time;
      last.stops.push(leg.to);
    } else {
      groups.push({ mode: leg.mode, from: leg.from, to: leg.to, time: leg.time, stops: [leg.to] });
    }
  });
  return groups;
}

function summarize(legs){
  const totalTime = Math.round(legs.reduce((s,l) => s + l.time, 0));
  const groups = groupLegs(legs);
  const totalFare = groups.reduce((s,g) => s + fareForGroup(g.mode, g.stops.length), 0);
  const transfers = groups.filter(g => g.mode === "เปลี่ยนสาย").length;
  return { totalTime, totalFare, transfers };
}

/* Rough per-edge cost used only to steer Dijkstra toward cheaper
   *structures* (fewer/shorter paid segments) — the number shown to
   the person always comes from fareForGroup(), never from this. */
function approxFarePerEdge(mode){
  if (mode === "BTS") return 6;
  if (mode === "MRT") return 3;
  if (mode === "เปลี่ยนสาย") return 0;
  return 3; // bus
}

const MODE_COLOR = {
  "BTS": "#2F9E44",
  "MRT": "#2F6FED",
  "เปลี่ยนสาย": "#7048E8",
  "รถเมล์ สาย 15": "#E8590C"
};

function legsChipsHtml(legs){
  const groups = groupLegs(legs);
  return groups.map(g => `<span class="leg-chip" style="background:${MODE_COLOR[g.mode]||'#888'}">${g.mode} ${g.from}→${g.to}</span>`).join("");
}

function renderResults(origin, destination){
  const timeRun = dijkstra(TRANSIT_GRAPH, origin, e => e.time);
  const fareRun = dijkstra(TRANSIT_GRAPH, origin, e => approxFarePerEdge(e.mode));
  const mixRun  = dijkstra(TRANSIT_GRAPH, origin, e => e.time * 1 + approxFarePerEdge(e.mode) * 0.6);

  const fastest = { key:"fastest", label:"เร็วที่สุด", tagClass:"fast", legs: rebuildLegs(timeRun.prev, origin, destination) };
  const cheapest = { key:"cheapest", label:"ประหยัดที่สุด", tagClass:"cheap", legs: rebuildLegs(fareRun.prev, origin, destination) };
  const recommended = { key:"recommended", label:"แนะนำ", tagClass:"reco", legs: rebuildLegs(mixRun.prev, origin, destination) };

  const options = [fastest, cheapest, recommended].filter(o => o.legs && o.legs.length);
  const wrap = document.getElementById("results-wrap");

  if (!options.length){
    wrap.innerHTML = `<div class="empty-hint">ไม่พบเส้นทางเชื่อมระหว่าง ${origin} และ ${destination} ในระบบจำลองนี้</div>`;
    return;
  }

  wrap.innerHTML = options.map((o) => {
    const s = summarize(o.legs);
    return `
    <div class="route-result ${o.key==='recommended' ? 'recommended' : ''}" data-key="${o.key}" onclick="selectRoute('${o.key}')">
      <div class="rr-top">
        <span class="rr-tag ${o.tagClass}">${o.label}</span>
        <span style="font-size:.78rem;color:var(--muted);">${s.transfers} จุดเปลี่ยนระบบ</span>
      </div>
      <div class="rr-stats">
        <div class="rr-stat"><div class="n">${s.totalTime} นาที</div><div class="l">เวลารวม</div></div>
        <div class="rr-stat"><div class="n">${s.totalFare} บาท</div><div class="l">ค่าโดยสารรวม</div></div>
      </div>
      <div class="rr-legs">${legsChipsHtml(o.legs)}</div>
    </div>`;
  }).join("");

  window._routeOptions = {};
  options.forEach(o => window._routeOptions[o.key] = o);

  selectRoute(options.find(o=>o.key==="recommended") ? "recommended" : options[0].key);
}

function selectRoute(key){
  document.querySelectorAll(".route-result").forEach(el => el.classList.toggle("recommended", el.dataset.key === key));
  const o = window._routeOptions[key];
  const s = summarize(o.legs);
  saveState({
    chosenRouteKey: key,
    chosenLegs: o.legs,
    chosenTotalTime: s.totalTime,
    chosenTotalFare: s.totalFare,
    chosenTransfers: s.transfers
  });
  document.getElementById("continue-btn").removeAttribute("disabled");
}

document.addEventListener("DOMContentLoaded", () => {
  const state = loadState();
  if (!state.origin || !state.destination){
    document.getElementById("no-search").style.display = "block";
    document.getElementById("results-area").style.display = "none";
    return;
  }
  document.getElementById("route-origin").textContent = state.origin;
  document.getElementById("route-dest").textContent = state.destination;
  renderResults(state.origin, state.destination);
});
