/* =========================================================
   tree-view.js — "ต้นไม้เส้นทาง"
   Shows the Root -> ประเภท -> สาย diagram, then traces the
   real Root -> Leaf Path for the trip's origin AND destination
   (the same origin/destination already chosen on page 1, and
   already turned into an itinerary on page 3). This page answers
   "how did the Tree pick these two stations" for that exact trip,
   instead of listing every station in the whole network.
   ========================================================= */

const LINE_COLOR = {
  sukhumvit: "#2F9E44",
  silom: "#0B7285",
  blue: "#2F6FED",
  line15: "#E8590C"
};

function isLeaf(node){ return !node.children || node.children.length === 0; }

function countLeaves(node){
  if (isLeaf(node)) return 1;
  return node.children.reduce((s,c) => s + countLeaves(c), 0);
}

/* Root -> ... -> node whose id matches, by walking children[] */
function findPathById(id, node, trail){
  const next = [...trail, node];
  if (node.id === id) return next;
  for (const child of (node.children || [])){
    const found = findPathById(id, child, next);
    if (found) return found;
  }
  return null;
}

/* Root -> ... -> the Leaf whose station name matches */
function findPathByName(name, node, trail){
  const next = [...trail, node];
  if (isLeaf(node) && node.name === name) return next;
  for (const child of (node.children || [])){
    const found = findPathByName(name, child, next);
    if (found) return found;
  }
  return null;
}

/* ---- SVG diagram: Root -> 2 categories -> 4 lines ---- */
function renderDiagram(highlightLineIds){
  const svgNS = "http://www.w3.org/2000/svg";
  const width = 860, height = 260;
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "260");

  const root = STATION_TREE;
  const categories = root.children;
  const allLines = categories.flatMap(c => c.children);

  const margin = 110;
  const step = allLines.length > 1 ? (width - margin*2) / (allLines.length - 1) : 0;
  const linePos = {};
  allLines.forEach((l,i) => { linePos[l.id] = { x: margin + i*step, y: 210 }; });

  const catPos = {};
  categories.forEach(c => {
    const xs = c.children.map(l => linePos[l.id].x);
    catPos[c.id] = { x: xs.reduce((a,b)=>a+b,0) / xs.length, y: 115 };
  });

  const catXs = categories.map(c => catPos[c.id].x);
  const rootPos = { x: catXs.reduce((a,b)=>a+b,0) / catXs.length, y: 30 };

  function edge(a,b,color,strong){
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", a.x); line.setAttribute("y1", a.y+14);
    line.setAttribute("x2", b.x); line.setAttribute("y2", b.y-16);
    line.setAttribute("stroke", color || (strong ? "#2F6FED" : "#D5DDEE"));
    line.setAttribute("stroke-width", strong ? "3" : "2");
    svg.appendChild(line);
  }
  function node(pos, label, sub, fill, textColor, ring){
    const w = Math.max(70, label.length*7.2 + 24);
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", pos.x - w/2); rect.setAttribute("y", pos.y - 16);
    rect.setAttribute("width", w); rect.setAttribute("height", 32);
    rect.setAttribute("rx", 10);
    rect.setAttribute("fill", fill);
    if (ring){
      rect.setAttribute("stroke", "#2F6FED");
      rect.setAttribute("stroke-width", "2.5");
    }
    svg.appendChild(rect);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", pos.x); text.setAttribute("y", pos.y + 4);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "11.5");
    text.setAttribute("font-weight", "600");
    text.setAttribute("fill", textColor || "#101828");
    text.textContent = label;
    svg.appendChild(text);

    if (sub){
      const subtext = document.createElementNS(svgNS, "text");
      subtext.setAttribute("x", pos.x); subtext.setAttribute("y", pos.y - 22);
      subtext.setAttribute("text-anchor", "middle");
      subtext.setAttribute("font-size", "9.5");
      subtext.setAttribute("fill", "#98A2B3");
      subtext.textContent = sub;
      svg.appendChild(subtext);
    }
  }

  categories.forEach(c => edge(rootPos, catPos[c.id]));
  categories.forEach(c => c.children.forEach(l =>
    edge(catPos[c.id], linePos[l.id], LINE_COLOR[l.id], highlightLineIds.has(l.id))
  ));

  node(rootPos, root.name, "Root · Level 0", "#16305F", "#fff");
  categories.forEach(c => node(catPos[c.id], c.name, "Level 1", "#EDF2FB", null, false));
  categories.forEach(c => c.children.forEach(l =>
    node(linePos[l.id], l.name, `Level 2 · ${countLeaves(l)} สถานี`, LINE_COLOR[l.id] + (highlightLineIds.has(l.id) ? "33" : "18"), LINE_COLOR[l.id], highlightLineIds.has(l.id))
  ));

  const wrap = document.getElementById("tree-svg-wrap");
  wrap.innerHTML = "";
  wrap.appendChild(svg);
}

function renderPathCard(elId, dotClass, label, path){
  const el = document.getElementById(elId);
  const line = path[path.length - 2]; // the "สาย" node just above the leaf
  el.querySelector(".pc-line-dot").style.background = LINE_COLOR[line.id] || "#888";
  el.querySelector(".pc-line-name").textContent = line.name;
  el.querySelector(".path-trail").innerHTML = path
    .map((n,i) => `<span class="crumb ${i===path.length-1?'leaf':''}">${n.name} <span style="opacity:.5">(L${i})</span></span>`)
    .join('<span class="arrow">→</span>');
}

document.addEventListener("DOMContentLoaded", () => {
  const state = loadState();
  const totalLeaves = countLeaves(STATION_TREE);
  document.getElementById("stat-leaves").textContent = totalLeaves;
  document.getElementById("stat-lines").textContent = STATION_TREE.children.flatMap(c=>c.children).length;
  document.getElementById("stat-depth").textContent = "3";

  const hasTrip = state.origin && state.destination;
  document.getElementById("no-trip-hint").style.display = hasTrip ? "none" : "block";
  document.getElementById("trip-paths").style.display = hasTrip ? "block" : "none";

  if (hasTrip){
    const originPath = findPathByName(state.origin, STATION_TREE, []);
    const destPath = findPathByName(state.destination, STATION_TREE, []);
    document.getElementById("trip-label").textContent = `${state.origin} → ${state.destination}`;

    const highlight = new Set();
    if (originPath) highlight.add(originPath[2].id); // the "สาย" node
    if (destPath) highlight.add(destPath[2].id);
    renderDiagram(highlight);

    if (originPath) renderPathCard("origin-path-card", "origin", "ต้นทาง", originPath);
    if (destPath) renderPathCard("dest-path-card", "dest", "ปลายทาง", destPath);
  } else {
    renderDiagram(new Set());
  }
});
