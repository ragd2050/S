// pages.js - Page Rendering Functions (Part 1)

// ======================
// Dashboard Page
// ======================
function renderDashboard() {
  const stats = getStatistics();
  const recentAlerts = AppState.alerts.slice(0, 4);

  return `
    <div class="space-y-6 fade-in">

      <!-- العنوان -->
      <div class="max-w-5xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>
        <p class="text-sm text-gray-500">
          Quick overview of your plants, devices and recent activity.
        </p>
      </div>

      <!-- الصف العلوي (البطاقات الأربع) -->
      <div class="dashboard-top-row">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="stat-card dashboard-stat">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-xs uppercase tracking-wide">Total Plants</p>
                <p class="text-3xl font-bold mt-1">${stats.totalPlants}</p>
              </div>
              <div class="bg-green-100 text-green-600 p-3 rounded-full">
                <i class="fas fa-leaf text-2xl"></i>
              </div>
            </div>
          </div>

          <div class="stat-card dashboard-stat">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-xs uppercase tracking-wide">Active Devices</p>
                <p class="text-3xl font-bold mt-1">${stats.activeDevices}</p>
              </div>
              <div class="bg-blue-100 text-blue-600 p-3 rounded-full">
                <i class="fas fa-microchip text-2xl"></i>
              </div>
            </div>
          </div>

          <div class="stat-card dashboard-stat">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-xs uppercase tracking-wide">Active Alerts</p>
                <p class="text-3xl font-bold mt-1">${stats.activeAlerts}</p>
              </div>
              <div class="bg-amber-100 text-amber-600 p-3 rounded-full">
                <i class="fas fa-exclamation-triangle text-2xl"></i>
              </div>
            </div>
          </div>

          <div class="stat-card dashboard-stat">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-500 text-xs uppercase tracking-wide">Healthy Plants</p>
                <p class="text-3xl font-bold mt-1">${stats.healthyPlants}</p>
              </div>
              <div class="bg-emerald-100 text-emerald-600 p-3 rounded-full">
                <i class="fas fa-check-circle text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- الشبكة الأساسية: الرسم + التنبيهات -->
      <div class="dashboard-main-grid">
        <!-- الرسم -->
        <div class="dashboard-card">
          <h2 class="dashboard-card-title">Live Sensor Readings</h2>
          <p class="dashboard-card-subtitle">
            Track soil moisture and temperature trends over time.
          </p>
          <div class="chart-container" style="margin-top:16px;">
            <canvas id="dashboardChart"></canvas>
          </div>
        </div>

        <!-- التنبيهات -->
        <div class="dashboard-card">
          <h2 class="dashboard-card-title">Recent Alerts</h2>
          <p class="dashboard-card-subtitle">
            Latest issues that may need your attention.
          </p>
          <div class="space-y-3 mt-4">
            ${recentAlerts.map(alert => `
              <div class="recent-alert-item alert-card ${alert.severity}">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="badge ${alert.severity} text-[0.65rem]">
                        ${alert.type.replace(/_/g, ' ')}
                      </span>
                      <span class="text-[0.7rem] text-gray-500">${alert.time}</span>
                    </div>
                    <p class="text-sm font-semibold">${alert.plant}</p>
                    <p class="text-xs text-gray-600 mt-1">
                      ${alert.message}
                    </p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Plants at Risk -->
      <div class="max-w-5xl mx-auto">
        <div class="dashboard-card">
          <h2 class="dashboard-card-title">Plants Requiring Attention</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            ${AppState.plants.filter(p => p.status === 'warning').map(plant => `
              <div class="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
                <div class="flex items-center space-x-3 mb-3">
                  <span class="text-3xl">${plant.emoji}</span>
                  <div>
                    <h3 class="font-semibold text-sm">${plant.nickname}</h3>
                    <p class="text-xs text-gray-600">${plant.species}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600">Moisture:</span>
                  <span class="font-semibold text-amber-700">
                    ${plant.moisture.toFixed(0)}%
                  </span>
                </div>
                <button
                  onclick="viewPlantDetail(${plant.id})"
                  class="w-full mt-3 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 text-xs font-semibold transition"
                >
                  View Details
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ======================
// Plants Page
// ======================
function renderPlants() {
  return `
    <div class="space-y-6 fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">My Plants</h1>
          <p class="text-sm text-gray-500 mt-1">
            Overview of all your plants and their current conditions.
          </p>
        </div>
        <button class="btn btn-primary" onclick="showAddPlantForm()">
          <i class="fas fa-plus"></i>
          <span>Add Plant</span>
        </button>
      </div>

      <!-- كونتينر كبير للكروت -->
      <div style="
        background:#f9fafb;
        border-radius:24px;
        padding:24px 24px 28px;
        border:1px solid #e5e7eb;
        box-shadow:0 18px 40px rgba(15,23,42,0.12);
        max-width:1100px;
        margin:0 auto;
      ">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${AppState.plants.map(plant => `
            <div class="plant-card" style="
              border-radius:18px;
              padding:0;
              overflow:hidden;
              box-shadow:0 10px 26px rgba(15,23,42,0.12);
            ">
              <!-- الهيدر الأخضر -->
              <div style="
                background:linear-gradient(135deg,#16a34a,#15803d);
                padding:18px 20px;
                display:flex;
                align-items:center;
                justify-content:space-between;
              ">
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="
                    width:46px;height:46px;border-radius:16px;
                    background:rgba(255,255,255,0.15);
                    display:flex;align-items:center;justify-content:center;
                    font-size:1.9rem;
                  ">
                    ${plant.emoji}
                  </div>
                  <div>
                    <h3 style="color:#f9fafb;font-weight:700;font-size:1.05rem;">
                      ${plant.nickname}
                    </h3>
                    <p style="color:#d1fae5;font-size:0.8rem;font-style:italic;">
                      ${plant.species}
                    </p>
                  </div>
                </div>
                <span class="badge ${plant.status}" style="font-size:0.75rem;">
                  ${plant.status.toUpperCase()}
                </span>
              </div>

              <!-- جسم الكرت -->
              <div style="padding:18px 20px 16px;">
                <!-- المقاييس -->
                <div class="grid grid-cols-1 gap-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-tint" style="color:#0ea5e9;"></i>
                      <span class="text-sm text-gray-600">Moisture</span>
                    </div>
                    <span class="font-semibold text-sm">${plant.moisture.toFixed(0)}%</span>
                  </div>
                  <div class="progress-bar" style="height:7px;margin-top:2px;">
                    <div class="progress-fill ${
                      plant.moisture < 40 ? 'low' : plant.moisture < 60 ? 'medium' : 'high'
                    }" style="width:${plant.moisture}%;"></div>
                  </div>

                  <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-thermometer-half" style="color:#f97316;"></i>
                      <span class="text-sm text-gray-600">Temperature</span>
                    </div>
                    <span class="font-semibold text-sm">
                      ${plant.temp.toFixed(1)}°C
                    </span>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-sun" style="color:#eab308;"></i>
                      <span class="text-sm text-gray-600">Light</span>
                    </div>
                    <span class="font-semibold text-sm">
                      ${plant.light.toFixed(0)} lux
                    </span>
                  </div>
                </div>

                <p class="text-xs text-gray-500 mt-4 mb-3">
                  Last watered: ${plant.lastWatered}
                </p>

                <!-- الأزرار -->
                <div class="flex flex-wrap gap-2">
                  <button
                    class="btn btn-secondary flex-1"
                    style="min-width:90px;"
                    onclick="event.stopPropagation(); viewPlantDetail(${plant.id});">
                    <i class="fas fa-eye"></i><span>View</span>
                  </button>
                  <button
                    class="btn btn-secondary flex-1"
                    style="min-width:90px;"
                    onclick="event.stopPropagation(); showEditPlantForm(${plant.id});">
                    <i class="fas fa-pen"></i><span>Edit</span>
                  </button>
                  <button
                    class="btn btn-primary flex-1"
                    style="
                      min-width:90px;
                      background:#ef4444;
                      box-shadow:0 8px 18px rgba(239,68,68,0.35);
                    "
                    onclick="event.stopPropagation(); deletePlantById(${plant.id});">
                    <i class="fas fa-trash"></i><span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ======================
// Devices Page
// ======================
function renderDevices() {
  return `
    <div class="space-y-6 fade-in">
      <!-- العنوان + الوصف + زر الإضافة -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Devices & Sensors</h1>
          <p class="text-sm text-gray-500 mt-1">
            Monitor all connected SmartAgro devices and their sensor status in real time.
          </p>
        </div>

        <!-- ملاحظة: نستخدم window.showAddDeviceForm -->
        <button class="btn btn-primary" onclick="window.showAddDeviceForm()">
          <i class="fas fa-plus"></i>
          <span>Add Device</span>
        </button>
      </div>

      <!-- كونتينر الأجهزة -->
      <div style="
        background:#f9fafb;
        border-radius:24px;
        padding:24px 24px 28px;
        border:1px solid #e5e7eb;
        box-shadow:0 18px 40px rgba(15,23,42,0.15);
        max-width:1200px;
        margin:0 auto;
      ">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          ${AppState.devices.map(device => `
            <div class="device-card" style="
              border-radius:20px;
              background:#ffffff;
              padding:20px 22px 18px;
              box-shadow:0 10px 26px rgba(15,23,42,0.08);
              border:1px solid #e5e7eb;
            ">
              <!-- header -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center">
                    <i class="fas fa-microchip text-emerald-600"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-800">${device.name}</h3>
                    <p class="text-xs text-gray-500 mt-1">${device.serial}</p>
                  </div>
                </div>
                <span class="badge active text-xs px-3 py-1">ACTIVE</span>
              </div>

              <!-- info blocks -->
              <div class="flex flex-wrap gap-4 mb-5">
                <div class="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 min-w-[110px]">
                  <p class="text-[11px] uppercase tracking-wide text-gray-500">Power Type</p>
                  <p class="text-sm font-semibold capitalize mt-1">${device.powerType}</p>
                </div>
                <div class="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 min-w-[110px]">
                  <p class="text-[11px] uppercase tracking-wide text-gray-500">Battery</p>
                  <p class="text-sm font-semibold mt-1">${device.battery}%</p>
                </div>
                <div class="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 min-w-[120px]">
                  <p class="text-[11px] uppercase tracking-wide text-gray-500">Last Seen</p>
                  <p class="text-sm font-semibold mt-1">${device.lastSeen}</p>
                </div>
              </div>

              <!-- battery bar -->
              <div class="mb-5">
                <div class="progress-bar">
                  <div class="progress-fill ${
                    device.battery < 30 ? 'low'
                    : device.battery < 60 ? 'medium'
                    : 'high'
                  }" style="width: ${device.battery}%;"></div>
                </div>
              </div>

              <!-- sensors -->
              <div>
                <p class="text-xs font-semibold text-gray-500 mb-2">Sensors</p>
                <div class="flex flex-wrap gap-2">
                  ${device.sensors.map(sensor => `
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs text-emerald-700">
                      <i class="fas fa-circle text-[8px]"></i>
                      <span>${sensor.type}</span>
                      <span class="font-semibold uppercase text-[10px]">ACTIVE</span>
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}


// ======================
// Alerts Page
// ======================
function renderAlerts() {
  return `
    <div class="space-y-6 fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Alerts & Notifications</h1>
          <p class="text-sm text-gray-500 mt-1">
            Keep track of important changes in your plants and devices.
          </p>
        </div>
      </div>

      <!-- الفلاتر -->
      <div class="flex space-x-4">
        <button class="btn btn-primary">All</button>
        <button class="btn btn-secondary">Active</button>
        <button class="btn btn-secondary">Resolved</button>
      </div>

      <!-- كونتينر كبير للكروت -->
      <div style="
        background:#f9fafb;
        border-radius:24px;
        padding:24px 24px 28px;
        border:1px solid #e5e7eb;
        box-shadow:0 18px 40px rgba(15,23,42,0.15);
        max-width:1100px;
        margin:18px auto 0;
      ">
        <div class="space-y-4">
          ${AppState.alerts.map(alert => `
            <div
              class="alert-card ${alert.severity}"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <span
                    class="badge ${alert.severity} text-xs px-3 py-1"
                  >
                    ${alert.type.replace(/_/g, ' ')}
                  </span>
                  <span class="text-xs text-gray-500">${alert.time}</span>
                </div>

                ${
                  !alert.resolved
                    ? `
                      <button
                        onclick="resolveAlertById(${alert.id})"
                        class="btn btn-primary text-sm"
                        style="padding:8px 18px;border-radius:9999px;"
                      >
                        Mark Resolved
                      </button>
                    `
                    : `
                      <span class="text-green-600 flex items-center space-x-1 text-sm">
                        <i class="fas fa-check-circle"></i>
                        <span>Resolved</span>
                      </span>
                    `
                }
              </div>

              <div>
                <h3 class="text-lg md:text-xl font-semibold text-gray-800">
                  ${alert.plant}
                </h3>
                <p class="text-sm md:text-base text-gray-600 mt-1">
                  ${alert.message}
                </p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ======================
// History Page
// ======================
function renderHistory() {
  return `
    <div class="space-y-6 fade-in">
      <h1 class="text-3xl font-bold text-gray-800">Historical Data</h1>

      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="form-label">Select Plant</label>
            <select class="form-input">
              <option>All Plants</option>
              ${AppState.plants.map(p => `<option value="${p.id}">${p.nickname}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Time Range</label>
            <select class="form-input">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Custom</option>
            </select>
          </div>
          <div>
            <label class="form-label">Sensor Type</label>
            <select class="form-input">
              <option>All Sensors</option>
              <option>Moisture</option>
              <option>Temperature</option>
              <option>Light</option>
            </select>
          </div>
        </div>

        <div class="chart-container">
          <canvas id="historyChart"></canvas>
        </div>

        <div class="mt-6 grid grid-cols-4 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Avg Moisture</p>
            <p class="text-2xl font-bold text-blue-600">58.3%</p>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Avg Temperature</p>
            <p class="text-2xl font-bold text-red-600">24.7°C</p>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Avg Light</p>
            <p class="text-2xl font-bold text-yellow-600">756 lux</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Data Points</p>
            <p class="text-2xl font-bold text-green-600">1,234</p>
          </div>
        </div>

        <button class="btn btn-primary mt-6">
          <i class="fas fa-download"></i>
          <span>Export to CSV</span>
        </button>
      </div>
    </div>
  `;
}

// ======================
// Settings Page (نهائي بعد التعديل)
// ======================
function renderSettings() {
  const user = AppState.user || {};
  const fullName = user.name || "";
  const email = user.email || "";

  return `
    <div class="space-y-6 fade-in settings-page">
      <h1 class="text-3xl font-bold text-gray-800">Settings</h1>
      <p class="text-sm text-gray-500">
        Manage your profile, notifications, thresholds and system preferences.
      </p>

      <div class="settings-columns">
        <!-- Profile Settings -->
        <div class="dashboard-card settings-card">
          <h2 class="settings-title">Profile Settings</h2>

          <div class="settings-group">
            <label class="settings-label">Full Name</label>
            <input
              type="text"
              class="settings-input"
              value="${fullName}"
              placeholder="Enter your name"
            >
          </div>

          <div class="settings-group">
            <label class="settings-label">Email</label>
            <input
              type="email"
              class="settings-input"
              value="${email}"
              placeholder="you@example.com"
            >
          </div>

          <div class="settings-group">
            <label class="settings-label">Password</label>
            <input
              type="password"
              class="settings-input"
              placeholder="••••••••"
            >
          </div>

          <button class="btn btn-primary settings-btn">
            Update Profile
          </button>
        </div>

        <!-- Notification Preferences (رجعناه زي أول، بسيط وواضح) -->
        <div class="dashboard-card settings-card">
          <h2 class="settings-title">Notification Preferences</h2>
          <div class="space-y-4 mt-2">

            <div class="flex items-center justify-between">
              <span class="settings-toggle-text">Email Notifications</span>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <span class="settings-toggle-text">Push Notifications</span>
              <label class="toggle-switch">
                <input type="checkbox" checked>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="flex items-center justify-between">
              <span class="settings-toggle-text">SMS Alerts</span>
              <label class="toggle-switch">
                <input type="checkbox">
                <span class="toggle-slider"></span>
              </label>
            </div>

          </div>
        </div>

        <!-- Default Thresholds -->
        <div class="dashboard-card settings-card">
          <h2 class="settings-title">Default Thresholds</h2>

          <div class="settings-group">
            <label class="settings-label">Minimum Soil Moisture (%)</label>
            <input type="number" class="settings-input" value="40">
          </div>

          <div class="settings-group">
            <label class="settings-label">Maximum Temperature (°C)</label>
            <input type="number" class="settings-input" value="30">
          </div>

          <div class="settings-group">
            <label class="settings-label">Minimum Light (lux)</label>
            <input type="number" class="settings-input" value="500">
          </div>

          <button class="btn btn-primary settings-btn">
            Save Defaults
          </button>
        </div>

        <!-- System Preferences -->
        <div class="dashboard-card settings-card">
          <h2 class="settings-title">System Preferences</h2>

          <div class="settings-group">
            <label class="settings-label">Temperature Unit</label>
            <select class="settings-input">
              <option>Celsius (°C)</option>
              <option>Fahrenheit (°F)</option>
            </select>
          </div>

          <div class="settings-group">
            <label class="settings-label">Data Retention</label>
            <select class="settings-input">
              <option>30 Days</option>
              <option>90 Days</option>
              <option>1 Year</option>
              <option>Forever</option>
            </select>
          </div>

          <div class="settings-group">
            <label class="settings-label">Auto-Refresh Interval</label>
            <select class="settings-input">
              <option>30 seconds</option>
              <option>1 minute</option>
              <option>5 minutes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;
}
// ======================
// Add Plant Modal
// ======================
function showAddPlantForm() {
  // إذا فيه ديف قديم للمودال احذفيه
  const oldModal = document.getElementById('add-plant-modal');
  if (oldModal) oldModal.remove();

  const modalHtml = `
    <div id="add-plant-modal" style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    ">
      <div style="
        background:#ffffff;
        border-radius:20px;
        padding:32px 32px 24px;
        width:100%;
        max-width:480px;
        box-shadow:0 20px 50px rgba(15,23,42,0.35);
        font-family:'Poppins',sans-serif;
      ">
        <h2 style="font-size:1.6rem;font-weight:700;color:#14532d;margin-bottom:18px;">
          Add New Plant 🌱
        </h2>

        <form id="add-plant-form">
          <div style="margin-bottom:14px;">
            <label style="display:block;margin-bottom:6px;font-size:0.9rem;font-weight:600;color:#4b5563;">
              Plant Nickname
            </label>
            <input id="plant-nickname" type="text" required
              style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #d1d5db;font-size:0.95rem;outline:none;">
          </div>

          <div style="margin-bottom:14px;">
            <label style="display:block;margin-bottom:6px;font-size:0.9rem;font-weight:600;color:#4b5563;">
              Species
            </label>
            <input id="plant-species" type="text" required
              style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #d1d5db;font-size:0.95rem;outline:none;">
          </div>

          <div style="margin-bottom:14px;">
            <label style="display:block;margin-bottom:6px;font-size:0.9rem;font-weight:600;color:#4b5563;">
              Emoji
            </label>
            <input id="plant-emoji" type="text" value="🌱" maxlength="2"
              style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #d1d5db;font-size:1.5rem;text-align:center;outline:none;">
          </div>

          <div style="margin-bottom:18px;">
            <label style="display:block;margin-bottom:6px;font-size:0.9rem;font-weight:600;color:#4b5563;">
              Description (optional)
            </label>
            <textarea id="plant-description" rows="3"
              style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #d1d5db;font-size:0.95rem;resize:vertical;outline:none;"></textarea>
          </div>

          <div style="display:flex;gap:10px;margin-top:4px;">
            <button type="submit" style="
              flex:1;
              border:none;
              border-radius:9999px;
              padding:11px 0;
              font-weight:600;
              font-size:0.95rem;
              cursor:pointer;
              color:#ffffff;
              background:linear-gradient(135deg,#10b981,#059669);
              box-shadow:0 10px 25px rgba(16,185,129,0.4);
            ">
              Add Plant
            </button>
            <button type="button" id="cancel-add-plant" style="
              flex:1;
              border:none;
              border-radius:9999px;
              padding:11px 0;
              font-weight:600;
              font-size:0.95rem;
              cursor:pointer;
              color:#374151;
              background:#e5e7eb;
            ">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // زر الإلغاء
  document.getElementById('cancel-add-plant').addEventListener('click', () => {
    document.getElementById('add-plant-modal').remove();
  });

  // سبمت الفورم
  document.getElementById('add-plant-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nickname = document.getElementById('plant-nickname').value.trim();
    const species  = document.getElementById('plant-species').value.trim();
    const emoji    = document.getElementById('plant-emoji').value.trim() || '🌱';
    const desc     = document.getElementById('plant-description').value.trim();

    if (!nickname || !species) return;

    const plantData = { nickname, species, emoji, description: desc };

    // لو عندك دالة addNewPlant من dashboard-integration.js استخدمها
    if (typeof addNewPlant === 'function') {
      await addNewPlant(plantData);
    } else {
      // fallback: إضافة محلية في AppState فقط
      const newId = AppState.plants.length
        ? Math.max(...AppState.plants.map(p => p.id)) + 1
        : 1;

      AppState.plants.push({
        id: newId,
        nickname,
        species,
        emoji,
        status: 'healthy',
        moisture: 60,
        temp: 24,
        light: 800,
        lastWatered: 'Just now'
      });
      renderPageContent('plants');
    }

    document.getElementById('add-plant-modal').remove();
  });
}


// ======================
// Add Device Modal
// ======================
window.showAddDeviceForm = function () {
  // لو فيه مودال قديم احذفيه
  const oldModal = document.getElementById('add-device-modal');
  if (oldModal) oldModal.remove();

  const modalHtml = `
    <div id="add-device-modal" style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
    ">
      <div style="
        background:#ffffff;
        border-radius:20px;
        padding:32px 32px 24px;
        width:100%;
        max-width:500px;
        box-shadow:0 20px 50px rgba(15,23,42,0.35);
        font-family:'Poppins',sans-serif;
      ">
        <h2 style="font-size:1.6rem;font-weight:700;color:#14532d;margin-bottom:18px;">
          Add New Device 📡
        </h2>

        <form id="add-device-form">
          <div style="margin-bottom:14px;">
            <label style="display:block;margin-bottom:6px;font-size:0.9rem;font-weight:600;color:#4b5563;">
              Device Name
            </label>
            <input id="device-name" type="text" required
              style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #d1d5db;font-size:0.95rem;outline:none;">
          </div>

          <div style="margin-bottom:14px;">
            <label style="display:block;margin-bottom:6px;font-size:0.9rem;font-weight:600;color:#4b5563;">
              Serial Number
            </label>
            <input id="device-serial" type="text" required
              style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #d1d5db;font-size:0.95rem;outline:none;">
          </div>

          <div style="margin-bottom:14px;">
            <label style="display:block;margin-bottom:6px;font-size:0.9rem;font-weight:600;color:#4b5563;">
              Power Type
            </label>
            <select id="device-power" required
              style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #d1d5db;font-size:0.95rem;outline:none;">
              <option value="battery">Battery</option>
              <option value="solar">Solar</option>
              <option value="wired">Wired</option>
            </select>
          </div>

          <div style="margin-bottom:18px;">
            <label style="display:block;margin-bottom:6px;font-size:0.9rem;font-weight:600;color:#4b5563;">
              Initial Battery (%)
            </label>
            <input id="device-battery" type="number" min="0" max="100" value="80"
              style="width:100%;padding:10px 12px;border-radius:10px;border:1px solid #d1d5db;font-size:0.95rem;outline:none;">
          </div>

          <div style="display:flex;gap:10px;margin-top:4px;">
            <button type="submit" style="
              flex:1;
              border:none;
              border-radius:9999px;
              padding:11px 0;
              font-weight:600;
              font-size:0.95rem;
              cursor:pointer;
              color:#ffffff;
              background:linear-gradient(135deg,#10b981,#059669);
              box-shadow:0 10px 25px rgba(16,185,129,0.4);
            ">
              Add Device
            </button>
            <button type="button" id="cancel-add-device" style="
              flex:1;
              border:none;
              border-radius:9999px;
              padding:11px 0;
              font-weight:600;
              font-size:0.95rem;
              cursor:pointer;
              color:#374151;
              background:#e5e7eb;
            ">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // زر الإلغاء
  document.getElementById('cancel-add-device').addEventListener('click', () => {
    const modal = document.getElementById('add-device-modal');
    if (modal) modal.remove();
  });

  // سبمت الفورم
  document.getElementById('add-device-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const name   = document.getElementById('device-name').value.trim();
    const serial = document.getElementById('device-serial').value.trim();
    const power  = document.getElementById('device-power').value;
    const battery = Number(document.getElementById('device-battery').value || 80);

    if (!name || !serial) return;

    const newId = AppState.devices.length
      ? Math.max(...AppState.devices.map(d => d.id)) + 1
      : 1;

    // نضيف الجهاز الجديد لـ AppState
    AppState.devices.push({
      id: newId,
      name,
      serial,
      powerType: power,
      battery,
      lastSeen: 'Just now',
      sensors: [
        { type: 'Soil Moisture' },
        { type: 'Temperature' },
        { type: 'Light' },
      ]
    });

    // نرجّع عرض صفحة الأجهزة
    if (typeof renderPageContent === 'function') {
      renderPageContent('devices');
    }

    const modal = document.getElementById('add-device-modal');
    if (modal) modal.remove();
  });
};