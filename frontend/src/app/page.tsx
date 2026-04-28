"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { io } from "socket.io-client";
import axios from "axios";
import { Activity, Thermometer, Wind, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import TelemetryChart from "@/components/TelemetryChart";

// Dynamic import for the Map so SSR doesn't blow up with Leaflet
const TrackingMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-900 border border-gray-800 animate-pulse flex items-center justify-center rounded-lg text-gray-500">Loading Map...</div>,
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function Dashboard() {
  const [routeData, setRouteData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [vehicleState, setVehicleState] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Fetch initial route and weather
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [routeRes, weatherRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/route`),
          axios.get(`${BACKEND_URL}/api/weather`)
        ]);
        setRouteData(routeRes.data);
        setWeatherData(weatherRes.data);
      } catch (err) {
        console.error("Error loading initial data:", err);
      }
    }
    loadInitialData();
  }, []);

  // Socket connection
  useEffect(() => {
    const socket = io(BACKEND_URL);

    socket.on("telemetry", (data) => {
      setVehicleState(data);
      
      // Update history for graphs
      setHistory((prev) => {
        const newHist = [...prev, {
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            temperature: data.temperature,
            speed: data.speed,
        }];
        return newHist.slice(-20); // Keep last 20 data points
      });

      // Handle alerts
      if (data.status === "alert") {
          setAlerts(prev => {
              if (prev.length > 0 && prev[0].message.includes("Temperature")) return prev; // don't spam
              return [{ id: Date.now(), type: 'danger', message: `CRITICAL: High temperature detected (${data.temperature}°F)` }, ...prev].slice(0, 5);
          });
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col font-mono text-sm">
      {/* Header */}
      <header className="bg-gray-950 border-b border-gray-800 p-4 flex items-center justify-between shadow-xl z-10 relative">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 w-6 h-6 animate-pulse" />
          <h1 className="text-xl font-bold tracking-widest text-white">Cargomaniacs</h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
            {vehicleState?.status === 'alert' ? (
                <span className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                    <AlertTriangle className="w-4 h-4" /> CRITICAL STATE
                </span>
            ) : vehicleState?.status === 'arrived' ? (
                 <span className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30">
                    <CheckCircle className="w-4 h-4" /> DESTINATION REACHED
                </span>
            ) : (
                <span className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                    <Zap className="w-4 h-4" /> SYSTEM NOMINAL
                </span>
            )}
            <span className="text-gray-500">SESSION: {new Date().getTime().toString(16).toUpperCase().substring(5)}</span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 h-[calc(100vh-73px)]">
        
        {/* Left Sidebar - Metrics */}
        <div className="col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Live Telemetry Panels */}
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <h2 className="text-gray-400 font-semibold mb-3 tracking-wider text-xs flex items-center gap-2 uppercase">
                    <Zap className="w-4 h-4 text-blue-400"/> Current telemetry
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 p-3 rounded border border-gray-800/50">
                        <div className="text-gray-500 text-xs mb-1">SPEED</div>
                        <div className="text-2xl font-bold text-white">{vehicleState?.speed ?? '--'} <span className="text-sm font-normal text-gray-500">MPH</span></div>
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-gray-800/50">
                        <div className="text-gray-500 text-xs mb-1">TEMP</div>
                        <div className={`text-2xl font-bold ${vehicleState?.temperature > 200 ? 'text-red-500' : 'text-emerald-400'}`}>
                            {vehicleState?.temperature ?? '--'} <span className="text-sm font-normal text-gray-500">°F</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weather Block */}
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                <h2 className="text-gray-400 font-semibold mb-3 tracking-wider text-xs flex items-center gap-2 uppercase">
                    <Wind className="w-4 h-4 text-cyan-400"/> Weather Conditions
                </h2>
                {!weatherData ? ( <div className="text-gray-600 animate-pulse">Loading intel...</div> ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-gray-500">ORIGIN</span>
                            <span className="text-white">{weatherData.origin.temp}°F - {weatherData.origin.condition}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                            <span className="text-gray-500">LOCAL</span>
                            <span className="text-cyan-400 font-medium">{weatherData.currentLocation.temp}°F - {weatherData.currentLocation.condition}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">TARGET</span>
                            <span className="text-white">{weatherData.destination.temp}°F - {weatherData.destination.condition}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Graphs Box */}
            <div className="flex-1 flex flex-col gap-4">
               <TelemetryChart data={history} dataKey="speed" color="#3B82F6" unit="MPH" />
               <TelemetryChart data={history} dataKey="temperature" color="#10B981" threshold={200} unit="°F" />
            </div>
            
        </div>

        {/* Center/Right - Map & Alerts */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4 h-full relative">
            
            {/* The Map */}
            <div className="flex-1 relative rounded-lg overflow-hidden border border-gray-800 shadow-2xl bg-gray-950 p-1">
                 <TrackingMap 
                    route={routeData?.route} 
                    origin={routeData?.origin} 
                    destination={routeData?.destination} 
                    vehicleState={vehicleState} 
                />
                
                {/* HUD Overlay Stats inside map */}
                <div className="absolute bottom-4 left-4 z-10 bg-black/80 backdrop-blur-md border border-gray-700/50 p-3 rounded text-xs shadow-lg pointer-events-none">
                    <div className="text-gray-400 mb-1">GPS // COORDS</div>
                    <div className="font-mono text-cyan-400 tracking-wider">
                        LAT: {vehicleState?.position?.lat.toFixed(5) ?? '---.-----'} <br/>
                        LNG: {vehicleState?.position?.lng.toFixed(5) ?? '---.-----'}
                    </div>
                </div>
            </div>

            {/* Log Panel */}
            <div className="h-48 bg-gray-950 border border-gray-800 rounded-lg p-4 font-mono overflow-y-auto shadow-inner relative">
                <h3 className="text-gray-500 font-bold mb-3 text-xs tracking-widest sticky top-0 bg-gray-950 pb-2 border-b border-gray-800">
                   SYSTEM LOGS & ALERTS
                </h3>
                <div className="space-y-2">
                    {alerts.length === 0 && <div className="text-gray-600 italic">No anomalous activity detected.</div>}
                    {alerts.map(alert => (
                        <div key={alert.id} className="flex items-start gap-3 text-red-400 bg-red-950/30 p-2 rounded border border-red-900/50">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                                <span className="text-gray-500 text-xs mr-2">[{new Date(alert.id).toLocaleTimeString()}]</span>
                                <span>{alert.message}</span>
                            </div>
                        </div>
                    ))}
                    {vehicleState && alerts.length === 0 && (
                        <div className="flex items-start gap-3 text-emerald-400/70 p-2">
                            <span className="text-gray-600 text-xs mr-2">[{new Date().toLocaleTimeString()}]</span>
                            <span>Telemetry sync... OK</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}
