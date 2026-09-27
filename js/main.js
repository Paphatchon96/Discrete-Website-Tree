/* Shared state helpers — passes the chosen career/path between the 4 pages */
const STORE_KEY = "itpath_state_v1";

function loadState(){
  try{
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  }catch(e){ return {}; }
}
function saveState(patch){
  const current = loadState();
  const next = Object.assign(current, patch);
  localStorage.setItem(STORE_KEY, JSON.stringify(next));
  return next;
}
