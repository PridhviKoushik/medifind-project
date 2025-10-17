let map = L.map("map").setView([16.5062, 80.6480], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap",
}).addTo(map);

let userLocation = null;

// User location button
document.getElementById('locBtn').addEventListener('click', () => {
  if (!navigator.geolocation) return alert('Geolocation not supported');
  let btn = document.getElementById('locBtn');
  btn.innerText = 'Locating...';
  navigator.geolocation.getCurrentPosition((pos) => {
    userLocation = {lat: pos.coords.latitude, lng: pos.coords.longitude};
    btn.innerHTML = '<i class="fa-solid fa-location-dot"></i> Location Set';
    if (window.userMarker) map.removeLayer(window.userMarker);
    window.userMarker = L.marker([userLocation.lat, userLocation.lng], {icon: L.icon({iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png", iconSize: [36, 36]})}).addTo(map);
    map.setView([userLocation.lat, userLocation.lng], 13);
  }, () => {
    alert('Could not get location');
    btn.innerText = 'My Location';
  });
});

// Haversine distance
function getDistance(lat1, lon1, lat2, lon2){
  function toRad(x){ return x * Math.PI / 180; }
  const R = 6371;
  const dLat = toRad(lat2-lat1);
  const dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
            Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*
            Math.sin(dLon/2)*Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

document.getElementById("searchBtn").addEventListener("click", async () => {
  const medicine = document.getElementById("medicineInput").value.trim();
  const city = document.getElementById("cityInput").value.trim();
  if (!medicine) {
    Swal.fire("Oops!", "Please enter a medicine name!", "warning");
    return;
  }
  const url = city
    ? `http://localhost:5000/api/search?medicine=${encodeURIComponent(medicine)}&location=${encodeURIComponent(city)}`
    : `http://localhost:5000/api/search?medicine=${encodeURIComponent(medicine)}`;
  try {
    const res = await axios.get(url);
    let results = res.data.results || [];
    // Sort by closest if location known
    if (userLocation) {
      results.forEach(r => {
        r._distance = getDistance(userLocation.lat, userLocation.lng, r.lat, r.lng);
      });
      results.sort((a, b) => (a._distance || 999999) - (b._distance || 999999));
    }
    showResults(results, medicine);
  } catch (err) {
    Swal.fire("Error", "Could not fetch results (API down or wrong endpoint)", "error");
  }
});

function showResults(results, medicine) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  if (window.markers) window.markers.forEach(m => map.removeLayer(m));
  window.markers = [];

  if (results.length === 0) {
    resultsDiv.innerHTML = `<div class="bg-pink-100 text-pink-700 p-8 rounded-3xl text-center font-extrabold text-xl shadow-2xl ring-2 ring-pink-400">
        <span class="text-4xl animate-bounce">😔</span>
        <br>No results for "<span class="underline">${medicine}</span>"!
      </div>`;
    return;
  }

  results.forEach((r, idx) => {
    const distance = userLocation && r.lat && r.lng
      ? getDistance(userLocation.lat, userLocation.lng, r.lat, r.lng).toFixed(2)
      : "—";
    const card = document.createElement("div");
    card.className = "card-pharmacy";
    card.innerHTML = `
      <div class="flex items-center gap-4 mb-2">
        <span class="font-extrabold text-violet-700 text-2xl">${r.pharmacyName}</span>
        <span class="badge ${r.inStock ? 'badge-available' : 'badge-out'}">${r.inStock ? "✔ In Stock" : "✖ Out of Stock"}</span>
        <span class="ml-auto text-lg font-bold text-blue-600">${r.city} 🏦</span>
      </div>
      <div class="mb-2">Medicine: <b class="text-pink-500">${r.medicine}</b></div>
      <div>Price: <span class="font-bold text-green-600 text-xl">₹${r.price}</span></div>
      <div>Address: <span class="text-gray-600">${r.address}</span></div>
      <div>Phone: <span class="text-gray-600"><i class="fa-solid fa-phone-volume"></i> ${r.phone}</span></div>
      <div>Distance: <span class="font-bold">${distance} km</span></div>
      <a href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}" target="_blank" class="inline-block mt-2 px-5 py-2 text-white bg-gradient-to-r from-violet-500 via-blue-400 to-pink-400 rounded-lg font-bold shadow-xl hover:bg-pink-600 transition text-lg tracking-wide">
        🚗 Navigate
      </a>
    `;
    resultsDiv.appendChild(card);
    if (r.lat && r.lng) {
      const marker = L.marker([r.lat, r.lng]).addTo(map);
      marker.bindPopup(`
        <b>${r.pharmacyName}</b><br>
        ${r.address}<br>
        <span class='font-bold text-pink-500'>${r.medicine}</span> | ₹${r.price}
        <br><a href='https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}' target='_blank'>Route 🚗</a>
      `);
      window.markers.push(marker);
      if (idx === 0 && !userLocation) map.setView([r.lat, r.lng], 13);
    }
  });
}
