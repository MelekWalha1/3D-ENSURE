/* ---------------- CONFIG ---------------- */
const DASHBOARD_PASSWORD = "1234";    // set your password
const CHANNEL_ID = 2868561;           // ThingSpeak channel id
const FIELDS = [1,2,3,4];             // one chart per field
const RESULTS = 50;                   // last N points
const READ_API_KEY = "";              // optional
const REFRESH_INTERVAL = 15000;       // ms
const COLORS = ["rgba(75,192,192,1)","rgba(255,99,132,1)","rgba(255,206,86,1)","rgba(153,102,255,1)"];
/* ---------------------------------------- */

let charts = {};      // Chart.js instances
let updateTimer = null;

/* Build ThingSpeak URL */
function buildURL(){
    let url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=${RESULTS}`;
    if(READ_API_KEY) url += `&api_key=${encodeURIComponent(READ_API_KEY)}`;
    return url;
}

/* Fetch data and update charts */
async function fetchDataAndUpdate(){
    const url = buildURL();
    document.getElementById('status').textContent = 'Loading data...';
    try{
        const res = await fetch(url);
        if(!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        if(!json.feeds || json.feeds.length===0){
            document.getElementById('status').textContent = 'No data found';
            return;
        }
        const labels = json.feeds.map(f => new Date(f.created_at));
        FIELDS.forEach((field, idx) => {
            const values = json.feeds.map(f => {
                const v = f[`field${field}`];
                return (v!==null && v!==undefined && v!=='') ? Number(v) : null;
            });
            drawOrUpdateChart(field, labels, values, COLORS[idx % COLORS.length]);
        });
        document.getElementById('status').textContent = `Loaded ${labels.length} points`;
    }catch(err){
        console.error(err);
        document.getElementById('status').textContent = 'Error: ' + err.message;
    }
}

/* Draw or update chart */
function drawOrUpdateChart(field, labels, data, color){
    const container = document.getElementById('charts-container');
    const id = 'chart-field-' + field;

    // Create canvas only if it doesn't exist
    if(!document.getElementById(id)){
        const card = document.createElement('div');
        card.className = 'chart-card';
        const title = document.createElement('h4');
        title.textContent = `Field ${field}`;
        card.appendChild(title);
        const canvas = document.createElement('canvas');
        canvas.id = id;
        card.appendChild(canvas);
        container.appendChild(card);
    }

    const ctx = document.getElementById(id).getContext('2d');

    // If chart exists, update data instead of creating new
    if(charts[field]){
        charts[field].data.labels = labels;
        charts[field].data.datasets[0].data = data;
        charts[field].update();
    } else {
        charts[field] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Field ${field}`,
                    data: data,
                    borderColor: color,
                    backgroundColor: color.replace('1)', '0.12)'),
                    pointRadius: 2,
                    borderWidth: 2,
                    spanGaps: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,  // Ensures fixed height works
                scales: {
                    x: {
                        type: 'time',
                        time: { tooltipFormat: 'YYYY-MM-DD HH:mm:ss', unit: 'minute' },
                        title: { display: true, text: 'Time (UTC)' }
                    },
                    y: {
                        beginAtZero: false,       // Optional: dynamic scaling
                        title: { display: true, text: 'Value' }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}


/* Initialize dashboard */
function initDashboard(){
    if(updateTimer) return;
    charts = {};
    document.getElementById('charts-container').innerHTML = '';
    fetchDataAndUpdate();
    updateTimer = setInterval(fetchDataAndUpdate, REFRESH_INTERVAL);
}

/* PASSWORD HANDLING */
function showPasswordPrompt(){
    const pwd = prompt("Enter Dashboard Password:");
    if(pwd === DASHBOARD_PASSWORD){
        document.getElementById('status').textContent = "Access granted. Loading charts...";
        initDashboard();
        // Show logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = "Logout";
        logoutBtn.style.marginTop="10px";
        logoutBtn.onclick = () => {
            if(updateTimer){ clearInterval(updateTimer); updateTimer=null; }
            charts={};
            document.getElementById('charts-container').innerHTML='';
            showPasswordPrompt();
        };
        document.getElementById('status').appendChild(document.createElement('br'));
        document.getElementById('status').appendChild(logoutBtn);
    } else {
        alert("Incorrect password");
        showPasswordPrompt();
    }
}

/* Run on page load */
window.onload = showPasswordPrompt;