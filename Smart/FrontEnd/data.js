// data.js - Mock Data Generator and State Management

// Application State
const AppState = {
    currentPage: 'dashboard',
    selectedPlant: null,
    plants: [],
    devices: [],
    alerts: [],
    historyData: [],
    user: {
    name: localStorage.getItem("username") || "SmartAgro User",
    email: localStorage.getItem("userEmail") || "user@smartagro.com",
    // ...
  },
  // باقي الـ state
};

// Initialize Mock Data
function initializeMockData() {
    AppState.plants = [
        { 
            id: 1, 
            nickname: "Mint on Balcony", 
            species: "Mentha spicata", 
            status: "healthy", 
            emoji: "🌿", 
            moisture: 65, 
            temp: 24, 
            light: 850, 
            lastWatered: "2 hours ago",
            description: "Fresh mint plant for tea and cooking"
        },
        { 
            id: 2, 
            nickname: "Basil Indoor", 
            species: "Ocimum basilicum", 
            status: "warning", 
            emoji: "🌱", 
            moisture: 35, 
            temp: 26, 
            light: 650, 
            lastWatered: "1 day ago",
            description: "Italian basil for pasta dishes"
        },
        { 
            id: 3, 
            nickname: "Tomato Garden", 
            species: "Solanum lycopersicum", 
            status: "healthy", 
            emoji: "🍅", 
            moisture: 70, 
            temp: 23, 
            light: 920, 
            lastWatered: "3 hours ago",
            description: "Cherry tomato plant"
        },
        { 
            id: 4, 
            nickname: "Cactus Corner", 
            species: "Cactaceae", 
            status: "healthy", 
            emoji: "🌵", 
            moisture: 20, 
            temp: 28, 
            light: 1100, 
            lastWatered: "5 days ago",
            description: "Desert cactus requiring minimal water"
        }
    ];

    AppState.devices = [
        { 
            id: 1, 
            name: "Balcony Sensor Kit", 
            serial: "SA-001-XY2Z", 
            status: "active", 
            powerType: "solar", 
            battery: 85, 
            lastSeen: "2 min ago",
            sensors: [
                { type: "Soil Moisture", unit: "%", status: "active" },
                { type: "Temperature", unit: "°C", status: "active" },
                { type: "Light", unit: "lux", status: "active" }
            ]
        },
        { 
            id: 2, 
            name: "Indoor Monitor Pro", 
            serial: "SA-002-AB3C", 
            status: "active", 
            powerType: "battery", 
            battery: 62, 
            lastSeen: "5 min ago",
            sensors: [
                { type: "Soil Moisture", unit: "%", status: "active" },
                { type: "Temperature", unit: "°C", status: "active" },
                { type: "Humidity", unit: "%", status: "active" }
            ]
        },
        { 
            id: 3, 
            name: "Garden Hub", 
            serial: "SA-003-CD4D", 
            status: "active", 
            powerType: "wired", 
            battery: 100, 
            lastSeen: "1 min ago",
            sensors: [
                { type: "Soil Moisture", unit: "%", status: "active" },
                { type: "Temperature", unit: "°C", status: "active" },
                { type: "Light", unit: "lux", status: "active" },
                { type: "pH Level", unit: "pH", status: "active" }
            ]
        }
    ];

    AppState.alerts = [
        { 
            id: 1, 
            type: "LOW_MOISTURE", 
            severity: "warning", 
            plant: "Basil Indoor", 
            plantId: 2,
            message: "Soil moisture is below 40%. Water your plant soon.", 
            time: "10 min ago", 
            timestamp: Date.now() - 600000,
            resolved: false 
        },
        { 
            id: 2, 
            type: "HIGH_TEMPERATURE", 
            severity: "info", 
            plant: "Cactus Corner", 
            plantId: 4,
            message: "Temperature is optimal for growth.", 
            time: "1 hour ago", 
            timestamp: Date.now() - 3600000,
            resolved: true 
        },
        { 
            id: 3, 
            type: "LOW_LIGHT", 
            severity: "critical", 
            plant: "Mint on Balcony", 
            plantId: 1,
            message: "Light levels are insufficient. Consider relocating.", 
            time: "2 hours ago", 
            timestamp: Date.now() - 7200000,
            resolved: false 
        },
        { 
            id: 4, 
            type: "FERTILIZER_REMINDER", 
            severity: "info", 
            plant: "Tomato Garden", 
            plantId: 3,
            message: "Time to fertilize your tomato plant.", 
            time: "5 hours ago", 
            timestamp: Date.now() - 18000000,
            resolved: false 
        }
    ];

    // Generate 24 hours of history data
    AppState.historyData = generateHistoryData(24);
}

// Generate historical sensor data
function generateHistoryData(hours) {
    const data = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
        const time = new Date(now - i * 3600000);
        data.push({
            timestamp: time,
            time: `${time.getHours()}:00`,
            moisture: 45 + Math.random() * 30,
            temperature: 20 + Math.random() * 8,
            light: 400 + Math.random() * 600,
            humidity: 40 + Math.random() * 30
        });
    }
    
    return data;
}

// Simulate real-time sensor updates
function simulateRealtimeUpdates() {
    setInterval(() => {
        AppState.plants = AppState.plants.map(plant => ({
            ...plant,
            moisture: Math.max(0, Math.min(100, plant.moisture + (Math.random() - 0.5) * 3)),
            temp: Math.max(15, Math.min(35, plant.temp + (Math.random() - 0.5) * 1)),
            light: Math.max(0, Math.min(1500, plant.light + (Math.random() - 0.5) * 30))
        }));

        // Update plant status based on moisture
        AppState.plants.forEach(plant => {
            if (plant.moisture < 40) {
                plant.status = "warning";
            } else {
                plant.status = "healthy";
            }
        });

        if (AppState.currentPage === 'dashboard') {
            updateDashboardData();
        } else if (AppState.currentPage === 'plant-detail' && AppState.selectedPlant) {
            const updatedPlant = AppState.plants.find(p => p.id === AppState.selectedPlant.id);
            if (updatedPlant) {
                AppState.selectedPlant = updatedPlant;
                updatePlantDetailData();
            }
        }
    }, 5000);
}

// Helpers
function getStatistics() {
    return {
        totalPlants: AppState.plants.length,
        activeDevices: AppState.devices.filter(d => d.status === 'active').length,
        activeAlerts: AppState.alerts.filter(a => !a.resolved).length,
        healthyPlants: AppState.plants.filter(p => p.status === 'healthy').length
    };
}

function getPlantById(id) {
    return AppState.plants.find(p => p.id === id);
}

function getDeviceById(id) {
    return AppState.devices.find(d => d.id === id);
}

function resolveAlert(alertId) {
    const alert = AppState.alerts.find(a => a.id === alertId);
    if (alert) {
        alert.resolved = true;
        alert.resolvedAt = new Date();
    }
}

function addPlant(plantData) {
    const newPlant = {
        id: AppState.plants.length + 1,
        ...plantData,
        status: 'healthy'
    };
    AppState.plants.push(newPlant);
    return newPlant;
}

function updatePlant(plantId, updates) {
    const plantIndex = AppState.plants.findIndex(p => p.id === plantId);
    if (plantIndex !== -1) {
        AppState.plants[plantIndex] = {
            ...AppState.plants[plantIndex],
            ...updates
        };
        return AppState.plants[plantIndex];
    }
    return null;
}

function deletePlant(plantId) {
    AppState.plants = AppState.plants.filter(p => p.id !== plantId);
}

