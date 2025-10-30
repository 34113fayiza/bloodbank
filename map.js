// Load donors and recipients from localStorage
const donors = JSON.parse(localStorage.getItem("donors") || "[]");
const recipients = JSON.parse(localStorage.getItem("recipients") || "[]");

// Initialize map centered on Karnataka
const map = L.map('karnatakaMap').setView([15.3173, 75.7139], 7);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Custom icons
const redIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/4870/4870741.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
const greyIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64572.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Add donor pins
donors.forEach(d => {
    L.marker(d.latlon, {icon: redIcon}).addTo(map)
     .bindPopup(`${d.name}<br>Blood: ${d.blood}<br>City: ${d.city}`);
});

// Add recipient pins
recipients.forEach(r => {
    L.marker(r.latlon, {icon: greyIcon}).addTo(map)
     .bindPopup(`Recipient Location<br>City: ${r.city}`);
});