// ======================================================
// SmartAgro - Dashboard Backend Integration (Clean)
// ======================================================

const BACKEND_URL = "http://127.0.0.1:8000";

// تأكيد وجود AppState و window.api
window.AppState = window.AppState || {
  plants: [],
  devices: [],
  alerts: [],
  historyData: [],
  currentPage: "dashboard",
};

window.api = window.api || {};

// -----------------------------
// Auth helper بسيط
// -----------------------------
window.api.isAuthenticated = window.api.isAuthenticated || function () {
  return !!(
    localStorage.getItem("smartagro_token") ||
    sessionStorage.getItem("userData")
  );
};

// ======================================================
//            PLANTS  (باك إند + فرونت)
// ======================================================

window.api.getPlants = async function () {
  const resp = await fetch(`${BACKEND_URL}/api/plants`);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return { success: true, plants: data };
};

window.api.addPlant = async function (plantData) {
  const payload = {
    nickname: plantData.nickname,
    species: plantData.species,
    moisture: plantData.moisture ?? 55,
    temp: plantData.temp ?? 24,
    light: plantData.light ?? 800,
  };

  const resp = await fetch(`${BACKEND_URL}/api/plants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const created = await resp.json();
  return { success: true, plant: created };
};

window.api.updatePlant = async function (plantId, updates) {
  // حالياً تعديل محلي بس
  AppState.plants = AppState.plants.map((p) =>
    p.id === plantId ? { ...p, ...updates } : p
  );
  return { success: true };
};

window.api.deletePlant = async function (plantId) {
  // حالياً حذف محلي بس
  AppState.plants = AppState.plants.filter((p) => p.id !== plantId);
  return { success: true };
};

// ======================================================
//            DEVICES  (باك إند + فرونت)
// ======================================================

// قراءة الأجهزة من الباك إند
window.api.getDevices = async function () {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/devices`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    const devices = data.map((d) => ({
      id: d.id,
      name: d.name,
      location: d.location,
      status: d.status === "online" ? "active" : "offline",
      battery: d.battery,
      lastSeen: d.last_seen || "just now",
      powerType: "battery",
      serial: `SA-${String(d.id).padStart(4, "0")}`,
      sensors: [
        { type: "Soil Moisture", status: "active" },
        { type: "Temperature", status: "active" },
      ],
    }));

    return { success: true, devices };
  } catch (err) {
    console.warn("getDevices failed, fallback to local AppState:", err);
    return { success: true, devices: AppState.devices || [] };
  }
};

// إضافة جهاز جديد
window.api.addDevice = async function (deviceData) {
  const payload = {
    name: deviceData.name,
    location: deviceData.location || "Custom",
    status: "online",
    battery: deviceData.battery ?? 80,
    moisture: null,
    temp: null,
    light: null,
  };

  try {
    const resp = await fetch(`${BACKEND_URL}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const created = await resp.json();

    const device = {
      id: created.id,
      name: created.name,
      location: created.location,
      status: created.status === "online" ? "active" : "offline",
      battery: created.battery,
      lastSeen: created.last_seen || "just now",
      powerType: deviceData.powerType,
      serial: deviceData.serial,
      sensors: [
        { type: "Soil Moisture", status: "active" },
        { type: "Temperature", status: "active" },
      ],
    };

    return { success: true, device };
  } catch (err) {
    // لو الباك إند طاح نخزّن محلي فقط
    console.warn("addDevice failed, local fallback:", err);
    const fallback = {
      id: Date.now(),
      name: deviceData.name,
      location: deviceData.location || "Custom",
      status: "active",
      battery: deviceData.battery ?? 80,
      lastSeen: "just now",
      powerType: deviceData.powerType,
      serial: deviceData.serial,
      sensors: [
        { type: "Soil Moisture", status: "active" },
        { type: "Temperature", status: "active" },
      ],
    };
    AppState.devices.push(fallback);
    return { success: true, device: fallback };
  }
};

// ======================================================
//            ALERTS (بسيطة)
// ======================================================

window.api.getAlerts = async function () {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/alerts`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    return { success: true, alerts: data };
  } catch (err) {
    console.warn("getAlerts failed, fallback:", err);
    return { success: true, alerts: AppState.alerts || [] };
  }
};

window.api.resolveAlert = async function (alertId) {
  AppState.alerts = AppState.alerts.filter((a) => a.id !== alertId);
  return { success: true };
};

// ======================================================
//       High-level helpers تستخدمها الواجهة
// ======================================================

async function loadPlantsFromBackend() {
  try {
    const response = await window.api.getPlants();
    if (response.success && response.plants) {
      AppState.plants = response.plants;
      if (
        AppState.currentPage === "plants" ||
        AppState.currentPage === "dashboard"
      ) {
        renderPageContent(AppState.currentPage);
      }
    }
  } catch (error) {
    console.error("Error loading plants:", error);
    showNotification("Failed to load plants: " + error.message, "error");
  }
}

async function loadDevicesFromBackend() {
  try {
    const response = await window.api.getDevices();
    if (response.success && response.devices) {
      AppState.devices = response.devices;
      if (AppState.currentPage === "devices") {
        renderPageContent("devices");
      }
    }
  } catch (error) {
    console.error("Error loading devices:", error);
    showNotification("Failed to load devices: " + error.message, "error");
  }
}

async function loadAlertsFromBackend() {
  try {
    const response = await window.api.getAlerts();
    if (response.success && response.alerts) {
      AppState.alerts = response.alerts;
      if (
        AppState.currentPage === "alerts" ||
        AppState.currentPage === "dashboard"
      ) {
        renderPageContent(AppState.currentPage);
      }
    }
  } catch (error) {
    console.error("Error loading alerts:", error);
    showNotification("Failed to load alerts: " + error.message, "error");
  }
}

// --------- Add New Plant ----------
async function addNewPlant(plantData) {
  try {
    const response = await window.api.addPlant(plantData);
    if (response.success) {
      showNotification("Plant added successfully! 🌱", "success");
      triggerCuteSuccess("plant");
      await loadPlantsFromBackend();
      navigateToPage("plants");
    }
  } catch (error) {
    console.error("Failed to add plant:", error);
    showNotification("Failed to add plant: " + error.message, "error");
  }
}

// ==================== Add NEW DEVICE (connected to backend / mock) ====================

async function addNewDevice(deviceData) {
  try {
    // لو عندك باك إند حقيقي:
    if (window.api && typeof window.api.addDevice === "function") {
      const response = await window.api.addDevice(deviceData);

      if (response && response.success) {
        showNotification("Device added successfully! 📡", "success");
        triggerCuteSuccess("device");

        // نحدّث الأجهزة من الباك إند
        await loadDevicesFromBackend();
        navigateToPage("devices");
        return;
      } else {
        showNotification(
          (response && response.message) || "Failed to add device (server error).",
          "error"
        );
        return;
      }
    }

    // ✨ في حالة ما عندك باك إند – نضيفه لوكال في AppState فقط
    const newDevice = {
      id: Date.now(),
      name: deviceData.name,
      serial: deviceData.serial,
      powerType: deviceData.powerType,
      battery: deviceData.battery,
      status: "active",
      lastSeen: "just now",
      sensors: [
        { type: "Soil Moisture", status: "active" },
        { type: "Temperature", status: "active" },
      ],
    };

    AppState.devices.push(newDevice);
    showNotification("Device added locally ✅", "success");
    triggerCuteSuccess("device");
    renderPageContent("devices");

  } catch (error) {
    console.error("Error adding device:", error);
    showNotification("Failed to add device: " + error.message, "error");
  }
}

// ======================================================
//        Notifications + Loading + Auth
// ======================================================

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 16px 24px;
    background: ${
      type === "success"
        ? "#10B981"
        : type === "error"
        ? "#EF4444"
        : "#3B82F6"
    };
    color: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 10000;
    font-weight: 600;
    max-width: 400px;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function checkAuthentication() {
  if (!window.api.isAuthenticated()) {
    if (
      window.location.pathname.includes("dashboard") ||
      window.location.pathname.includes("welcome")
    ) {
      window.location.href = "login.html";
    }
    return false;
  }
  return true;
}

async function loadAllDataFromBackend() {
  if (!checkAuthentication()) return;
  try {
    await Promise.all([
      loadPlantsFromBackend(),
      loadDevicesFromBackend(),
      loadAlertsFromBackend(),
    ]);
  } catch (e) {
    console.error(e);
    showNotification("Failed to load data from server", "error");
  }
}

// ======================================================
//        Modals (Add Plant / Add Device)
// ======================================================

function showAddPlantForm() {
  const formHTML = `
    <div id="add-plant-modal" style="
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.6);
      display:flex;align-items:center;justify-content:center;
      z-index:10000;
    ">
      <div style="background:white;padding:40px;border-radius:20px;max-width:500px;width:90%;">
        <h2 style="margin-bottom:25px;color:#2d6a4f;font-size:1.8rem;">Add New Plant 🌱</h2>
        <form id="add-plant-form">
          <div style="margin-bottom:20px;">
            <label style="display:block;margin-bottom:8px;font-weight:600;">Plant Nickname</label>
            <input type="text" id="plant-nickname" required style="width:100%;padding:12px;border-radius:10px;border:2px solid #e5e7eb;">
          </div>
          <div style="margin-bottom:20px;">
            <label style="display:block;margin-bottom:8px;font-weight:600;">Species</label>
            <input type="text" id="plant-species" required style="width:100%;padding:12px;border-radius:10px;border:2px solid #e5e7eb;">
          </div>
          <div style="margin-bottom:20px;">
            <label style="display:block;margin-bottom:8px;font-weight:600;">Emoji</label>
            <input type="text" id="plant-emoji" value="🌱" maxlength="2" style="width:100%;padding:12px;border-radius:10px;border:2px solid #e5e7eb;font-size:1.5rem;text-align:center;">
          </div>
          <div style="margin-bottom:25px;">
            <label style="display:block;margin-bottom:8px;font-weight:600;">Description</label>
            <textarea id="plant-description" rows="3" style="width:100%;padding:12px;border-radius:10px;border:2px solid #e5e7eb;"></textarea>
          </div>
          <div style="display:flex;gap:12px;">
            <button type="submit" style="flex:1;background:#10B981;color:white;padding:14px;border:none;border-radius:10px;font-weight:700;">Add Plant</button>
            <button type="button" onclick="document.getElementById('add-plant-modal').remove()" style="flex:1;background:#e5e7eb;color:#374151;padding:14px;border:none;border-radius:10px;font-weight:700;">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", formHTML);
  document
    .getElementById("add-plant-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const plantData = {
        nickname: document.getElementById("plant-nickname").value,
        species: document.getElementById("plant-species").value,
        emoji: document.getElementById("plant-emoji").value || "🌱",
        description: document.getElementById("plant-description").value,
      };
      await addNewPlant(plantData);
      document.getElementById("add-plant-modal").remove();
    });
}

// نموذج إضافة جهاز جديد
function showAddDeviceForm() {
  const formHTML = `
    <div id="add-device-modal" style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s;
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 20px;
        max-width: 520px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        font-family:'Poppins',sans-serif;
      ">
        <h2 style="margin-bottom: 25px; color: #2d6a4f; font-size: 1.8rem;">
          Add New Device 📡
        </h2>

        <form id="add-device-form">
          <div style="margin-bottom: 16px;">
            <label style="display:block; margin-bottom:6px; font-weight:600; color:#374151;">
              Device Name
            </label>
            <input type="text" id="device-name" required
              style="width:100%; padding:10px 12px; border-radius:10px; border:2px solid #e5e7eb; font-size:0.95rem;">
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display:block; margin-bottom:6px; font-weight:600; color:#374151;">
              Serial Number
            </label>
            <input type="text" id="device-serial" required
              style="width:100%; padding:10px 12px; border-radius:10px; border:2px solid #e5e7eb; font-size:0.95rem;">
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display:block; margin-bottom:6px; font-weight:600; color:#374151;">
              Power Type
            </label>
            <select id="device-power" required
              style="width:100%; padding:10px 12px; border-radius:10px; border:2px solid #e5e7eb; font-size:0.95rem;">
              <option value="battery">Battery</option>
              <option value="solar">Solar</option>
              <option value="wired">Wired</option>
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display:block; margin-bottom:6px; font-weight:600; color:#374151;">
              Initial Battery (%)
            </label>
            <input type="number" id="device-battery" min="0" max="100" value="80"
              style="width:100%; padding:10px 12px; border-radius:10px; border:2px solid #e5e7eb; font-size:0.95rem;">
          </div>

          <div style="display:flex; gap:12px; margin-top:10px;">
            <button type="submit" style="
              flex:1;
              background: linear-gradient(135deg,#10b981,#059669);
              color:white;
              padding:12px;
              border:none;
              border-radius:10px;
              font-weight:700;
              cursor:pointer;
            ">
              Add Device
            </button>
            <button type="button" onclick="document.getElementById('add-device-modal').remove()" style="
              flex:1;
              background:#e5e7eb;
              color:#374151;
              padding:12px;
              border:none;
              border-radius:10px;
              font-weight:700;
              cursor:pointer;
            ">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', formHTML);

  const form = document.getElementById('add-device-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const deviceData = {
      name: document.getElementById('device-name').value,
      serial: document.getElementById('device-serial').value,
      powerType: document.getElementById('device-power').value,
      battery: Number(document.getElementById('device-battery').value || 80),
    };

    await addNewDevice(deviceData);
    const modal = document.getElementById('add-device-modal');
    if (modal) modal.remove();
  });
}