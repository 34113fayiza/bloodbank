/* script.js - updated (full file)
   - phone fields for donor & recipient
   - unified donor & recipient tables with columns: Name | Phone | Blood | District | City | Actions
   - Edit + Delete actions for both; modals with clear labels/placeholders and autofocus
   - Karnataka-only masked map rendering and proximity coloring
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
window.karnatakaData = karnatakaData;

/* ---------- helpers ---------- */
function escapeHtml(s){ if(!s) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;"); }
function canonicalCityFromList(input){ if(!input) return null; const t = input.trim(); const keys = Object.keys(karnatakaData.cities); for(const k of keys) if(k.toLowerCase()===t.toLowerCase()) return k; return null; }

/* ---------- Populate district & city selects ---------- */
function populateDistricts() {
  const donorDistrict = document.getElementById('donorDistrict');
  const reqDistrict = document.getElementById('reqDistrict');
  const html = '<option value="">Select district</option>' + karnatakaData.districts.map(d => `<option value="${d}">${d}</option>`).join('');
  if(donorDistrict) donorDistrict.innerHTML = html;
  if(reqDistrict) reqDistrict.innerHTML = html;
  const ed = document.getElementById('editDonorDistrict');
  if(ed) ed.innerHTML = html;
  const er = document.getElementById('editRecipientDistrict');
  if(er) er.innerHTML = html;
}
function populateCitiesForDistrict(district, targetSelectId){
  const sel = document.getElementById(targetSelectId);
  if(!sel) return;
  sel.innerHTML = '<option value="">Select city/locality</option>';
  Object.keys(karnatakaData.cities).sort().forEach(city => {
    if(karnatakaData.cities[city].district === district){
      sel.innerHTML += `<option value="${city}">${city}</option>`;
    }
  });
}

/* ---------- DOM Ready ---------- */
document.addEventListener('DOMContentLoaded', function(){
  populateDistricts();

  // district->city wiring for donor/recipient forms
  const donorDistrict = document.getElementById('donorDistrict');
  const reqDistrict = document.getElementById('reqDistrict');
  if(donorDistrict) donorDistrict.addEventListener('change', function(){ populateCitiesForDistrict(this.value, 'donorCity'); });
  if(reqDistrict) reqDistrict.addEventListener('change', function(){ populateCitiesForDistrict(this.value, 'reqCity'); });

  /* ---------- Donor form submit ---------- */
  const donorForm = document.getElementById('donorForm');
  if(donorForm){
    donorForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = document.getElementById('donorName').value.trim();
      const phone = (document.getElementById('donorPhone').value || '').trim();
      const blood = (document.getElementById('donorBlood').value || '').trim().toUpperCase();
      const city = (document.getElementById('donorCity').value || '').trim();
      const district = (document.getElementById('donorDistrict').value || '').trim();
      const state = (document.getElementById('donorState') ? document.getElementById('donorState').value : 'Karnataka') || 'Karnataka';

      if(!name || !phone || !blood || !city || !district){ alert('Please fill name, phone, blood group, district and city.'); return; }
      const canon = canonicalCityFromList(city);
      if(!canon){ alert('City not in list. Choose a city from the dropdown.'); return; }
      const coords = karnatakaData.cities[canon];
      const donors = loadDonors();
      const id = 'd_' + Date.now();
      donors.push({ id, name, phone, blood, city: canon, district, state, lat: coords.lat, lng: coords.lng, createdAt: Date.now() });
      saveDonors(donors);
      const msg = document.getElementById('donorMsg');
      if(msg){ msg.innerText = 'Donor added successfully.'; msg.style.color = '#2e7d32'; }
      donorForm.reset();
      populateDistricts();
      localStorage.setItem('bc_update','donor_'+Date.now());
      if(typeof renderHomeBloodStatsIfPresent === 'function') renderHomeBloodStatsIfPresent();
      if(window.bcRenderMapAndTable) window.bcRenderMapAndTable();
    });
  }

  /* ---------- Recipient form submit ---------- */
  const requestForm = document.getElementById('requestForm');
  if(requestForm){
    requestForm.addEventListener('submit', function(e){
      e.preventDefault();
      const name = (document.getElementById('reqName') ? document.getElementById('reqName').value.trim() : '');
      const phone = (document.getElementById('reqPhone') ? document.getElementById('reqPhone').value.trim() : '');
      const blood = (document.getElementById('reqBlood').value || '').trim().toUpperCase();
      const city = (document.getElementById('reqCity').value || '').trim();
      const district = (document.getElementById('reqDistrict').value || '').trim();
      const state = (document.getElementById('reqState') ? document.getElementById('reqState').value : 'Karnataka') || 'Karnataka';

      if(!blood || !city || !district){ alert('Please select blood group, district and city.'); return; }
      const canon = canonicalCityFromList(city);
      if(!canon){ alert('City not in list. Choose a city from the dropdown.'); return; }

      const recipients = loadRecipients();
      const id = 'r_' + Date.now();
      const note = `Requested for ${blood}` + (name ? ` — ${name}` : '');
      recipients.push({ id, name, phone, note, blood, city: canon, district, state, lat: karnatakaData.cities[canon].lat, lng: karnatakaData.cities[canon].lng, createdAt: Date.now() });
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
      if(window.bcRenderMapAndTable) window.bcRenderMapAndTable();
    });
  }

  /* ---------- If page has map, initialize it and render tables ---------- */
  if(document.getElementById('map')){
    // Karnataka polygon (coarse)
    const karnatakaPoly = [
      [15.8,74.1],[15.0,74.2],[13.4,74.5],[12.0,75.0],[11.7,75.8],[12.2,76.8],[13.3,77.6],
      [14.8,77.9],[15.8,78.3],[16.8,77.9],[17.4,77.2],[17.6,76.0],[16.6,75.2],[15.8,74.1]
    ];
    const karnatakaBounds = L.latLngBounds(karnatakaPoly);

    const map = L.map('map', { minZoom:6, maxZoom:12, zoomControl:true, attributionControl:true }).fitBounds(karnatakaBounds.pad(0.05));
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap, © CartoDB', maxZoom:12, minZoom:6 }).addTo(map);

    // Mask outside Karnataka and draw border
    const outer = [[90,-180],[90,180],[-90,180],[-90,-180]];
    L.polygon([outer, karnatakaPoly], { color:'#000', weight:0, fillColor:'#000', fillOpacity:0.55, interactive:false }).addTo(map);
    L.polygon(karnatakaPoly, { color:'#c62828', weight:2, fill:false }).addTo(map);

    let markers = [];
    let currentFilter = '';

    function clearMarkers(){ markers.forEach(m=>map.removeLayer(m)); markers = []; }

    function getDonorColorByProximity(donor, lastSearch){
      if(!lastSearch) return '#d32f2f';
      if(donor.city === lastSearch.city) return '#2e7d32';
      if(donor.district === lastSearch.district) return '#ff9800';
      return '#d32f2f';
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
          m.bindPopup(`<b>Donor: ${escapeHtml(d.name)}</b><br>Phone: ${escapeHtml(d.phone||'')}<br>Blood: ${escapeHtml(d.blood)}<br>City: ${escapeHtml(d.city)}<br>District: ${escapeHtml(d.district)}`);
          markers.push(m);
        }
      });

      recipients.forEach(r => {
        if(!passesFilter(r)) return;
        const color = '#9e9e9e';
        if(r.lat && r.lng){
          const m = L.circleMarker([r.lat,r.lng], { radius:8, fillColor:color, color:'#000', weight:1, opacity:1, fillOpacity:0.95 }).addTo(map);
          m.bindPopup(`<b>Recipient</b><br>${escapeHtml(r.note||'')}<br>Phone: ${escapeHtml(r.phone||'')}<br>City: ${escapeHtml(r.city)}<br>District: ${escapeHtml(r.district)}`);
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

    /* ---------- Data table rendering (donors + recipients) ---------- */
    function renderDataTable(){
      const donors = loadDonors();
      const recipients = loadRecipients();
      const donorTbody = document.querySelector('#donorTable tbody');
      const recipTbody = document.querySelector('#recipientTable tbody');
      if(!donorTbody || !recipTbody) return;
      donorTbody.innerHTML = '';
      recipTbody.innerHTML = '';

      donors.forEach(d => {
        if(currentFilter && (d.blood||'').toUpperCase() !== currentFilter.toUpperCase()) return;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(d.name || '')}</td>
          <td>${escapeHtml(d.phone || '')}</td>
          <td>${escapeHtml((d.blood || '').toUpperCase())}</td>
          <td>${escapeHtml(d.district || '')}</td>
          <td>${escapeHtml(d.city || '')}</td>
          <td>
            <button class="action-btn edit-btn" data-id="${d.id}" data-type="donor">Edit</button>
            <button class="action-btn del-btn" data-id="${d.id}" data-type="donor">Delete</button>
          </td>
        `;
        donorTbody.appendChild(tr);
      });

      recipients.forEach(r => {
        if(currentFilter && (r.blood||'').toUpperCase() !== currentFilter.toUpperCase()) return;
        const displayName = (r.name && r.name.trim()) ? r.name : (r.note || '');
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(displayName)}</td>
          <td>${escapeHtml(r.phone || '')}</td>
          <td>${escapeHtml((r.blood || '').toUpperCase())}</td>
          <td>${escapeHtml(r.district || '')}</td>
          <td>${escapeHtml(r.city || '')}</td>
          <td>
            <button class="action-btn edit-btn" data-id="${r.id}" data-type="recipient">Edit</button>
            <button class="action-btn del-btn" data-id="${r.id}" data-type="recipient">Delete</button>
          </td>
        `;
        recipTbody.appendChild(tr);
      });

      // wire buttons for donors
      donorTbody.querySelectorAll('.del-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          const type = btn.getAttribute('data-type');
          if(confirm('Are you sure to delete this entry?')) deleteEntry(id, type);
        };
      });
      donorTbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          openEditModal(id);
        };
      });

      // wire buttons for recipients
      recipTbody.querySelectorAll('.del-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          const type = btn.getAttribute('data-type');
          if(confirm('Are you sure to delete this entry?')) deleteEntry(id, type);
        };
      });
      recipTbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => {
          const id = btn.getAttribute('data-id');
          openEditRecipientModal(id);
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

    /* ---------- Donor edit modal (improved labels + placeholders) ---------- */
    let modalBackdrop = document.getElementById('modalBackdrop');
    if(!modalBackdrop){
      modalBackdrop = document.createElement('div');
      modalBackdrop.id = 'modalBackdrop';
      modalBackdrop.className = 'modal-backdrop';
      modalBackdrop.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="editDonorTitle">
          <h3 id="editDonorTitle">Edit Donor</h3>
          <form id="editDonorForm" autocomplete="off">
            <input type="hidden" id="editDonorId" />

            <label for="editDonorName">Full name</label>
            <input id="editDonorName" placeholder="e.g. Ramesh Kumar" aria-label="Donor full name" />
            <div style="font-size:12px;color:#6b7280">Enter full name of donor.</div>

            <label for="editDonorPhone" style="margin-top:8px">Phone number</label>
            <input id="editDonorPhone" placeholder="+91 98765 43210" aria-label="Donor phone number" />
            <div style="font-size:12px;color:#6b7280">Include country code if available.</div>

            <label for="editDonorBlood" style="margin-top:8px">Blood group</label>
            <select id="editDonorBlood" aria-label="Donor blood group">
              <option value="">Select blood group</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
            </select>
            <div style="font-size:12px;color:#6b7280">Choose the donor's blood group.</div>

            <label for="editDonorDistrict" style="margin-top:8px">District</label>
            <select id="editDonorDistrict" aria-label="Donor district"></select>

            <label for="editDonorCity" style="margin-top:8px">City / locality</label>
            <select id="editDonorCity" aria-label="Donor city/locality"></select>

            <div class="modal-actions">
              <button type="button" id="cancelEdit" class="btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>`;
      document.body.appendChild(modalBackdrop);
    }

    function openEditModal(donorId){
      const donors = loadDonors();
      const d = donors.find(x=>x.id===donorId);
      if(!d){ alert('Donor not found'); return; }
      const mb = document.getElementById('modalBackdrop');
      if(!mb) return alert('Donor modal not found');

      document.getElementById('editDonorId').value = d.id || '';
      document.getElementById('editDonorName').value = d.name || '';
      document.getElementById('editDonorPhone').value = d.phone || '';
      document.getElementById('editDonorBlood').value = (d.blood || '').toUpperCase();

      const ed = document.getElementById('editDonorDistrict');
      const ec = document.getElementById('editDonorCity');
      if(ed){
        ed.innerHTML = '<option value="">Select district</option>' + karnatakaData.districts.map(dd => `<option value="${dd}">${dd}</option>`).join('');
        ed.value = d.district || '';
      }
      if(ec){
        ec.innerHTML = '<option value="">Select city/locality</option>';
        const useDistrict = ed && ed.value ? ed.value : (d.district || '');
        Object.keys(karnatakaData.cities).sort().forEach(city => {
          if(karnatakaData.cities[city].district === useDistrict){
            ec.innerHTML += `<option value="${city}">${city}</option>`;
          }
        });
        ec.value = d.city || '';
      }

      mb.style.display = 'flex';
      setTimeout(()=>document.getElementById('editDonorName')?.focus(), 80);
    }

    // donor modal submit (handles saving edits)
    document.addEventListener('submit', function(e){
      if(e.target && e.target.id === 'editDonorForm'){
        e.preventDefault();
        const id = document.getElementById('editDonorId').value;
        const name = (document.getElementById('editDonorName').value || '').trim();
        const phone = (document.getElementById('editDonorPhone').value || '').trim();
        const blood = (document.getElementById('editDonorBlood').value || '').trim().toUpperCase();
        const district = (document.getElementById('editDonorDistrict').value || '').trim();
        const city = (document.getElementById('editDonorCity').value || '').trim();

        if(!id || !name || !phone || !blood || !district || !city){ alert('Please complete all fields'); return; }
        const canon = canonicalCityFromList(city);
        if(!canon){ alert('City not recognized in Karnataka list'); return; }

        const donors = loadDonors();
        const idx = donors.findIndex(x => x.id === id);
        if(idx === -1){ alert('Donor not found'); document.getElementById('modalBackdrop').style.display = 'none'; return; }
        donors[idx].name = name;
        donors[idx].phone = phone;
        donors[idx].blood = blood;
        donors[idx].district = district;
        donors[idx].city = canon;
        donors[idx].lat = karnatakaData.cities[canon].lat;
        donors[idx].lng = karnatakaData.cities[canon].lng;
        saveDonors(donors);
        localStorage.setItem('bc_update','edit_'+Date.now());
        document.getElementById('modalBackdrop').style.display = 'none';
        renderHomeBloodStatsIfPresent();
        renderMapAndTable();
      }
    });

    document.getElementById('cancelEdit')?.addEventListener('click', function(){ document.getElementById('modalBackdrop').style.display = 'none'; });

    /* ---------- Recipient edit modal (improved) ---------- */
    let recipModalBackdrop = document.getElementById('recipModalBackdrop');
    if(!recipModalBackdrop){
      recipModalBackdrop = document.createElement('div');
      recipModalBackdrop.id = 'recipModalBackdrop';
      recipModalBackdrop.className = 'modal-backdrop';
      recipModalBackdrop.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="editRecipientTitle">
          <h3 id="editRecipientTitle">Edit Recipient</h3>
          <form id="editRecipientForm" autocomplete="off">
            <input type="hidden" id="editRecipientId" />

            <label for="editRecipientName">Patient / Contact name</label>
            <input id="editRecipientName" placeholder="e.g. Anita R" aria-label="Recipient name" />
            <div style="font-size:12px;color:#6b7280">Name of patient or contact person.</div>

            <label for="editRecipientPhone" style="margin-top:8px">Phone number</label>
            <input id="editRecipientPhone" placeholder="+91 98765 43210" aria-label="Recipient phone number" />
            <div style="font-size:12px;color:#6b7280">Phone for the contact (include country code if possible).</div>

            <label for="editRecipientBlood" style="margin-top:8px">Blood group</label>
            <select id="editRecipientBlood" aria-label="Recipient blood group">
              <option value="">Select blood group</option>
              <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
              <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
            </select>

            <label for="editRecipientDistrict" style="margin-top:8px">District</label>
            <select id="editRecipientDistrict" aria-label="Recipient district"></select>

            <label for="editRecipientCity" style="margin-top:8px">City / locality</label>
            <select id="editRecipientCity" aria-label="Recipient city/locality"></select>

            <div class="modal-actions">
              <button type="button" id="cancelEditRecipient" class="btn">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>`;
      document.body.appendChild(recipModalBackdrop);
    }

    function openEditRecipientModal(recipientId){
      const recipients = loadRecipients();
      const r = recipients.find(x=>x.id===recipientId);
      if(!r){ alert('Recipient not found'); return; }
      const rb = document.getElementById('recipModalBackdrop');
      if(!rb) return alert('Recipient modal not found');

      document.getElementById('editRecipientId').value = r.id || '';
      document.getElementById('editRecipientName').value = r.name || '';
      document.getElementById('editRecipientPhone').value = r.phone || '';
      document.getElementById('editRecipientBlood').value = (r.blood || '').toUpperCase();

      const rd = document.getElementById('editRecipientDistrict');
      const rc = document.getElementById('editRecipientCity');
      if(rd){
        rd.innerHTML = '<option value="">Select district</option>' + karnatakaData.districts.map(dd => `<option value="${dd}">${dd}</option>`).join('');
        rd.value = r.district || '';
      }
      if(rc){
        rc.innerHTML = '<option value="">Select city/locality</option>';
        const useDistrict = rd && rd.value ? rd.value : (r.district || '');
        Object.keys(karnatakaData.cities).sort().forEach(city => {
          if(karnatakaData.cities[city].district === useDistrict){
            rc.innerHTML += `<option value="${city}">${city}</option>`;
          }
        });
        rc.value = r.city || '';
      }

      rb.style.display = 'flex';
      setTimeout(()=>document.getElementById('editRecipientName')?.focus(), 80);
    }

    // wire district->city cascade in edit modals
    document.addEventListener('change', function(e){
      if(e.target && e.target.id === 'editRecipientDistrict') populateCitiesForDistrict(e.target.value, 'editRecipientCity');
      if(e.target && e.target.id === 'editDonorDistrict') populateCitiesForDistrict(e.target.value, 'editDonorCity');
    });

    // recipient modal submit (save edits)
    document.addEventListener('submit', function(e){
      if(e.target && e.target.id === 'editRecipientForm'){
        e.preventDefault();
        const id = document.getElementById('editRecipientId').value;
        const name = (document.getElementById('editRecipientName').value || '').trim();
        const phone = (document.getElementById('editRecipientPhone').value || '').trim();
        const blood = (document.getElementById('editRecipientBlood').value || '').trim().toUpperCase();
        const district = (document.getElementById('editRecipientDistrict').value || '').trim();
        const city = (document.getElementById('editRecipientCity').value || '').trim();

        if(!id || !blood || !district || !city){ alert('Please complete required fields (blood, district, city).'); return; }
        const canon = canonicalCityFromList(city);
        if(!canon){ alert('City not recognized in Karnataka list'); return; }

        const recipients = loadRecipients();
        const idx = recipients.findIndex(x => x.id === id);
        if(idx === -1){ alert('Recipient not found'); document.getElementById('recipModalBackdrop').style.display = 'none'; return; }

        recipients[idx].name = name;
        recipients[idx].phone = phone;
        recipients[idx].blood = blood;
        recipients[idx].district = district;
        recipients[idx].city = canon;
        recipients[idx].lat = karnatakaData.cities[canon].lat;
        recipients[idx].lng = karnatakaData.cities[canon].lng;
        saveRecipients(recipients);
        localStorage.setItem('bc_update','edit_recipient_'+Date.now());
        document.getElementById('recipModalBackdrop').style.display = 'none';
        renderHomeBloodStatsIfPresent();
        renderMapAndTable();
      }
    });

    document.getElementById('cancelEditRecipient')?.addEventListener('click', function(){ document.getElementById('recipModalBackdrop').style.display = 'none'; });

    /* ---------- Filter UI ---------- */
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

  } // end if map exists

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

  window.addEventListener('storage', function(e){
    if(e.key===LS_DONORS || e.key===LS_RECIPIENTS || e.key===LS_LASTSEARCH || e.key==='bc_update'){
      renderHomeBloodStatsIfPresent();
      if(window.bcRenderMapAndTable) window.bcRenderMapAndTable();
    }
  });

}); // DOMContentLoaded end
