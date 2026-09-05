import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation } from 'lucide-react'

// Fix default leaflet marker icon in react
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom cluster / badge icons
const createCustomIcon = (color: string, label: string, bgColor = '#ffffff', textColor = '#ffffff') => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background: ${color}; min-width: 32px; height: 32px; padding: 0 6px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: ${textColor}; font-weight: 800; font-size: 11px; border: 2.5px solid ${bgColor}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); white-space: nowrap;">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

// Temperature color mapper for intuitive normal user understanding
const getTempColor = (temp: number) => {
  if (temp >= 38) return { bg: '#dc2626', fill: '#ef4444', label: 'Very Hot (>38°C)' }
  if (temp >= 33) return { bg: '#ea580c', fill: '#f97316', label: 'Hot (33-37°C)' }
  if (temp >= 28) return { bg: '#d97706', fill: '#f59e0b', label: 'Warm (28-32°C)' }
  if (temp >= 22) return { bg: '#16a34a', fill: '#22c55e', label: 'Pleasant (22-27°C)' }
  if (temp >= 16) return { bg: '#0284c7', fill: '#38bdf8', label: 'Cool (16-21°C)' }
  return { bg: '#2563eb', fill: '#60a5fa', label: 'Cold (<16°C)' }
}

// Controller component to smoothly pan/zoom map when selected location changes
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 9, { duration: 1.2 })
    }
  }, [center, map])
  return null
}

// Floating GPS / Snap-back to Location Button
function GPSRecenterButton({ center, locationName }: { center: [number, number]; locationName: string }) {
  const map = useMap()
  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation()
    map.flyTo(center, 10, { duration: 1.2 })
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '14px', marginRight: '14px', zIndex: 1000, pointerEvents: 'auto' }}>
      <button
        type="button"
        onClick={handleRecenter}
        title={`Recenter map to ${locationName}`}
        className="bg-white/95 hover:bg-sky-50 text-slate-700 hover:text-sky-600 px-3 py-2 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-2 text-xs font-black transition cursor-pointer active:scale-95 group backdrop-blur-sm"
      >
        <Navigation className="w-4 h-4 text-sky-600 group-hover:rotate-45 transition-transform duration-300 fill-sky-100" />
        <span className="hidden sm:inline">Recenter Location</span>
      </button>
    </div>
  )
}

export default function WeatherMap({ 
  activeLayer = 'radar', 
  crowdReports = [], 
  centerCoords = [18.5204, 73.8567], 
  locationName = "Pune, Maharashtra" 
}) {
  const [lat, lon] = centerCoords

  // Pan-India Major Cities for Temperature Heatmap
  const indianCityTemps = [
    { name: 'Delhi NCR', coords: [28.6139, 77.2090], temp: 37.5, condition: 'Sunny / Hazy', aqi: 180 },
    { name: 'Mumbai', coords: [19.0760, 72.8777], temp: 31.8, condition: 'Humid & Partly Cloudy', aqi: 72 },
    { name: 'Pune', coords: [18.5204, 73.8567], temp: 28.4, condition: 'Pleasant Breeze', aqi: 55 },
    { name: 'Bengaluru', coords: [12.9716, 77.5946], temp: 25.2, condition: 'Cool / Light Drizzle', aqi: 38 },
    { name: 'Chennai', coords: [13.0827, 80.2707], temp: 34.6, condition: 'Warm & Humid', aqi: 65 },
    { name: 'Kolkata', coords: [22.5726, 88.3639], temp: 33.2, condition: 'Passing Showers', aqi: 95 },
    { name: 'Hyderabad', coords: [17.3850, 78.4867], temp: 32.5, condition: 'Scattered Clouds', aqi: 68 },
    { name: 'Ahmedabad', coords: [23.0225, 72.5714], temp: 38.2, condition: 'Hot & Dry', aqi: 110 },
    { name: 'Jaipur', coords: [26.9124, 75.7873], temp: 36.8, condition: 'Sunny', aqi: 125 },
    { name: 'Shimla', coords: [31.1048, 77.1734], temp: 15.6, condition: 'Chilly / Misty', aqi: 22 },
    { name: 'Nagpur', coords: [21.1458, 79.0882], temp: 35.4, condition: 'Warm', aqi: 82 },
    { name: 'Lucknow', coords: [26.8467, 80.9462], temp: 36.1, condition: 'Sunny', aqi: 145 },
    { name: 'Kochi', coords: [9.9312, 76.2673], temp: 29.0, condition: 'Tropical Rain', aqi: 40 }
  ]

  // Flight Route Waypoints (Pune VAPO to Mumbai VABB)
  const routeWaypoints = [
    { name: 'Pune Airport (VAPO)', coords: [18.5822, 73.9197], risk: 'Low Risk', status: 'Clear Sky', alt: '2,000 ft' },
    { name: 'Talegaon Checkpoint', coords: [18.7300, 73.6800], risk: 'Mild Wind', status: 'Minor updraft', alt: '6,500 ft' },
    { name: 'Lonavala / Bhor Ghat', coords: [18.7500, 73.4000], risk: 'Cloud Turbulence', status: 'Moderate rain', alt: '12,000 ft' },
    { name: 'Karjat Transition', coords: [18.9100, 73.3200], risk: 'Wind Gusts', status: 'Stable', alt: '8,000 ft' },
    { name: 'Navi Mumbai Entry', coords: [19.0000, 73.0500], risk: 'Low Risk', status: 'Clear', alt: '3,500 ft' },
    { name: 'Mumbai Airport (VABB)', coords: [19.0896, 72.8656], risk: 'Low Risk', status: 'Smooth', alt: 'Surface' }
  ]

  const polylineCoords = routeWaypoints.map(w => w.coords)

  // Localized convective radar cells dynamically positioned around center coordinates
  const radarCells = [
    {
      center: [lat + 0.045, lon + 0.055],
      radius: 6500,
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.4,
      intensity: 'Moderate Rain Shower',
      rate: '6.5 mm/h'
    },
    {
      center: [lat - 0.065, lon - 0.045],
      radius: 8500,
      color: '#d97706',
      fillColor: '#f59e0b',
      fillOpacity: 0.45,
      intensity: 'Heavy Rain Cloud',
      rate: '14.2 mm/h'
    },
    {
      center: [lat + 0.085, lon - 0.065],
      radius: 11000,
      color: '#059669',
      fillColor: '#10b981',
      fillOpacity: 0.3,
      intensity: 'Light Drizzle',
      rate: '2.1 mm/h'
    }
  ]

  return (
    <div className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden relative z-10 border border-slate-200/80 shadow-sm bg-slate-100">
      <MapContainer 
        center={centerCoords} 
        zoom={activeLayer === 'temp_heat' ? 6 : 9} 
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '480px', backgroundColor: '#f8fafc' }}
      >
        <MapRecenter center={centerCoords} />
        <GPSRecenterButton center={centerCoords} locationName={locationName} />

        {/* Clean Free OpenStreetMap Base Map */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          minZoom={3}
          maxZoom={19}
        />

        {/* Current Active Location Pin */}
        <Marker position={centerCoords}>
          <Popup>
            <div className="p-1.5 space-y-1">
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 uppercase">
                📍 You Are Here
              </span>
              <p className="font-bold text-slate-900 text-sm mt-1">{locationName}</p>
              <p className="text-xs text-slate-600">Live Weather Stations Active</p>
            </div>
          </Popup>
        </Marker>

        {/* ======================================================== */}
        {/* LAYER 1: 🌧️ LIVE DOPPLER RADAR & RAINFALL */}
        {/* ======================================================== */}
        {activeLayer === 'radar' && (
          <>
            {/* Outer Scan Radius 45km */}
            <Circle 
              center={centerCoords}
              radius={45000}
              pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.03, weight: 1.5, dashArray: '6, 8' }}
            />

            {/* Primary Doppler Echo Coverage Ring 25km */}
            <Circle 
              center={centerCoords}
              radius={25000}
              pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.08, weight: 2, dashArray: '4, 6' }}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Live Radar Coverage
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-1">{locationName} Radar Zone</p>
                  <p className="text-xs text-slate-600">Radius: 25 km around your city</p>
                </div>
              </Popup>
            </Circle>

            {/* Inner Core Radar Ring 10km */}
            <Circle 
              center={centerCoords}
              radius={10000}
              pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.12, weight: 1.5 }}
            />

            {/* Live Rain & Storm Cells */}
            {radarCells.map((cell, idx) => (
              <Circle
                key={idx}
                center={cell.center}
                radius={cell.radius}
                pathOptions={{ 
                  color: cell.color, 
                  fillColor: cell.fillColor, 
                  fillOpacity: cell.fillOpacity, 
                  weight: 2 
                }}
              >
                <Popup>
                  <div className="p-1.5 space-y-1 text-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ background: cell.color }}>
                      Rain Intensity
                    </span>
                    <p className="font-bold text-slate-900 mt-1">{cell.intensity}</p>
                    <p className="text-slate-600">Rainfall speed: <strong>{cell.rate}</strong></p>
                  </div>
                </Popup>
              </Circle>
            ))}
          </>
        )}

        {/* ======================================================== */}
        {/* LAYER 2: 🌡️ TEMPERATURE HEATMAP & THERMAL ZONES */}
        {/* ======================================================== */}
        {activeLayer === 'temp_heat' && (
          <>
            {/* Dynamic Colorful Thermal Heat Rings for Major Cities */}
            {indianCityTemps.map((city, idx) => {
              const theme = getTempColor(city.temp)
              return (
                <React.Fragment key={idx}>
                  {/* Heat Radius Aura Ring (50km) */}
                  <Circle 
                    center={city.coords}
                    radius={55000}
                    pathOptions={{ 
                      color: theme.bg, 
                      fillColor: theme.fill, 
                      fillOpacity: 0.35, 
                      weight: 1.5,
                      dashArray: '4, 4'
                    }}
                  />
                  {/* Intense Heat Center Ring (25km) */}
                  <Circle 
                    center={city.coords}
                    radius={28000}
                    pathOptions={{ 
                      color: theme.bg, 
                      fillColor: theme.fill, 
                      fillOpacity: 0.55, 
                      weight: 2
                    }}
                  />
                  {/* City Temperature Pin Marker */}
                  <Marker 
                    position={city.coords}
                    icon={createCustomIcon(theme.bg, `${city.temp}°C`)}
                  >
                    <Popup>
                      <div className="p-1.5 space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 text-sm">{city.name}</span>
                          <span className="px-2 py-0.5 rounded text-white text-[10px] font-bold" style={{ backgroundColor: theme.bg }}>
                            {city.temp}°C
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">Weather: <strong>{city.condition}</strong></p>
                        <p className="text-slate-500 text-[11px]">Heat Category: {theme.label}</p>
                        <p className="text-slate-500 text-[11px]">Air Quality (AQI): <strong className={city.aqi > 100 ? 'text-amber-600' : 'text-emerald-600'}>{city.aqi}</strong></p>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              )
            })}
          </>
        )}

        {/* ======================================================== */}
        {/* LAYER 3: 💨 WIND & AIR QUALITY (AQI) */}
        {/* ======================================================== */}
        {activeLayer === 'wind_aqi' && (
          <>
            {indianCityTemps.map((city, idx) => {
              const isGood = city.aqi <= 50
              const isModerate = city.aqi > 50 && city.aqi <= 100
              const aqiColor = isGood ? '#16a34a' : isModerate ? '#d97706' : '#dc2626'
              const aqiLabel = isGood ? 'Good' : isModerate ? 'Moderate' : 'Poor'

              return (
                <React.Fragment key={idx}>
                  <Circle 
                    center={city.coords}
                    radius={35000}
                    pathOptions={{ color: aqiColor, fillColor: aqiColor, fillOpacity: 0.25, weight: 1.5 }}
                  />
                  <Marker 
                    position={city.coords}
                    icon={createCustomIcon(aqiColor, `AQI ${city.aqi}`)}
                  >
                    <Popup>
                      <div className="p-1.5 space-y-1 text-xs">
                        <p className="font-bold text-slate-900 text-sm">{city.name}</p>
                        <p className="text-slate-700">Air Quality Index: <strong style={{ color: aqiColor }}>{city.aqi} ({aqiLabel})</strong></p>
                        <p className="text-slate-500">Breeze: 12-16 km/h from South-West</p>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              )
            })}
          </>
        )}

        {/* ======================================================== */}
        {/* LAYER 4: 👥 COMMUNITY GROUND REPORTS */}
        {/* ======================================================== */}
        {activeLayer === 'crowd' && (
          <>
            {crowdReports.map((r, idx) => (
              <React.Fragment key={r.id || idx}>
                <Marker 
                  position={[r.latitude, r.longitude]}
                  icon={createCustomIcon(r.is_verified ? '#059669' : '#d97706', r.is_verified ? '✓' : '?')}
                >
                  <Popup>
                    <div className="p-1.5 max-w-[220px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{r.location_name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {r.is_verified ? 'Verified Report' : 'New Report'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        Observed: <strong>{r.observed_condition} ({r.intensity})</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">Reported by: {r.reporter_name}</p>
                    </div>
                  </Popup>
                </Marker>

                {r.is_verified && (
                  <Circle 
                    center={[r.latitude, r.longitude]}
                    radius={3000}
                    pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.18, weight: 1.5 }}
                  />
                )}
              </React.Fragment>
            ))}
          </>
        )}

        {/* ======================================================== */}
        {/* LAYER 5: ✈️ TRAVEL & AIRWAY SAFETY CORRIDORS */}
        {/* ======================================================== */}
        {activeLayer === 'route' && (
          <>
            <Polyline 
              positions={polylineCoords} 
              pathOptions={{ color: '#4f46e5', weight: 4, dashArray: '6, 8' }} 
            />
            {routeWaypoints.map((w, idx) => (
              <Marker 
                key={idx}
                position={w.coords}
                icon={createCustomIcon(w.risk.includes('Turbulence') ? '#e11d48' : (w.risk.includes('Wind') ? '#d97706' : '#0284c7'), `${idx+1}`)}
              >
                <Popup>
                  <div className="p-1.5 space-y-1">
                    <p className="font-bold text-slate-900 text-xs">{w.name}</p>
                    <p className="text-xs text-slate-600">Flight Altitude: <strong>{w.alt}</strong></p>
                    <p className={`text-xs font-semibold ${w.risk.includes('Turbulence') ? 'text-rose-600' : 'text-emerald-700'}`}>
                      Safety: {w.risk} ({w.status})
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

      </MapContainer>

      {/* Map Interactive Legend Banner (Easy for normal users to understand) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 flex items-center gap-3 shadow-lg flex-wrap max-w-xl">
        {activeLayer === 'radar' && (
          <>
            <span className="font-bold text-sky-700">🌧️ Rain Radar:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Light Rain</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Moderate Shower</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Heavy Rain Cloud</span>
          </>
        )}
        {activeLayer === 'temp_heat' && (
          <>
            <span className="font-bold text-slate-900">🌡️ Heat Scale:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> &gt;38°C (Extreme)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 33-37°C (Hot)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 28-32°C (Warm)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> 22-27°C (Pleasant)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> &lt;21°C (Cool)</span>
          </>
        )}
        {activeLayer === 'wind_aqi' && (
          <>
            <span className="font-bold text-slate-900">💨 Air Quality:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Good (0-50)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (51-100)</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Poor (&gt;100)</span>
          </>
        )}
        {activeLayer === 'crowd' && (
          <>
            <span className="font-bold text-emerald-700">👥 Community:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Verified Ground Report</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending Review</span>
          </>
        )}
        {activeLayer === 'route' && (
          <>
            <span className="font-bold text-indigo-700">✈️ Flight Safety:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Flight Route</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High Cloud Zone</span>
          </>
        )}
      </div>
    </div>
  )
}
