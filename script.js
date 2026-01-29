const barangays = ["Abung", "Balagbag", "Barualte", "Bataan", "Buhay Na Sapa", "Bulsa", "Calicanto", "Calitcalit", "Calubcub I", "Calubcub II", "Catmon", "Coloconto", "Escribano", "Hugom", "Imelda", "Janaojanao", "Laiya Aplaya", "Laiya Ibabao", "Libato", "Lipahan", "Mabalanoy", "Maraykit", "Muzon", "Nagsaulay", "Palahanan I", "Palahanan II", "Palingowak", "Pinagbayanan", "Poblacion", "Poctol", "Pulangbato", "Putingbuhangin", "Quipot", "Sampiro", "Sapangan", "Sico I", "Sico II", "Subukin", "Talahiban I", "Talahiban II", "Ticalan", "Tipaz"];

const coastalBrgy = ["Laiya Aplaya", "Laiya Ibabao", "Hugom", "Abung", "Subukin", "Bataan", "Calubcub I", "Calubcub II"];

// Map Restriction: San Juan Batangas Only
const sjBounds = [[13.6500, 121.2800], [13.9200, 121.5200]];
const map = L.map('map', { 
    zoomControl: false, 
    maxBounds: sjBounds,
    minZoom: 12 
}).setView([13.8236, 121.3967], 13);

// Dark Theme Map
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

// Fill Select
const bSelect = document.getElementById('brgySelect');
barangays.sort().forEach(b => {
    bSelect.innerHTML += `<option value="${b}">${b}</option>`;
});

// Resource Chart
const ctx = document.getElementById('resourceChart').getContext('2d');
const resChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['6am', '9am', '12pm', '3pm', '6pm'],
        datasets: [{
            label: 'Water Demand',
            data: [30, 45, 90, 65, 80],
            borderColor: '#00ffa3',
            tension: 0.4
        }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } } }
});

function runClimateModel() {
    const brgy = bSelect.value;
    const cond = document.getElementById('condition').value;
    const feed = document.getElementById('tourismFeed');
    const isCoastal = coastalBrgy.includes(brgy);
    
    // Logic for Vulnerability
    let risk = "Low";
    let color = "#2ecc71";
    let advice = "Safe for eco-tourism.";

    if (cond === "Rain") {
        risk = "Moderate"; color = "#f1c40f";
        advice = "Avoid hiking trails in inland barangays.";
    } 
    if (cond === "Storm" && isCoastal) {
        risk = "Critical"; color = "#e74c3c";
        advice = "EVACUATE COASTAL ZONE. Storm surge risk high.";
    }

    // Update Map
    const loc = [13.82 + (Math.random()-0.5)*0.1, 121.39 + (Math.random()-0.5)*0.1];
    L.circle(loc, { radius: 800, color: color, fillOpacity: 0.4 }).addTo(map);
    map.flyTo(loc, 14);

    // Update Feed
    feed.innerHTML = `
        <div class="brgy-card" style="border-color: ${color}">
            <strong>${brgy} Analysis</strong>
            <p style="font-size: 0.75rem; margin-top: 5px;">Risk Level: ${risk}</p>
            <p style="font-size: 0.7rem; color: #ccc;">${advice}</p>
        </div>
    ` + feed.innerHTML;

    // Update Capacity
    const newCap = Math.floor(Math.random() * 100);
    document.getElementById('capacityBar').style.width = newCap + "%";
    document.getElementById('capacityText').innerText = `Current Municipality Capacity: ${newCap}%`;
}