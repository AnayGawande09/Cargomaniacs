const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Points in India
const ORIGIN = { lat: 19.0760, lng: 72.8777, name: "Mumbai, India" };
const DESTINATION = { lat: 28.6139, lng: 77.2090, name: "Delhi, India" };

// Mock route: straight line interpolation
const ROUTE_STEPS = 100;
let route = [];
for (let i = 0; i <= ROUTE_STEPS; i++) {
    const lat = ORIGIN.lat + ((DESTINATION.lat - ORIGIN.lat) * (i / ROUTE_STEPS));
    const lng = ORIGIN.lng + ((DESTINATION.lng - ORIGIN.lng) * (i / ROUTE_STEPS));
    route.push({ lat, lng });
}

let vehicleState = {
    currentStep: 0,
    position: route[0],
    speed: 0, // mph
    temperature: 180, // F
    status: 'en_route', // en_route, stopped, alert
    anomalies: 0
};

// Update simulation
setInterval(() => {
    if (vehicleState.currentStep < route.length - 1) {
        // move forward
        vehicleState.currentStep += 1;
        vehicleState.position = route[vehicleState.currentStep];
        
        // Randomize speed between 55 and 75
        vehicleState.speed = Math.floor(Math.random() * 20) + 55;
        
        // Randomize temp, occasionally spike to trigger alert
        if (Math.random() > 0.95) {
            vehicleState.temperature = Math.floor(Math.random() * 40) + 210; // Spike!
            vehicleState.status = 'alert';
        } else {
            vehicleState.temperature = Math.floor(Math.random() * 20) + 180;
            vehicleState.status = 'en_route';
        }

    } else {
        vehicleState.status = 'arrived';
        vehicleState.speed = 0;
        // Loop back after arriving
        setTimeout(() => {
            vehicleState.currentStep = 0;
            vehicleState.position = route[0];
            vehicleState.status = 'en_route';
        }, 5000);
    }

    // Broadcast update
    io.emit('telemetry', vehicleState);

}, 2000); // update every 2 seconds

// REST Endpoints
app.get('/api/weather', (req, res) => {
    // Mock weather for origin, dest, and current
    res.json({
        origin: { temp: 72, condition: 'Sunny' },
        destination: { temp: 60, condition: 'Foggy' },
        currentLocation: { temp: 68, condition: 'Clear' }
    });
});

app.get('/api/route', (req, res) => {
    res.json({ route, origin: ORIGIN, destination: DESTINATION });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend simulation server running on port ${PORT}`);
});
