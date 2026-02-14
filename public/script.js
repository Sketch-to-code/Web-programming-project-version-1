/* --- 1. GLOBAL VARIABLES --- */
// We define 'map' here so all functions (initMap and updateLocation) can access it.
let map; 
let userMarker;
const medicinesDB = [
    { name: "paracetamol", dose: "500mg", expiry: "2025-12", age: "12+", use: "Fever & Pain" },
    { name: "dolo", dose: "650mg", expiry: "2024-10", age: "18+", use: "High Fever" },
    { name: "citrizine", dose: "10mg", expiry: "2026-01", age: "6+", use: "Allergy & Cold" },
    { name: "aspirin", dose: "75mg", expiry: "2025-05", age: "16+", use: "Blood Thinner / Pain" }
];

/* --- 2. THE MAP ENGINE (Leaflet + Geolocation) --- */
function initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Initialize Map
        map = L.map('map').setView([lat, lon], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const medIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/883/883356.png',
            iconSize: [30, 30],
        });

        // Mark User
        userMarker = L.marker([lat, lon]).addTo(map).bindPopup('<b>You are here</b>').openPopup();

        // Load Pharmacies
        const pharmacies = [
            { name: "Apollo Pharmacy", lat: lat + 0.005, lon: lon + 0.005, rating: 4.5, reviews: 120 },
            { name: "MedPlus Wellness", lat: lat - 0.005, lon: lon - 0.002, rating: 4.8, reviews: 340 },
            { name: "Wellness Forever", lat: lat + 0.008, lon: lon - 0.004, rating: 4.2, reviews: 89 },
            { name: "Netmeds Store", lat: lat - 0.003, lon: lon + 0.007, rating: 3.9, reviews: 56 },
            { name: "Local Health Chemist", lat: lat + 0.002, lon: lon - 0.008, rating: 4.6, reviews: 210 }
        ];

        pharmacies.forEach(p => {
            const stars = "⭐".repeat(Math.floor(p.rating));
    
            // THE FIX: Standardized Google Maps Search URL using exact coordinates
            const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`;

            const popupContent = `
                <div style="font-family: 'Poppins', sans-serif; min-width: 150px;">
                    <strong style="color: #00897b; font-size: 14px;">${p.name}</strong><br>
                    <span style="color: #ffa000;">${stars} ${p.rating}</span><br>
                    <small style="color: #666;">(${p.reviews} Google Reviews)</small><br>
                    <a href="${directionsUrl}" target="_blank" style="
                        display: block; 
                        text-align: center;
                        margin-top: 10px; 
                        padding: 8px;
                        background-color: #00897b; 
                        color: white !important; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-size: 12px; 
                        font-weight: 600;">
                        Get Directions
                    </a>
                </div>
            `;
            L.marker([p.lat, p.lon], {icon: medIcon}).addTo(map).bindPopup(popupContent);
        });
    }, () => alert("Please enable GPS for nearby results."));
}

/* --- 3. CHANGE LOCATION LOGIC --- */
async function updateLocation() {
    const query = document.getElementById('manualLocation').value;
    if (!query) return alert("Please enter a city or area");

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
        const data = await response.json();

        if (data.length > 0) {
            const newLat = parseFloat(data[0].lat);
            const newLon = parseFloat(data[0].lon);
            
            map.setView([newLat, newLon], 14);
            if (userMarker) map.removeLayer(userMarker);
            userMarker = L.marker([newLat, newLon]).addTo(map).bindPopup(`<b>Browsing: ${query}</b>`).openPopup();
        } else {
            alert("Location not found!");
        }
    } catch (e) { console.error("Search failed", e); }
}

/* --- 4. MEDICINE SEARCH & PDF --- */
function searchMedicine() {
    const input = document.getElementById("medInput").value.toLowerCase();
    const resultDiv = document.getElementById("medResult");
    const med = medicinesDB.find(m => m.name === input);

    if (med) {
        resultDiv.innerHTML = `
            <div id="pdfContent">
                <h3>${med.name.toUpperCase()}</h3>
                <p><strong>Dosage:</strong> ${med.dose}</p>
                <p><strong>Expiry:</strong> ${med.expiry}</p>
                <p><strong>Min Age:</strong> ${med.age}</p>
                <p><strong>Usage:</strong> ${med.use}</p>
            </div>
            <button onclick="saveToNotepad('${med.name}')" style="background:#f0ad4e;">Add to List</button>
            <button onclick="generatePDF()"><i class="fas fa-file-pdf"></i> Download Info</button>
        `;
        resultDiv.classList.remove("hidden");
    } else {
        resultDiv.innerHTML = `<p style="color:red;">Not found in database.</p>`;
        resultDiv.classList.remove("hidden");
    }
}

async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const medName = document.querySelector("#pdfContent h3").innerText;
    
    doc.setFontSize(22);
    doc.setTextColor(0, 121, 107);
    doc.text("PharmaQuest Medical Report", 20, 20);
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Medicine: ${medName}`, 20, 40);
    
    let y = 50;
    document.querySelectorAll("#pdfContent p").forEach(p => {
        doc.text(p.innerText, 20, y);
        y += 10;
    });
    doc.save(`${medName}_Report.pdf`);
}

/* --- 5. NOTEPAD & CHATBOT --- */
function saveToNotepad(name) {
    let list = JSON.parse(localStorage.getItem("pharmaList")) || [];
    if (!list.includes(name)) {
        list.push(name);
        localStorage.setItem("pharmaList", JSON.stringify(list));
        renderList();
    }
}

function renderList() {
    const listArea = document.getElementById("savedMedsList");
    const data = JSON.parse(localStorage.getItem("pharmaList")) || [];
    listArea.innerHTML = data.map(item => `
        <span class="med-tag">${item} <i class="fas fa-times" onclick="removeItem('${item}')"></i></span>
    `).join('');
}

function removeItem(item) {
    let list = JSON.parse(localStorage.getItem("pharmaList")).filter(i => i !== item);
    localStorage.setItem("pharmaList", JSON.stringify(list));
    renderList();
}

function getAIAdvice() {
    const symptom = document.getElementById("symptomInput").value.toLowerCase();
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<div class="user-msg">${symptom}</div>`;

    let reply = "Consult a doctor. General advice: Get plenty of rest.";
    if (symptom.includes("headache")) reply = "Try Paracetamol and rest in a dark room.";
    else if (symptom.includes("cold")) reply = "Cetirizine helps with allergies. Try steam inhalation.";

    setTimeout(() => {
        chatBox.innerHTML += `<div class="bot-msg">${reply}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 800);
}

/* --- 6. INITIALIZATION & UI --- */
function toggleDarkMode() {
    document.body.classList.toggle("dark-theme");
    const mode = document.body.classList.contains("dark-theme") ? "dark" : "light";
    localStorage.setItem("theme", mode);
}

window.onload = () => {
    initMap();
    if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-theme");
    renderList();
};

function handleContact(e) {
    e.preventDefault();
    alert("Message sent! Our pharmacist will contact you.");
    e.target.reset();
}