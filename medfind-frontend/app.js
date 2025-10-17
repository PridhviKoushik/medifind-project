const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const resultsEl = document.getElementById('results');
const detailPanel = document.getElementById('detailPanel');
const mapPreview = document.getElementById('mapPreview');
const locBtn = document.getElementById('locBtn');

let userLocation = null;

// Get user location (if allowed) — optional but great demo feature
locBtn.addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation not supported');
  locBtn.disabled = true; locBtn.innerText = 'Locating...';
  navigator.geolocation.getCurrentPosition((pos) => {
    userLocation = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    locBtn.innerHTML = '<i class="fa-solid fa-location-dot"></i> Location set';
    locBtn.disabled = false;
  }, (err) => {
    alert('Could not get location');
    locBtn.disabled = false;
  });
});

// Search action
searchBtn.addEventListener('click', () => doSearch());
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });

async function doSearch(){
  const q = searchInput.value.trim();
  if (!q) return alert('Type a medicine name');
  resultsEl.innerHTML = '<div class="text-center p-3">Searching...</div>';

  // Replace with your backend endpoint. For demo, use local mock file:
  const backendUrl = `mock/sample_search.json`; 
  try {
    const res = await fetch(backendUrl);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    renderResults(data.results, q, data.userLocation);
  } catch (err) {
    resultsEl.innerHTML = `<div class="text-danger p-3">Failed to fetch results: ${err.message}</div>`;
  }
}

function renderResults(results, q, userLoc){
  resultsEl.innerHTML = '';
  results.forEach(r => {
    const distance = userLoc ? getDistance(userLoc.lat, userLoc.lng, r.lat, r.lng) : null;
    const item = document.createElement('a');
    item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
    item.innerHTML = `
      <div>
        <div class="fw-bold">${r.pharmacy}</div>
        <div class="small text-muted">${q} • ${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}</div>
      </div>
      <div class="text-end">
        <div>${r.price ? '₹' + r.price : '--'}</div>
        <div><span class="badge ${r.availability==='Available' ? 'badge-available' : r.availability==='Out of Stock' ? 'badge-out' : 'badge-unknown'} text-white">${r.availability}</span></div>
        <div class="small text-muted">${distance ? distance.toFixed(1)+' km' : '—'}</div>
      </div>
    `;
    item.addEventListener('click', () => showDetail(r));
    resultsEl.appendChild(item);
  });
}

function showDetail(r){
  detailPanel.innerHTML = `
    <h6>${r.pharmacy}</h6>
    <p class="mb-1">Availability: <strong>${r.availability}</strong></p>
    <p class="mb-1">Price: ${r.price ? '₹' + r.price : 'Not listed'}</p>
    <p class="mb-2"><a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}">Open in Google Maps</a></p>
    <button class="btn btn-sm btn-outline-success" onclick="openReport('${r.pharmacy}','${r.id}')">Report Update</button>
  `;
  // Update map preview via Google Maps embed link
  mapPreview.innerHTML = `<iframe width="100%" height="300" style="border:0" loading="lazy"
    src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_EMBED_API_KEY&q=${r.lat},${r.lng}"></iframe>`;
}

function openReport(pharmacy, id){
  const modal = new bootstrap.Modal(document.getElementById('reportModal'));
  document.getElementById('repPharmacy').value = pharmacy;
  document.getElementById('repMedicine').value = searchInput.value || '';
  modal.show();
}

// Report submission (simulate POST)
document.getElementById('reportForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {
    pharmacy: document.getElementById('repPharmacy').value,
    medicine: document.getElementById('repMedicine').value,
    availability: document.getElementById('repAvailability').value,
    price: document.getElementById('repPrice').value || null
  };
  // For demo, just show toast / alert. Replace with backend POST to /report in product.
  alert('Report submitted — thank you!\n\n' + JSON.stringify(body, null, 2));
  bootstrap.Modal.getInstance(document.getElementById('reportModal')).hide();
});

// Haversine distance (km)
function getDistance(lat1, lon1, lat2, lon2){
  function toRad(x){ return x * Math.PI / 180; }
  const R = 6371;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
/* medfind UI logic (vanilla JS) */


function showPharmacyDetail(ph){
// simple alert for prototype — in real app you'd show a full detail page
const stockList = ph.stock.map(s => `${s.name} — ${s.availability}${s.price? ' — ₹' + s.price : ''}`).join('\n');
alert(`${ph.name}\n${ph.address}\n\nStock:\n${stockList}`);
}


function openReport(phName = '', med = ''){
document.getElementById('reportPharmacy').value = phName;
document.getElementById('reportMedicine').value = med;
document.getElementById('reportModal').classList.remove('hidden');
document.getElementById('reportModal').style.display = 'flex';
}


function closeReport(){
document.getElementById('reportModal').classList.add('hidden');
document.getElementById('reportModal').style.display = 'none';
}


function submitReport(e){
e.preventDefault();
const payload = {
pharmacy: document.getElementById('reportPharmacy').value,
medicine: document.getElementById('reportMedicine').value,
availability: document.getElementById('reportAvailability').value,
ts: new Date().toISOString()
};
console.log('Mock report submitted', payload);
showToast('Report submitted (mock)');
closeReport();
}


function showToast(text){
const t = document.getElementById('toast');
t.textContent = text;
t.classList.remove('hidden');
setTimeout(()=> t.classList.add('hidden'), 2500);
}


function formatAvailability(a){
if(!a) return 'Unknown';
if(a === 'in_stock') return 'In stock';
if(a === 'limited') return 'Limited';
if(a === 'out') return 'Out of stock';
return a;
}


function escapeHtml(s){
if(!s) return '';
return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


// init app
init();