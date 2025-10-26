/* script.js - BloodConnect Karnataka
   Full file: dropdowns (district->city), donor/recipient forms, Karnataka-only map (masked), modal edit, donors red pins, recipients grey pins, proximity color-coding for donors based on last search.
*/

/* ---------- Local Storage Keys ---------- */
const LS_DONORS = 'bc_donors';
const LS_RECIPIENTS = 'bc_recipients';
const LS_LASTSEARCH = 'bc_lastsearch';

/* ---------- Local storage helpers ---------- */
function loadDonors(){ return JSON.parse(localStorage.getItem(LS_DONORS) || '[]'); }
function saveDonors(arr){ localStorage.setItem(LS_DONORS, JSON.stringify(arr)); }
function loadRecipients(){ return JSON.parse(localStorage.getItem(LS_RECIPIENTS) || '[]'); }
function saveRecipients(arr){ localStorage.setItem(LS_RECIPIENTS, JSON.stringify(arr)); }
function saveLastSearch(obj){ localStorage.setItem(LS_LASTSEARCH, JSON.stringify(obj)); }
function loadLastSearch(){ return JSON.parse(localStorage.getItem(LS_LASTSEARCH) || 'null'); }

/* ---------- Karnataka data: districts + city/locality list ---------- */
const karnatakaData = {
  districts: [
    "Bengaluru Urban","Mysuru","Dakshina Kannada","Udupi","Belagavi","Ballari",
    "Hassan","Shimoga","Davanagere","Dharwad","Kalaburagi","Raichur",
    "Chitradurga","Chikkamagaluru","Kolar","Tumkur","Vijayapura","Bidar",
    "Ramanagara","Kodagu","Chamarajanagar","Yadgir","Haveri","Bagalkot",
    "Gadag","Uttara Kannada","Mandya","Koppal","Chikkaballapura"
  ],
  cities: {
    "Bengaluru": { lat:12.9716, lng:77.5946, district:"Bengaluru Urban" },
    "Bangalore": { lat:12.9716, lng:77.5946, district:"Bengaluru Urban" },
    "Koramangala": { lat:12.9352, lng:77.6245, district:"Bengaluru Urban" },
    "Whitefield": { lat:12.9699, lng:77.7495, district:"Bengaluru Urban" },
    "Mysore": { lat:12.2958, lng:76.6394, district:"Mysuru" },
    "Mangalore": { lat:12.9141, lng:74.8560, district:"Dakshina Kannada" },
    "Kadri": { lat:12.9131, lng:74.8555, district:"Dakshina Kannada" },
    "Deralakatte": { lat:12.8626, lng:74.8569, district:"Dakshina Kannada" },
    "Udupi": { lat:13.3409, lng:74.7421, district:"Udupi" },
    "Belagavi": { lat:15.8497, lng:74.4977, district:"Belagavi" },
    "Belgaum": { lat:15.8497, lng:74.4977, district:"Belagavi" },
    "Ballari": { lat:15.1394, lng:76.9214, district:"Ballari" },
    "Hassan": { lat:13.0072, lng:76.1020, district:"Hassan" },
    "Shimoga": { lat:13.9299, lng:75.5681, district:"Shimoga" },
    "Davanagere": { lat:14.4646, lng:75.9212, district:"Davanagere" },
    "Hubli": { lat:15.3647, lng:75.1240, district:"Dharwad" },
    "Hubballi": { lat:15.3647, lng:75.1240, district:"Dharwad" },
    "Dharwad": { lat:15.4589, lng:75.0078, district:"Dharwad" },
    "Kalaburagi": { lat:17.3297, lng:76.8343, district:"Kalaburagi" },
    "Raichur": { lat:16.2040, lng:77.3600, district:"Raichur" },
    "Chitradurga": { lat:14.2336, lng:76.4027, district:"Chitradurga" },
    "Chikmagalur": { lat:13.3189, lng:75.7740, district:"Chikkamagaluru" },
    "Kolar": { lat:13.1360, lng:78.1294, district:"Kolar" },
    "Tumkur": { lat:13.3409, lng:77.1019, district:"Tumkur" },
    "Vijayapura": { lat:16.8300, lng:75.7100, district:"Vijayapura" },
    "Bidar": { lat:17.9133, lng:77.5290, district:"Bidar" },
    "Ramanagara": { lat:12.7283, lng:77.2810, district:"Ramanagara" },
    "Madikeri": { lat:12.4244, lng:75.7382, district:"Kodagu" },
    "Chamarajanagar": { lat:11.9123, lng:76.9145, district:"Chamarajanagar" },
    "Yadgir": { lat:16.7625, lng:76.9194, district:"Yadgir" },
    "Haveri": { lat:14.7974, lng:75.4040, district:"Haveri" },
    "Bagalkot": { lat:16.1778, lng:75.7007, district:"Bagalkot" },
    "Gadag": { lat:15.4293, lng:75.6356, district:"Gadag" },
    "Karwar": { lat:14.8039, lng:74.1260, district:"Uttara Kannada" },
    "Mandya": { lat:12.5234, lng:76.8951, district:"Mandya" },
    "Koppal": { lat:15.3456, lng:76.1544, district:"Koppal" },
    "Chikkaballapur": { lat:13.4356, lng:77.7305, district:"Chikkaballapura" }
  }
};
/* expose data for map modal */
window.karnatakaData = karnatakaData;

/* ---------- helpers ---------- */
function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;"); }
function canonicalCityFromList(input){ if(!input) return null; const t = input.trim(); const keys = Object.keys(karnatakaData.cities); for(const k of keys) if(k.toLowerCase()===t.toLowerCase()) return k; return null; }

/* ---------- Populate district & city selects ---------- */
function populateDistricts() {
  const donorDistrict = document.getElementById('donorDistrict');
  const reqDistrict = document.getElementById('reqDistrict');
  const html = '<option value="">Select district</option>' + karnatakaData.districts.map(d => `<option>${d}</option>`).join('');
  if(donorDistrict) donorDistrict.innerHTML = html;
  if(reqDistrict) reqDistrict.innerHTML = html;
}
function populateCitiesForDistrict(district, targetSelectId){
  const sel = document.getElementById(targetSelectId);
  if(!sel) return;
  sel.innerHTML = '<option value="">Select city/locality</option>';
  Object.keys(karnatakaData.cities).sort().forEach(city => {
    if(karnatakaData.cities[city].district === district){
      sel.innerHTML += `<option>${city}</option>`;
    }
  });
}
document.addEventListener('DOMContentLoaded', function(){
  populateDistricts();
  const donorDistrict = document.getElementById('donorDistrict');
  const reqDistrict = document.getElementById('reqDistrict');
  if(donorDistrict) donorDistrict.addEventListener('change', function(){ populateCitiesForDistrict(this.value, 'donorCity'); });
  if(reqDistrict) reqDistrict.addEventListener('change', function(){ populateCitiesForDistrict(this.value, 'reqCity'); });

  // if modal select exists, populate it too (map page will also populate)
  const editDistrict = document.getElementById('editDonorDistrict');
  if(editDistrict) editDistrict.innerHTML = '<option value="">Select district</option>' + karnatakaData.districts.map(d => `<option>${d}</option>`).join('');
});

/* ---------- Donor form submit ---------- */
const donorForm = document.getElementById('donorForm');
if(donorForm){
  donorForm.addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('donorName').value.trim();
    const blood = (document.getElementById('donorBlood').value || '').trim().toUpperCase();
    const city = (document.getElementById('donorCity').value || '').trim();
    const district = (document.getElementById('donorDistrict').value || '').trim();
    const state = (document.getElementById('donorState') ? document.getElementById('donorState').value : 'Karnataka') || 'Karnataka';

    if(!name || !blood || !city || !district){ alert('Please fill name, blood group, district and city.'); return; }
    const canon = canonicalCityFromList(city);
    if(!canon){ alert('City not in list. Choose a city from the dropdown.'); return; }
    const coords = karnatakaData.cities[canon];
    const donors = loadDonors();
    const id = 'd_' + Date.now();
    donors.push({ id, name, blood, city: canon, district, state, lat: coords.lat, lng: coords.lng, createdAt: Date.now() });
    saveDonors(donors);

    const msg = document.getElementById('donorMsg');
    if(msg){ msg.innerText = 'Donor added successfully.'; msg.style.color = '#2e7d32'; }
    donorForm.reset();
    populateDistricts();
    localStorage.setItem('bc_update','donor_'+Date.now());
    if(typeof renderHomeBloodStatsIfPresent === 'function') renderHomeBloodStatsIfPresent();
  });
}

/* ---------- Recipient form submit ---------- */
const requestForm = document.getElementById('requestForm');
if(requestForm){
  requestForm.addEventListener('submit', function(e){
    e.preventDefault();
    const blood = (document.getElementById('reqBlood').value || '').trim().toUpperCase();
    const city = (document.getElementById('reqCity').value || '').trim();
    const district = (document.getElementById('reqDistrict').value || '').trim();
    const state = (document.getElementById('reqState') ? document.getElementById('reqState').value : 'Karnataka') || 'Karnataka';

    if(!blood || !city || !district){ alert('Please select blood group, district and city.'); return; }
    const canon = canonicalCityFromList(city);
    if(!canon){ alert('City not in list. Choose a city from the dropdown.'); return; }

    const recipients = loadRecipients();
    const id = 'r_' + Date.now();
    const note = `Requested for ${blood}`;
    recipients.push({ id, note, blood, city: canon, district, state, lat: karnatakaData.cities[canon].lat, lng: karnatakaData.cities[canon].lng, createdAt: Date.now() });
    saveRecipients(recipients);
    saveLastSearch({ blood, city: canon, district, state, ts: Date.now() });

    // search donors and compose message
    const donors = loadDonors();
    let foundInCity = false;
    const inDistrictCities = [];
    donors.forEach(d => {
      if(d.blood === blood && d.state === state){
        if(d.city === canon) foundInCity = true;
        else if(d.district === district && !inDistrictCities.includes(d.city)) inDistrictCities.push(d.city);
      }
    });

    const msg = document.getElementById('requestMsg');
    if(msg){
      if(foundInCity){
        msg.innerText = `Blood available in ${canon}! Contact the donor(s).`;
        msg.style.color = '#2e7d32';
      } else if(inDistrictCities.length > 0){
        msg.innerText = `Blood not available in ${canon}, but available near ${canon} in these ${district} cities: ${inDistrictCities.join(', ')}.`;
        msg.style.color = '#ff9800';
      } else {
        const otherCities = [];
        donors.forEach(d => { if(d.blood === blood && d.state === state && d.city !== canon && !otherCities.includes(d.city)) otherCities.push(d.city); });
        if(otherCities.length > 0){
          msg.innerText = `Blood not available in ${canon} or ${district}, but available in other Karnataka cities: ${otherCities.join(', ')}.`;
          msg.style.color = '#ff9800';
        } else {
          msg.innerText = `No donor found for ${blood} in Karnataka.`;
          msg.style.color = '#d32f2f';
        }
      }
    } else {
      if(foundInCity) alert(`Blood available in ${canon}!`);
      else if(inDistrictCities.length > 0) alert(`Available near ${canon} in: ${inDistrictCities.join(', ')}`);
      else alert(`No donor found for ${blood} in Karnataka.`);
    }

    requestForm.reset();
    localStorage.setItem('bc_update','recipient_'+Date.now());
    if(typeof renderHomeBloodStatsIfPresent === 'function') renderHomeBloodStatsIfPresent();
  });
}

/* ---------- MAP & TABLE (Karnataka-only masked map) ---------- */
if(document.getElementById('map')){
  const karnatakaPoly = [
    [15.8,74.1],[15.0,74.2],[13.4,74.5],[12.0,75.0],[11.7,75.8],[12.2,76.8],[13.3,77.6],
    [14.8,77.9],[15.8,78.3],[16.8,77.9],[17.4,77.2],[17.6,76.0],[16.6,75.2],[15.8,74.1]
  ];
  const karnatakaBounds = L.latLngBounds(karnatakaPoly);

  const map = L.map('map', { minZoom:6, maxZoom:12, zoomControl:true, attributionControl:true }).fitBounds(karnatakaBounds.pad(0.05));

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap, © CartoDB', maxZoom:12, minZoom:6
  }).addTo(map);

  // Mask outside Karnataka and draw border
  const outer = [[90,-180],[90,180],[-90,180],[-90,-180]];
  L.polygon([outer, karnatakaPoly], { color:'#000', weight:0, fillColor:'#000', fillOpacity:0.55, interactive:false }).addTo(map);
  L.polygon(karnatakaPoly, { color:'#c62828', weight:2, fill:false }).addTo(map);

  let markers = [];
  let currentFilter = '';

  function clearMarkers(){ markers.forEach(m=>map.removeLayer(m)); markers = []; }

  function getDonorColorByProximity(donor, lastSearch){
    if(!lastSearch) return '#d32f2f'; // default red if no last search
    if(donor.city === lastSearch.city) return '#2e7d32'; // same city = green
    if(donor.district === lastSearch.district) return '#ff9800'; // same district = orange
    return '#d32f2f'; // other donors = red
  }

  function renderMapAndTable(){
    clearMarkers();
    const donors = loadDonors();
    const recipients = loadRecipients();
    const lastSearch = loadLastSearch();

    const passesFilter = (item) => { if(!currentFilter) return true; return (item.blood||'').toUpperCase() === currentFilter.toUpperCase(); };

    donors.forEach(d => {
      if(!passesFilter(d)) return;
      const color = getDonorColorByProximity(d, lastSearch);
      if(d.lat && d.lng){
        const m = L.circleMarker([d.lat,d.lng], { radius:7, fillColor:color, color:'#000', weight:1, opacity:1, fillOpacity:0.95 }).addTo(map);
        m.bindPopup(`<b>Donor: ${escapeHtml(d.name)}</b><br>Blood: ${escapeHtml(d.blood)}<br>City: ${escapeHtml(d.city)}<br>District: ${escapeHtml(d.district)}`);
        markers.push(m);
      }
    });

    recipients.forEach(r => {
      if(!passesFilter(r)) return;
      const color = '#9e9e9e';
      if(r.lat && r.lng){
        const m = L.circleMarker([r.lat,r.lng], { radius:8, fillColor:color, color:'#000', weight:1, opacity:1, fillOpacity:0.95 }).addTo(map);
        m.bindPopup(`<b>Recipient</b><br>${escapeHtml(r.note)}<br>City: ${escapeHtml(r.city)}<br>District: ${escapeHtml(r.district)}`);
        markers.push(m);
      }
    });

    if(markers.length){
      const group = L.featureGroup(markers);
      try{
        const padded = group.getBounds().pad(0.15);
        if(karnatakaBounds.contains(padded)) map.fitBounds(padded);
        else map.fitBounds(karnatakaBounds.pad(0.03));
      }catch(err){ map.fitBounds(karnatakaBounds.pad(0.03)); }
    } else {
      map.fitBounds(karnatakaBounds.pad(0.03));
    }

    renderDataTable();
  }

  function renderDataTable(){
    const donors = loadDonors();
    const recipients = loadRecipients();
    const tbody = document.querySelector('#dataTable tbody');
    if(!tbody) return;
    tbody.innerHTML = '';

    donors.forEach(d => {
      if(currentFilter && (d.blood||'').toUpperCase() !== currentFilter.toUpperCase()) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml('Donor')}</td>
        <td>${escapeHtml(d.name||'')}</td>
        <td>${escapeHtml(d.blood||'')}</td>
        <td>${escapeHtml(d.city||'')}</td>
        <td>${escapeHtml(d.district||'')}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${d.id}" data-type="donor">Edit</button>
          <button class="action-btn del-btn" data-id="${d.id}" data-type="donor">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    recipients.forEach(r => {
      if(currentFilter && (r.blood||'').toUpperCase() !== currentFilter.toUpperCase()) return;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml('Recipient')}</td>
        <td>${escapeHtml(r.note||'')}</td>
        <td>${escapeHtml(r.blood||'')}</td>
        <td>${escapeHtml(r.city||'')}</td>
        <td>${escapeHtml(r.district||'')}</td>
        <td>
          <button class="action-btn del-btn" data-id="${r.id}" data-type="recipient">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.del-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');
        if(confirm('Are you sure to delete this entry?')) deleteEntry(id,type);
      };
    });
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      };
    });
  }

  function deleteEntry(id,type){
    if(type==='donor'){
      let arr = loadDonors();
      arr = arr.filter(x=>x.id!==id);
      saveDonors(arr);
    } else {
      let arr = loadRecipients();
      arr = arr.filter(x=>x.id!==id);
      saveRecipients(arr);
    }
    localStorage.setItem('bc_update','del_'+Date.now());
    renderHomeBloodStatsIfPresent();
    renderMapAndTable();
  }

  /* ---------- Modal Edit flow ---------- */
  const modalBackdrop = document.getElementById('modalBackdrop');
  const editForm = document.getElementById('editDonorForm');

  function openEditModal(donorId){
    const donors = loadDonors();
    const d = donors.find(x=>x.id===donorId);
    if(!d) { alert('Donor not found'); return; }
    document.getElementById('editDonorId').value = d.id;
    document.getElementById('editDonorName').value = d.name || '';
    document.getElementById('editDonorBlood').value = d.blood || '';
    const ed = document.getElementById('editDonorDistrict');
    const ec = document.getElementById('editDonorCity');
    if(ed){
      ed.value = d.district || '';
      ec.innerHTML = '<option value="">Select city/locality</option>';
      Object.keys(karnatakaData.cities).sort().forEach(city => {
        if(karnatakaData.cities[city].district === ed.value){
          ec.innerHTML += `<option>${city}</option>`;
        }
      });
      ec.value = d.city || '';
    }
    if(modalBackdrop) modalBackdrop.style.display = 'flex';
  }

  if(editForm){
    editForm.addEventListener('submit', function(e){
      e.preventDefault();
      const id = document.getElementById('editDonorId').value;
      const name = document.getElementById('editDonorName').value.trim();
      const blood = (document.getElementById('editDonorBlood').value || '').trim().toUpperCase();
      const district = (document.getElementById('editDonorDistrict').value || '').trim();
      const city = (document.getElementById('editDonorCity').value || '').trim();

      if(!id || !name || !blood || !district || !city){ alert('Please complete all fields'); return; }
      const canon = canonicalCityFromList(city);
      if(!canon){ alert('City not recognized in Karnataka list'); return; }

      const donors = loadDonors();
      const idx = donors.findIndex(x => x.id === id);
      if(idx === -1){ alert('Donor not found'); modalBackdrop.style.display = 'none'; return; }
      donors[idx].name = name;
      donors[idx].blood = blood;
      donors[idx].district = district;
      donors[idx].city = canon;
      donors[idx].lat = karnatakaData.cities[canon].lat;
      donors[idx].lng = karnatakaData.cities[canon].lng;
      saveDonors(donors);
      localStorage.setItem('bc_update','edit_'+Date.now());
      if(modalBackdrop) modalBackdrop.style.display = 'none';
      renderHomeBloodStatsIfPresent();
      renderMapAndTable();
    });
  }

  document.getElementById('cancelEdit')?.addEventListener('click', function(){ if(modalBackdrop) modalBackdrop.style.display='none'; });

  // filter UI
  const filterSelect = document.getElementById('filterBlood');
  const applyBtn = document.getElementById('applyFilter');
  const clearBtn = document.getElementById('clearFilter');
  if(applyBtn) applyBtn.addEventListener('click', ()=>{ currentFilter = (filterSelect.value||'').trim(); renderMapAndTable(); });
  if(clearBtn) clearBtn.addEventListener('click', ()=>{ filterSelect.value=''; currentFilter=''; renderMapAndTable(); });

  window.bcRenderMapAndTable = renderMapAndTable;
  renderMapAndTable();

  window.addEventListener('storage', function(e){
    if(e.key===LS_DONORS || e.key===LS_RECIPIENTS || e.key===LS_LASTSEARCH || e.key==='bc_update'){
      renderHomeBloodStatsIfPresent();
      renderMapAndTable();
    }
  });
}

/* ---------- HOME stats ---------- */
function renderHomeBloodStatsIfPresent(){
  const el = document.getElementById('bloodStats');
  if(!el) return;
  const donors = loadDonors();
  const groups = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
  const counts = {}; groups.forEach(g=>counts[g]=0);
  donors.forEach(d=>{ const g=(d.blood||'').toUpperCase(); if(counts[g]!==undefined) counts[g]++; });
  el.innerHTML = groups.map(g=>`<div class="blood-box">${g}: ${counts[g]}</div>`).join('');
}
renderHomeBloodStatsIfPresent();

/* keep in sync */
window.addEventListener('storage', function(e){
  if(e.key===LS_DONORS || e.key===LS_RECIPIENTS || e.key===LS_LASTSEARCH || e.key==='bc_update'){
    renderHomeBloodStatsIfPresent();
    if(window.bcRenderMapAndTable) window.bcRenderMapAndTable();
  }
});

