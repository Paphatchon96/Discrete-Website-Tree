/* =========================================================
   picker.js — reusable Tree station-picker modal
   Walks STATION_TREE from Root to a Leaf (a station).
   ========================================================= */

let pickerTarget = null;     // "origin" | "destination"
let pickerPath = [STATION_TREE];

function pickerIsLeaf(node){ return !node.children || node.children.length === 0; }

function openPicker(target){
  pickerTarget = target;
  pickerPath = [STATION_TREE];
  document.getElementById("picker-overlay").classList.add("open");
  renderPicker();
}
function closePicker(){
  document.getElementById("picker-overlay").classList.remove("open");
}
function pickerGoto(node){
  if (pickerIsLeaf(node)){
    onStationPicked(pickerTarget, node.name);
    closePicker();
    return;
  }
  pickerPath = [...pickerPath, node]; // descend = extend the Path
  renderPicker();
}
function pickerBack(){
  pickerPath = pickerPath.slice(0, -1); // trim Path to parent
  renderPicker();
}
function renderPicker(){
  const node = pickerPath[pickerPath.length - 1];
  document.getElementById("picker-crumbs").textContent =
    pickerPath.map(n => n.name).join(" / ");

  const body = document.getElementById("picker-body");
  let html = "";
  if (pickerPath.length > 1){
    html += `<div class="picker-back" onclick="pickerBack()">‹ ย้อนกลับ</div>`;
  }
  html += node.children.map(child => {
    const leaf = pickerIsLeaf(child);
    const sub = leaf ? "สถานี · Leaf" : "แตะเพื่อดูรายการถัดไป";
    const safe = child.id;
    return `<div class="picker-item" onclick="pickerGoto(STATION_INDEX['${safe}'])">
      <div><div class="pi-name">${child.name}</div><div class="pi-sub">${sub}</div></div>
      <div class="chev">${leaf ? "✓" : "›"}</div>
    </div>`;
  }).join("");
  body.innerHTML = html;
}

/* flat index so inline onclick can look nodes up by id */
const STATION_INDEX = {};
(function indexTree(node){
  STATION_INDEX[node.id] = node;
  (node.children || []).forEach(indexTree);
})(STATION_TREE);
