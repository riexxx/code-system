// 1. DATA: 42 Official Barangays
const barangays = ["Abung", "Balagbag", "Barualte", "Bataan", "Buhay Na Sapa", "Bulsa", "Calicanto", "Calitcalit", "Calubcub I", "Calubcub II", "Catmon", "Coloconto", "Escribano", "Hugom", "Imelda", "Janaojanao", "Laiya Aplaya", "Laiya Ibabao", "Libato", "Lipahan", "Mabalanoy", "Maraykit", "Muzon", "Nagsaulay", "Palahanan I", "Palahanan II", "Palingowak", "Pinagbayanan", "Poblacion", "Poctol", "Pulangbato", "Putingbuhangin", "Quipot", "Sampiro", "Sapangan", "Sico I", "Sico II", "Subukin", "Talahiban I", "Talahiban II", "Ticalan", "Tipaz"];

// 2. MAP SETUP (Locked to San Juan Batangas)
const sjBounds = [ [13.6500, 121.2500], [13.9500, 121.5500] ];
const map = L.map('map', {
    zoomControl: false,
    maxBounds: sjBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 12
}).setView([13.8236, 121.3967], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

// Fill Barangays
const bSelect = document.getElementById('barangaySelect');
barangays.sort().forEach(b => {
    let opt = document.createElement('option');
    opt.value = b; opt.innerText = b; bSelect.appendChild(opt);
});

// 3. CHART SETUP
// 1. Data Initialization (Ito ang mga kategorya sa San Juan)
const issueData = {
    labels: ['Waste Management', 'Water Quality', 'Coastal Erosion', 'Illegal Logging'],
    datasets: [{
        data: [45, 25, 15, 15], // Halimbawang percentage o bilang ng reports
        backgroundColor: [
            '#2ecc71', // Green para sa Waste
            '#3498db', // Blue para sa Water
            '#e67e22', // Orange para sa Coastal
            '#e74c3c'  // Red para sa Illegal Logging
        ],
        borderWidth: 0,
        hoverOffset: 10
    }]
};

// 2. Configuration ng Chart
const config = {
    type: 'doughnut', // Mas moderno tignan kaysa sa ordinaryong pie chart
    data: issueData,
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#ffffff', // Puti ang text para sa Dark Mode/Glass card
                    padding: 20,
                    font: { size: 12 }
                }
            },
            title: {
                display: false
            }
        },
        cutout: '70%' // Ginagawang "ring" ang chart para sa aesthetic
    }
};

// 3. Render the Chart
const issueChart = new Chart(
    document.getElementById('issueChart'),
    config
);

// 4. IMAGE PREVIEW (Multi-photo)
let selectedFiles = [];
function previewImages(event) {
    const gallery = document.getElementById('previewGallery');
    gallery.innerHTML = "";
    selectedFiles = Array.from(event.target.files).slice(0, 3); // Limit to 3

    selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-item';
            gallery.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
}

// 5. SUBMISSION & ZOOM
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const reporter = document.getElementById('reporterName').value;
    const brgy = bSelect.value;
    const type = document.getElementById('issueType').value;
    const desc = document.getElementById('description').value;

    // Zoom and Map Pin
    const loc = [13.82 + (Math.random()-0.5)*0.1, 121.39 + (Math.random()-0.5)*0.1];
    L.marker(loc).addTo(map).bindPopup(`<b>${type}</b><br>${brgy}`).openPopup();
    map.flyTo(loc, 15);

    // Build Photos HTML for Feed
    let photoHTML = "";
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoHTML += `<img src="${e.target.result}" class="strip-img">`;
            if (index === selectedFiles.length - 1 || selectedFiles.length === 0) {
                renderFeedCard(reporter, brgy, type, desc, photoHTML);
            }
        }
        reader.readAsDataURL(file);
    });

    // If no photos uploaded
    if(selectedFiles.length === 0) {
        renderFeedCard(reporter, brgy, type, desc, `<div style="padding:20px; color:#ccc; text-align:center;">No photo proof</div>`);
    }

    // Update Analytics
    issueStats[type]++;
    issueChart.data.datasets[0].data = Object.values(issueStats);
    issueChart.update();

    // Reset
    document.getElementById('pts').innerText = parseInt(document.getElementById('pts').innerText) + 50;
    this.reset();
    document.getElementById('previewGallery').innerHTML = "";
    selectedFiles = [];
});

function renderFeedCard(reporter, brgy, type, desc, photos) {
    const feed = document.getElementById('reportFeed');
    if(feed.querySelector('.empty-msg')) feed.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.innerHTML = `
        <div class="photo-strip">${photos}</div>
        <div class="card-body">
            <span class="status-tag">PENDING</span>
            <strong>${type}</strong>
            <p><i class="fas fa-user"></i> ${reporter}</p>
            <p><i class="fas fa-map-marker-alt"></i> ${brgy}</p>
            <p style="font-size:0.7rem; color:#666; margin-top:8px;">"${desc}"</p>
        </div>
    `;
    feed.prepend(card);
}

