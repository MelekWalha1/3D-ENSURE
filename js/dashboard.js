const CHANNEL_ID = "2719758";
const RESULTS = 50;



// Predefined credentials
const USERNAME = "admin";
const PASSWORD = "12345";

const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');

loginBtn.addEventListener('click', () => {
  const enteredUsername = document.getElementById('username').value;
  const enteredPassword = document.getElementById('password').value;

  if (enteredUsername === USERNAME && enteredPassword === PASSWORD) {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    loginError.style.display = 'none';
    
    // Initialize charts after login
    buildCharts(); 
  } else {
    loginError.style.display = 'block';
  }
});

logoutBtn.addEventListener('click', () => {
  dashboardSection.style.display = 'none';
  loginSection.style.display = 'block';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';

  // Stop auto-update
  clearInterval(updateInterval);
});





async function fetchField(field) {
  const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/fields/${field}.json?results=${RESULTS}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.feeds.map(feed => ({
    time: feed.created_at,
    value: parseFloat(feed[`field${field}`])
  }));
}

async function buildCharts() {
  const tempData = await fetchField(1);
  const humData = await fetchField(2);
  const pm1Data = await fetchField(3);
  const pm2Data = await fetchField(4);
  const pm4Data = await fetchField(5);
  const pm10Data = await fetchField(6);


  function getCondition(parameter, value) {
  // Define thresholds (example, you can adjust)
  switch (parameter) {
    case "Temperature":
      if (value < 25) return "good";
      if (value < 35) return "moderate";
      return "risk";
    case "Humidity":
      if (value < 50) return "good";
      if (value < 70) return "moderate";
      return "risk";
    case "PM1.0":
    case "PM2.5":
    case "PM4.0":
    case "PM10":
      if (value < 50) return "good";
      if (value < 100) return "moderate";
      return "risk";
    default:
      return "good";
  }
}

// Get latest values
const latestValues = {
  Temperature: tempData[tempData.length - 1].value,
  Humidity: humData[humData.length - 1].value,
  "PM1.0": pm1Data[pm1Data.length - 1].value,
  "PM2.5": pm2Data[pm2Data.length - 1].value,
  "PM4.0": pm4Data[pm4Data.length - 1].value,
  PM10: pm10Data[pm10Data.length - 1].value
};

const topRow = document.querySelector('#statusPanel .top-row');
const bottomRow = document.querySelector('#statusPanel .bottom-row');

topRow.innerHTML = "";
bottomRow.innerHTML = "";

// Split parameters into rows
const parametersTop = ["Temperature", "Humidity"];
const parametersBottom = ["PM1.0", "PM2.5", "PM4.0", "PM10"];

function addCardToRow(param, row) {
  const value = latestValues[param];
  const condition = getCondition(param, value);

  const card = document.createElement('div');
  card.classList.add('status-card');
  card.innerHTML = `
    <h4>${param}</h4>
    <div class="value">${value}</div>
    <div class="unit">${param === "Temperature" ? "°C" : param === "Humidity" ? "%" : "µg/m³"}</div>
    <div class="condition ${condition}">${condition.toUpperCase()}</div>
  `;
  row.appendChild(card);
}

parametersTop.forEach(param => addCardToRow(param, topRow));
parametersBottom.forEach(param => addCardToRow(param, bottomRow));





  const labels = tempData.map(d => new Date(d.time).toLocaleTimeString());

  // Temperature chart
  new Chart(document.getElementById('tempChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: tempData.map(d => d.value),
        borderColor: 'red',
        backgroundColor: 'rgba(255,0,0,0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // Humidity chart
  new Chart(document.getElementById('humChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Humidity (%)',
        data: humData.map(d => d.value),
        borderColor: 'blue',
        backgroundColor: 'rgba(0,0,255,0.1)',
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // PM1.0 chart
  new Chart(document.getElementById('pm1Chart'), {
    type: 'line',
    data: { labels, datasets: [{ label: 'PM1.0 (µg/m³)', data: pm1Data.map(d => d.value), borderColor: 'green', fill: false, tension: 0.3 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // PM2.5 chart
  new Chart(document.getElementById('pm2Chart'), {
    type: 'line',
    data: { labels, datasets: [{ label: 'PM2.5 (µg/m³)', data: pm2Data.map(d => d.value), borderColor: 'orange', fill: false, tension: 0.3 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // PM4 chart
  new Chart(document.getElementById('pm4Chart'), {
    type: 'line',
    data: { labels, datasets: [{ label: 'PM4.0 (µg/m³)', data: pm4Data.map(d => d.value), borderColor: 'purple', fill: false, tension: 0.3 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // PM10 chart
  new Chart(document.getElementById('pm10Chart'), {
    type: 'line',
    data: { labels, datasets: [{ label: 'PM10 (µg/m³)', data: pm10Data.map(d => d.value), borderColor: 'brown', fill: false, tension: 0.3 }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });

  // Combined PM chart
  new Chart(document.getElementById('pmCombinedChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'PM1.0', data: pm1Data.map(d => d.value), borderColor: 'green', fill: false, tension: 0.3 },
        { label: 'PM2.5', data: pm2Data.map(d => d.value), borderColor: 'orange', fill: false, tension: 0.3 },
        { label: 'PM4.0', data: pm4Data.map(d => d.value), borderColor: 'purple', fill: false, tension: 0.3 },
        { label: 'PM10', data: pm10Data.map(d => d.value), borderColor: 'brown', fill: false, tension: 0.3 }
      ]
    },
    options: { responsive: true, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } }
  });
}

// Run the charts
buildCharts();
