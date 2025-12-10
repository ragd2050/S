// app.js - Main Application Logic

// Initialize application on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('SmartAgro application starting...');
    
    // Initialize mock data
    initializeMockData();
    
    // Setup navigation
    setupNavigation();
    
    // Load initial page
    navigateToPage('dashboard');
    
    // Start real-time updates
    simulateRealtimeUpdates();
    
    console.log('SmartAgro application loaded successfully!');
});

// Setup Navigation
function setupNavigation() {
    const sidebarButtons = document.querySelectorAll('.sidebar-btn');
    
    sidebarButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
}

// Navigate to Page
function navigateToPage(page) {
    AppState.currentPage = page;
    
    // Update active sidebar button
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-page') === page) {
            btn.classList.add('active');
        }
    });
    
    // Render page content
    renderPageContent(page);
}

// Render Page Content
function renderPageContent(page) {
    const mainContent = document.getElementById('mainContent');
    
    let content = '';
    
    switch(page) {
        case 'dashboard':
            content = renderDashboard();
            mainContent.innerHTML = content;
            setTimeout(initDashboardChart, 100);
            break;
        case 'plants':
            content = renderPlants();
            mainContent.innerHTML = content;
            break;
        case 'plant-detail':
            content = renderPlantDetail();
            mainContent.innerHTML = content;
            setTimeout(initPlantDetailChart, 100);
            break;
        case 'devices':
            content = renderDevices();
            mainContent.innerHTML = content;
            break;
        case 'alerts':
            content = renderAlerts();
            mainContent.innerHTML = content;
            break;
        case 'history':
            content = renderHistory();
            mainContent.innerHTML = content;
            setTimeout(initHistoryChart, 100);
            break;
        case 'settings':
            content = renderSettings();
            mainContent.innerHTML = content;
            break;
        default:
            content = renderDashboard();
            mainContent.innerHTML = content;
    }
}

// View Plant Detail
function viewPlantDetail(plantId) {
    const plant = getPlantById(plantId);
    if (plant) {
        AppState.selectedPlant = plant;
        navigateToPage('plant-detail');
    }
}

// Resolve Alert
function resolveAlertById(alertId) {
    resolveAlert(alertId);
    navigateToPage('alerts');
}

// Chart Initialization Functions
function initDashboardChart() {
    const canvas = document.getElementById('dashboardChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const data = AppState.historyData.slice(-12);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.time),
            datasets: [
                {
                    label: 'Moisture %',
                    data: data.map(d => d.moisture),
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Temperature Â°C',
                    data: data.map(d => d.temperature),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function initPlantDetailChart() {
    const canvas = document.getElementById('plantDetailChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const data = AppState.historyData;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.time),
            datasets: [
                {
                    label: 'Moisture %',
                    data: data.map(d => d.moisture),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Temperature Â°C',
                    data: data.map(d => d.temperature),
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

function initHistoryChart() {
    const canvas = document.getElementById('historyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const data = AppState.historyData;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.time),
            datasets: [
                {
                    label: 'Moisture %',
                    data: data.map(d => d.moisture),
                    borderColor: '#3B82F6',
                    tension: 0.4
                },
                {
                    label: 'Temperature Â°C',
                    data: data.map(d => d.temperature),
                    borderColor: '#EF4444',
                    tension: 0.4
                },
                {
                    label: 'Light (lux)',
                    data: data.map(d => d.light),
                    borderColor: '#F59E0B',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Update Dashboard Data
function updateDashboardData() {
    if (AppState.currentPage === 'dashboard') {
        renderPageContent('dashboard');
    }
}

// Update Plant Detail Data
function updatePlantDetailData() {
    if (AppState.currentPage === 'plant-detail') {
        renderPageContent('plant-detail');
    }
}



// Error handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
});

// Debug helper
window.debugApp = function() {
    console.log('Current Page:', AppState.currentPage);
    console.log('Plants:', AppState.plants);
    console.log('Devices:', AppState.devices);
    console.log('Alerts:', AppState.alerts);
};