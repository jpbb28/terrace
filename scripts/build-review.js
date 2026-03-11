import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const RESULTS_FILE = path.join(ROOT, "scripts", "photo-results.json");
const OUTPUT_FILE = path.join(ROOT, "scripts", "review.html");

const results = JSON.parse(fs.readFileSync(RESULTS_FILE, "utf-8"));

// Load API key
const envFile = fs.readFileSync(path.join(ROOT, ".env.local"), "utf-8");
const API_KEY = envFile
  .split("\n")
  .find((l) => l.startsWith("GOOGLE_PLACES_API_KEY="))
  ?.split("=")[1]
  ?.trim();

// Load lat/lng from terraces.ts
const terraceSrc = fs.readFileSync(path.join(ROOT, "src", "data", "terraces.ts"), "utf-8");
const coordMap = {};
const coordRegex = /id:\s*"(\d+)"[\s\S]*?lat:\s*([\d.-]+),\s*\n\s*lng:\s*([\d.-]+)/g;
let m;
while ((m = coordRegex.exec(terraceSrc)) !== null) {
  coordMap[m[1]] = { lat: m[2], lng: m[3] };
}

function computeHeading(fromLat, fromLng, toLat, toLng) {
  const toRad = d => d * Math.PI / 180;
  const dLng = toRad(toLng - fromLng);
  const lat1 = toRad(fromLat);
  const lat2 = toRad(toLat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

async function fetchHeadings() {
  const HEADINGS_FILE = path.join(ROOT, "scripts", "sv-headings.json");
  let headings = {};
  if (fs.existsSync(HEADINGS_FILE)) {
    headings = JSON.parse(fs.readFileSync(HEADINGS_FILE, "utf-8"));
  }

  const ids = Object.keys(coordMap).filter(id => !(id in headings));
  if (ids.length > 0) {
    console.log(`Fetching Street View headings for ${ids.length} locations...`);
    for (const id of ids) {
      const c = coordMap[id];
      const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${c.lat},${c.lng}&source=outdoor&key=${API_KEY}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "OK" && data.location) {
          headings[id] = computeHeading(data.location.lat, data.location.lng, parseFloat(c.lat), parseFloat(c.lng));
        } else {
          headings[id] = null; // no outdoor coverage
        }
      } catch {
        headings[id] = null;
      }
      await new Promise(r => setTimeout(r, 50));
    }
    fs.writeFileSync(HEADINGS_FILE, JSON.stringify(headings, null, 2));
    console.log("Headings saved.\n");
  }
  return headings;
}

function streetViewUrl(id, headings) {
  const c = coordMap[id];
  if (!c || !API_KEY) return null;
  const heading = headings[id];
  if (heading === null) return null; // no outdoor coverage at this location
  const headingParam = heading !== undefined ? `&heading=${Math.round(heading)}` : "";
  return `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${c.lat},${c.lng}&fov=90&pitch=5&source=outdoor${headingParam}&key=${API_KEY}`;
}

async function main() {
const headings = await fetchHeadings();

const terraceCards = Object.entries(results)
  .map(([id, data]) => {
    const svUrl = streetViewUrl(id, headings);
    const svSlot = svUrl ? `
        <div class="photo-item sv-item" data-terrace="${id}" data-path="__sv__${id}">
          <img src="${svUrl}" alt="Street View"
            onclick="toggleKeep(this)"
            onerror="this.closest('.photo-item').style.display='none'" />
          <div class="photo-controls">
            <label class="keep-label" title="Keep this photo">
              <input type="checkbox" class="keep-cb" data-terrace="${id}" data-path="__sv__${id}" onchange="syncMain(this)" />
              Keep
            </label>
            <label class="main-label" title="Set as main image">
              <input type="radio" class="main-rb" name="main-${id}" data-terrace="${id}" data-path="__sv__${id}" />
              ★ Main
            </label>
          </div>
          <span class="attr sv-badge">📍 Street View</span>
        </div>` : "";

    if (!data.photos.length) {
      return `
      <div class="terrace">
        <div class="terrace-header">
          <h3>[${id}] ${data.name}</h3>
          <div class="bulk-actions">
            <button class="btn-bulk btn-keep-all" onclick="setAllKept('${id}', true)">✓ Keep all</button>
            <button class="btn-bulk btn-discard-all" onclick="setAllKept('${id}', false)">✕ Discard all</button>
          </div>
        </div>
        <div class="photos">
          ${svSlot || '<p class="no-photos">No photos found</p>'}
        </div>
      </div>`;
    }

    const photoItems = data.photos
      .map(
        (photo, i) => `
        <div class="photo-item" data-terrace="${id}" data-path="${photo.path}">
          <img src="../public${photo.path}" alt="Photo ${i}" onclick="toggleKeep(this)" />
          <div class="photo-controls">
            <label class="keep-label" title="Keep this photo">
              <input type="checkbox" class="keep-cb" checked data-terrace="${id}" data-path="${photo.path}" onchange="syncMain(this)" />
              Keep
            </label>
            <label class="main-label" title="Set as main image">
              <input type="radio" class="main-rb" name="main-${id}" data-terrace="${id}" data-path="${photo.path}" ${i === 0 ? "checked" : ""} />
              ★ Main
            </label>
          </div>
          <span class="attr">${photo.authors.join(", ")}</span>
        </div>`
      )
      .join("");

    return `
    <div class="terrace">
      <div class="terrace-header">
        <h3>[${id}] ${data.name}</h3>
        <div class="bulk-actions">
          <button class="btn-bulk btn-keep-all" onclick="setAllKept('${id}', true)">✓ Keep all</button>
          <button class="btn-bulk btn-discard-all" onclick="setAllKept('${id}', false)">✕ Discard all</button>
        </div>
      </div>
      <div class="photos">${photoItems}${svSlot}</div>
    </div>`;
  })
  .join("");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Terrace Photo Review</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #1a1a1a; color: #e0e0e0; padding: 24px 24px 80px; }
  h1 { margin-bottom: 8px; }
  .instructions { color: #999; margin-bottom: 24px; line-height: 1.8; }
  .instructions span { display: inline-block; margin-right: 16px; }
  .terrace { background: #252525; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
  .terrace-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .terrace h3 { font-size: 16px; color: #c45d3e; }
  .bulk-actions { display: flex; gap: 6px; }
  .btn-bulk { border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
  .btn-keep-all { background: #14532d; color: #4ade80; }
  .btn-keep-all:hover { background: #166534; }
  .btn-discard-all { background: #450a0a; color: #f87171; }
  .btn-discard-all:hover { background: #7f1d1d; }
  .no-photos { color: #666; font-style: italic; }
  .photos { display: flex; gap: 12px; flex-wrap: wrap; }

  .photo-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 3px solid #444;
    transition: all 0.15s;
    width: 200px;
  }
  .photo-item.is-main { border-color: #facc15; }
  .photo-item.is-kept:not(.is-main) { border-color: #4ade80; }
  .photo-item.is-discarded { opacity: 0.3; border-color: #444; }
  .sv-item { border-style: dashed; }
  .sv-item.is-kept:not(.is-main) { border-color: #38bdf8; border-style: solid; }
  .sv-item.is-main { border-color: #facc15; border-style: solid; }

  .photo-item img { width: 200px; height: 150px; object-fit: cover; display: block; cursor: pointer; }
  .photo-item img:hover { opacity: 0.85; }

  .photo-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    background: #1a1a1a;
    gap: 8px;
  }
  .keep-label, .main-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    cursor: pointer;
    user-select: none;
  }
  .keep-label { color: #4ade80; }
  .main-label { color: #facc15; }
  .main-label input[type=radio] { accent-color: #facc15; }
  .keep-label input[type=checkbox] { accent-color: #4ade80; }

  .attr { display: block; background: rgba(0,0,0,0.7); color: #888; font-size: 10px; padding: 3px 6px; }
  .sv-badge { color: #38bdf8; }

  .fixed-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #1e1e1e; border-top: 1px solid #333; display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 14px 24px; }
  .progress-label { color: #888; font-size: 13px; margin-right: auto; }
  .progress-label b { color: #e0e0e0; }
  button.btn { border: none; padding: 10px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
  button.btn-save { background: #334155; color: #e0e0e0; }
  button.btn-save:hover { background: #475569; }
  button.btn-load { background: #1d4ed8; color: white; }
  button.btn-load:hover { background: #2563eb; }
  button.btn-export { background: #c45d3e; color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); }
  button.btn-export:hover { background: #a84832; }
  .toast { position: fixed; bottom: 72px; right: 24px; background: #4ade80; color: #1a1a1a; padding: 10px 20px; border-radius: 8px; font-weight: 600; display: none; }
</style>
</head>
<body>
<h1>Terrace Photo Review</h1>
<p class="instructions">
  <span>🖱️ Click image to toggle keep/discard</span>
  <span>★ Select main image (shown first, used as hero)</span>
  <span>🟢 Green = kept &nbsp; 🟡 Yellow = main &nbsp; Dim = discarded</span>
  <span>📍 Dashed border = Street View (fallback)</span>
</p>

${terraceCards}

<div class="fixed-bar">
  <span class="progress-label">Reviewed: <b id="progress-count">0</b> / <b id="progress-total">0</b> terraces</span>
  <button class="btn btn-save" onclick="saveProgress()">💾 Save Progress</button>
  <label class="btn btn-load" style="cursor:pointer">
    📂 Load Progress
    <input type="file" accept=".json" style="display:none" onchange="loadProgress(event)" />
  </label>
  <button class="btn btn-export" onclick="exportSelection()">Export Final</button>
</div>
<div class="toast" id="toast"></div>

<script>
document.querySelectorAll('.photo-item').forEach(item => updateState(item));
updateProgress();

function updateState(item) {
  const cb = item.querySelector('.keep-cb');
  const rb = item.querySelector('.main-rb');
  item.classList.remove('is-kept', 'is-main', 'is-discarded');
  if (rb && rb.checked) {
    item.classList.add('is-main');
  } else if (cb && cb.checked) {
    item.classList.add('is-kept');
  } else {
    item.classList.add('is-discarded');
  }
}

function toggleKeep(img) {
  const item = img.closest('.photo-item');
  const cb = item.querySelector('.keep-cb');
  const rb = item.querySelector('.main-rb');
  cb.checked = !cb.checked;
  if (!cb.checked && rb && rb.checked) {
    rb.checked = false;
    const terrace = item.closest('.terrace');
    const firstKept = Array.from(terrace.querySelectorAll('.photo-item'))
      .find(i => i !== item && i.querySelector('.keep-cb')?.checked);
    if (firstKept) {
      firstKept.querySelector('.main-rb').checked = true;
      updateState(firstKept);
    }
  }
  updateState(item);
  updateProgress();
}

function syncMain(cb) {
  const item = cb.closest('.photo-item');
  const rb = item.querySelector('.main-rb');
  if (!cb.checked && rb && rb.checked) {
    rb.checked = false;
    const terrace = item.closest('.terrace');
    const firstKept = Array.from(terrace.querySelectorAll('.photo-item'))
      .find(i => i !== item && i.querySelector('.keep-cb')?.checked);
    if (firstKept) {
      firstKept.querySelector('.main-rb').checked = true;
      updateState(firstKept);
    }
  }
  updateState(item);
  updateProgress();
}

document.querySelectorAll('.main-rb').forEach(rb => {
  rb.addEventListener('change', () => {
    const item = rb.closest('.photo-item');
    const cb = item.querySelector('.keep-cb');
    if (!cb.checked) cb.checked = true;
    item.closest('.terrace').querySelectorAll('.photo-item').forEach(updateState);
    updateProgress();
  });
});

function setAllKept(terraceId, keep) {
  const terrace = document.querySelector('.terrace:has([data-terrace="' + terraceId + '"])');
  if (!terrace) return;
  const items = Array.from(terrace.querySelectorAll('.photo-item'))
    .filter(i => i.style.display !== 'none'); // skip hidden (failed sv)
  items.forEach((item, i) => {
    const cb = item.querySelector('.keep-cb');
    const rb = item.querySelector('.main-rb');
    if (!cb) return;
    cb.checked = keep;
    if (rb) rb.checked = keep && i === 0;
    updateState(item);
  });
  updateProgress();
}

function updateProgress() {
  const total = document.querySelectorAll('.terrace').length;
  let reviewed = 0;
  document.querySelectorAll('.terrace').forEach(t => {
    if (t.querySelector('.no-photos')) { reviewed++; return; }
    if (t.querySelector('.is-discarded')) reviewed++;
  });
  document.getElementById('progress-count').textContent = reviewed;
  document.getElementById('progress-total').textContent = total;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => toast.style.display = 'none', 2000);
}

function getState() {
  const state = {};
  document.querySelectorAll('.photo-item').forEach(item => {
    const cb = item.querySelector('.keep-cb');
    const rb = item.querySelector('.main-rb');
    if (!cb) return;
    const id = cb.dataset.terrace;
    const p = cb.dataset.path;
    if (!state[id]) state[id] = {};
    state[id][p] = { kept: cb.checked, main: rb ? rb.checked : false };
  });
  return state;
}

function applyState(state) {
  document.querySelectorAll('.photo-item').forEach(item => {
    const cb = item.querySelector('.keep-cb');
    const rb = item.querySelector('.main-rb');
    if (!cb) return;
    const id = cb.dataset.terrace;
    const p = cb.dataset.path;
    const s = state[id]?.[p];
    if (!s) return;
    cb.checked = s.kept;
    if (rb) rb.checked = s.main;
    updateState(item);
  });
  updateProgress();
}

function saveProgress() {
  const state = getState();
  const json = JSON.stringify({ _type: 'progress', state }, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'review-progress.json';
  a.click();
  showToast('Progress saved!');
}

function loadProgress(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data._type === 'progress') {
        applyState(data.state);
        showToast('Progress loaded!');
      } else {
        showToast('Not a progress file');
      }
    } catch {
      showToast('Invalid file');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function exportSelection() {
  const selected = {};
  document.querySelectorAll('.photo-item').forEach(item => {
    const cb = item.querySelector('.keep-cb');
    const rb = item.querySelector('.main-rb');
    if (!cb || !cb.checked) return;
    const id = cb.dataset.terrace;
    const p = cb.dataset.path;
    if (!selected[id]) selected[id] = { main: null, photos: [] };
    if (rb && rb.checked) {
      selected[id].main = p;
      selected[id].photos.unshift(p);
    } else {
      selected[id].photos.push(p);
    }
  });

  const json = JSON.stringify(selected, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'selected-photos.json';
  a.click();
  showToast('Downloaded!');
}
</script>
</body>
</html>`;

fs.writeFileSync(OUTPUT_FILE, html);
console.log(`Review page written to: ${OUTPUT_FILE}`);
console.log("Open it in your browser to review and select photos.");
}

main().catch(console.error);
