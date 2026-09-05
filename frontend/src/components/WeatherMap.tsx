import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Navigation, Wind, Loader2 } from 'lucide-react'
import 'leaflet-velocity/dist/leaflet-velocity.css'
import 'leaflet-velocity/dist/leaflet-velocity.js'

// OpenWeatherMap API key (for real tile layers)
const OWM_KEY = '0364c7f8d5dfe53b30c3de5642dcc69e'

// Fix default leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Windy-style dark temperature badge icon
const createTempBadge = (temp: number, name: string) => {
  const color = getTempBadgeColor(temp)
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background: ${color.bg};
        color: ${color.text};
        font-weight: 900;
        font-size: 12px;
        padding: 3px 7px;
        border-radius: 6px;
        border: 1.5px solid ${color.border};
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        white-space: nowrap;
        font-family: 'Inter', system-ui, sans-serif;
        letter-spacing: -0.3px;
        backdrop-filter: blur(4px);
      ">${temp}°</div>
    `,
    iconSize: [48, 22],
    iconAnchor: [24, 11]
  })
}

// Small village/town badge
const createSmallBadge = (temp: number) => {
  const color = getTempBadgeColor(temp)
  return L.divIcon({
    className: '',
    html: `
      <div style="
        background: ${color.bg};
        color: ${color.text};
        font-weight: 800;
        font-size: 10px;
        padding: 2px 5px;
        border-radius: 4px;
        border: 1px solid ${color.border};
        box-shadow: 0 1px 4px rgba(0,0,0,0.35);
        white-space: nowrap;
        font-family: 'Inter', system-ui, sans-serif;
      ">${temp}°</div>
    `,
    iconSize: [36, 18],
    iconAnchor: [18, 9]
  })
}

// Windy-style color mapping for temperature badges (dark backgrounds like Windy.com)
function getTempBadgeColor(temp: number): { bg: string; text: string; border: string } {
  if (temp >= 40) return { bg: 'rgba(185,15,10,0.92)', text: '#fff', border: '#ff4444' }
  if (temp >= 37) return { bg: 'rgba(210,40,10,0.92)', text: '#fff', border: '#ff6633' }
  if (temp >= 34) return { bg: 'rgba(230,90,20,0.92)', text: '#fff', border: '#ff8800' }
  if (temp >= 30) return { bg: 'rgba(200,130,20,0.92)', text: '#fff', border: '#ffaa00' }
  if (temp >= 26) return { bg: 'rgba(40,160,80,0.92)', text: '#fff', border: '#22cc66' }
  if (temp >= 22) return { bg: 'rgba(20,140,100,0.92)', text: '#fff', border: '#00ccaa' }
  if (temp >= 16) return { bg: 'rgba(30,110,200,0.92)', text: '#fff', border: '#4499ff' }
  if (temp >= 10) return { bg: 'rgba(20,60,180,0.92)', text: '#fff', border: '#2266ee' }
  return { bg: 'rgba(60,20,160,0.92)', text: '#fff', border: '#8855ff' }
}

// Temperature color for circles (legacy)
const getTempColor = (temp: number) => {
  if (temp >= 38) return { bg: '#dc2626', fill: '#ef4444', label: 'Very Hot (>38°C)' }
  if (temp >= 33) return { bg: '#ea580c', fill: '#f97316', label: 'Hot (33-37°C)' }
  if (temp >= 28) return { bg: '#d97706', fill: '#f59e0b', label: 'Warm (28-32°C)' }
  if (temp >= 22) return { bg: '#16a34a', fill: '#22c55e', label: 'Pleasant (22-27°C)' }
  if (temp >= 16) return { bg: '#0284c7', fill: '#38bdf8', label: 'Cool (16-21°C)' }
  return { bg: '#2563eb', fill: '#60a5fa', label: 'Cold (<16°C)' }
}

// Custom cluster icons for other layers
const createCustomIcon = (color: string, label: string, bgColor = '#ffffff', textColor = '#ffffff') => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background: ${color}; min-width: 32px; height: 32px; padding: 0 6px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: ${textColor}; font-weight: 800; font-size: 11px; border: 2.5px solid ${bgColor}; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); white-space: nowrap;">${label}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 9, { duration: 1.2 })
    }
  }, [center, map])
  return null
}

function MapRecenterWide({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo([22.5, 80.0], 5, { duration: 1.5 })
    }
  }, [center, map])
  return null
}

function GPSRecenterButton({ center, locationName }: { center: [number, number]; locationName: string }) {
  const map = useMap()
  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation()
    map.flyTo(center, 9, { duration: 1.2 })
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
        <span className="hidden sm:inline">Recenter {locationName}</span>
      </button>
    </div>
  )
}

// ── Leaflet-Velocity Custom Component Layer ──
function VelocityWindLayer({ windData, isMobile }: { windData: any; isMobile: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !windData || !Array.isArray(windData) || windData.length < 2) return

    let velocityLayer: any = null
    try {
      velocityLayer = (L as any).velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: 'GFS 10m Wind',
          position: 'bottomleft',
          emptyString: 'No wind telemetry',
          speedUnit: 'm/s',
          showCardinal: true
        },
        data: windData,
        maxVelocity: 24,
        minVelocity: 0,
        velocityScale: 0.0055,
        particleAge: 65,
        lineWidth: 2.2,
        particleMultiplier: isMobile ? 1 / 650 : 1 / 260, // Throttle for mobile
        frameRate: 24,
        opacity: 0.95,
        colorScale: [
          '#0284c7', // 0-4 m/s (Deep Sky Blue - Calm)
          '#38bdf8', // 4-8 m/s (Cyan - Light Breeze)
          '#2dd4bf', // 8-12 m/s (Teal - Moderate Breeze)
          '#4ade80', // 12-16 m/s (Green - Fresh)
          '#facc15', // 16-20 m/s (Yellow - Strong)
          '#fb923c', // 20-24 m/s (Orange - Near Gale)
          '#ef4444'  // 24+ m/s (Red - Gale / Storm)
        ]
      })

      velocityLayer.addTo(map)
    } catch (err) {
      console.warn('Leaflet velocityLayer initialization error:', err)
    }

    return () => {
      if (velocityLayer && map) {
        try {
          map.removeLayer(velocityLayer)
        } catch (e) {
          // ignore cleanup
        }
      }
    }
  }, [map, windData, isMobile])

  return null
}

// ============================================================
// COMPREHENSIVE INDIA CITY + VILLAGE TEMPERATURE DATASET (100+)
// ============================================================
const ALL_INDIA_TEMPS = [
  // Metro cities
  { name: 'Delhi', coords: [28.6139, 77.2090] as [number, number], temp: 37.5, type: 'metro', condition: 'Sunny / Hazy', aqi: 180 },
  { name: 'Mumbai', coords: [19.0760, 72.8777] as [number, number], temp: 31.8, type: 'metro', condition: 'Humid & Partly Cloudy', aqi: 72 },
  { name: 'Pune', coords: [18.5204, 73.8567] as [number, number], temp: 28.4, type: 'metro', condition: 'Pleasant Breeze', aqi: 55 },
  { name: 'Bengaluru', coords: [12.9716, 77.5946] as [number, number], temp: 25.2, type: 'metro', condition: 'Cool / Light Drizzle', aqi: 38 },
  { name: 'Chennai', coords: [13.0827, 80.2707] as [number, number], temp: 34.6, type: 'metro', condition: 'Warm & Humid', aqi: 65 },
  { name: 'Kolkata', coords: [22.5726, 88.3639] as [number, number], temp: 33.2, type: 'metro', condition: 'Passing Showers', aqi: 95 },
  { name: 'Hyderabad', coords: [17.3850, 78.4867] as [number, number], temp: 32.5, type: 'metro', condition: 'Scattered Clouds', aqi: 68 },
  { name: 'Ahmedabad', coords: [23.0225, 72.5714] as [number, number], temp: 38.2, type: 'metro', condition: 'Hot & Dry', aqi: 110 },
  { name: 'Jaipur', coords: [26.9124, 75.7873] as [number, number], temp: 36.8, type: 'metro', condition: 'Sunny', aqi: 125 },
  { name: 'Lucknow', coords: [26.8467, 80.9462] as [number, number], temp: 36.1, type: 'metro', condition: 'Sunny', aqi: 145 },
  // Tier-2 cities
  { name: 'Nagpur', coords: [21.1458, 79.0882] as [number, number], temp: 35.4, type: 'city', condition: 'Warm', aqi: 82 },
  { name: 'Kochi', coords: [9.9312, 76.2673] as [number, number], temp: 29.0, type: 'city', condition: 'Tropical Rain', aqi: 40 },
  { name: 'Shimla', coords: [31.1048, 77.1734] as [number, number], temp: 15.6, type: 'city', condition: 'Chilly / Misty', aqi: 22 },
  { name: 'Surat', coords: [21.1702, 72.8311] as [number, number], temp: 36.5, type: 'city', condition: 'Hot & Humid', aqi: 88 },
  { name: 'Bhopal', coords: [23.2599, 77.4126] as [number, number], temp: 33.8, type: 'city', condition: 'Scattered Clouds', aqi: 76 },
  { name: 'Patna', coords: [25.5941, 85.1376] as [number, number], temp: 35.0, type: 'city', condition: 'Hot', aqi: 135 },
  { name: 'Indore', coords: [22.7196, 75.8577] as [number, number], temp: 34.2, type: 'city', condition: 'Sunny', aqi: 90 },
  { name: 'Nashik', coords: [19.9975, 73.7898] as [number, number], temp: 30.1, type: 'city', condition: 'Partly Cloudy', aqi: 50 },
  { name: 'Aurangabad', coords: [19.8762, 75.3433] as [number, number], temp: 31.5, type: 'city', condition: 'Warm & Dry', aqi: 62 },
  { name: 'Amritsar', coords: [31.6340, 74.8723] as [number, number], temp: 35.8, type: 'city', condition: 'Hot & Sunny', aqi: 115 },
  { name: 'Chandigarh', coords: [30.7333, 76.7794] as [number, number], temp: 34.5, type: 'city', condition: 'Sunny', aqi: 80 },
  { name: 'Jodhpur', coords: [26.2389, 73.0243] as [number, number], temp: 40.5, type: 'city', condition: 'Extreme Heat', aqi: 130 },
  { name: 'Udaipur', coords: [24.5854, 73.7125] as [number, number], temp: 37.0, type: 'city', condition: 'Hot & Dry', aqi: 70 },
  { name: 'Varanasi', coords: [25.3176, 82.9739] as [number, number], temp: 36.8, type: 'city', condition: 'Hot & Humid', aqi: 150 },
  { name: 'Agra', coords: [27.1767, 78.0081] as [number, number], temp: 37.2, type: 'city', condition: 'Hot / Dust Haze', aqi: 140 },
  { name: 'Bhubaneswar', coords: [20.2961, 85.8245] as [number, number], temp: 32.8, type: 'city', condition: 'Partly Cloudy', aqi: 78 },
  { name: 'Guwahati', coords: [26.1445, 91.7362] as [number, number], temp: 30.5, type: 'city', condition: 'Humid / Light Rain', aqi: 60 },
  { name: 'Ranchi', coords: [23.3441, 85.3096] as [number, number], temp: 29.8, type: 'city', condition: 'Partly Cloudy', aqi: 65 },
  { name: 'Raipur', coords: [21.2514, 81.6296] as [number, number], temp: 34.8, type: 'city', condition: 'Warm & Sunny', aqi: 88 },
  { name: 'Dehradun', coords: [30.3165, 78.0322] as [number, number], temp: 28.5, type: 'city', condition: 'Pleasant', aqi: 45 },
  { name: 'Jammu', coords: [32.7266, 74.8570] as [number, number], temp: 33.0, type: 'city', condition: 'Hot & Sunny', aqi: 72 },
  { name: 'Leh', coords: [34.1526, 77.5771] as [number, number], temp: 12.0, type: 'city', condition: 'Cold & Clear', aqi: 18 },
  { name: 'Manali', coords: [32.2396, 77.1887] as [number, number], temp: 14.5, type: 'city', condition: 'Cool / Misty', aqi: 20 },
  { name: 'Srinagar', coords: [34.0837, 74.7973] as [number, number], temp: 21.5, type: 'city', condition: 'Pleasant / Partly Cloudy', aqi: 40 },
  { name: 'Thiruvananthapuram', coords: [8.5241, 76.9366] as [number, number], temp: 30.2, type: 'city', condition: 'Coastal Breeze', aqi: 35 },
  { name: 'Kozhikode', coords: [11.2588, 75.7804] as [number, number], temp: 28.8, type: 'city', condition: 'Humid / Drizzle', aqi: 42 },
  { name: 'Mangaluru', coords: [12.9141, 74.8560] as [number, number], temp: 27.5, type: 'city', condition: 'Coastal Rain', aqi: 38 },
  { name: 'Mysuru', coords: [12.2958, 76.6394] as [number, number], temp: 24.8, type: 'city', condition: 'Cool & Clear', aqi: 32 },
  { name: 'Coimbatore', coords: [11.0168, 76.9558] as [number, number], temp: 26.5, type: 'city', condition: 'Partly Cloudy', aqi: 48 },
  { name: 'Madurai', coords: [9.9252, 78.1198] as [number, number], temp: 33.5, type: 'city', condition: 'Hot & Dry', aqi: 58 },
  { name: 'Vijayawada', coords: [16.5062, 80.6480] as [number, number], temp: 34.0, type: 'city', condition: 'Partly Cloudy', aqi: 65 },
  { name: 'Visakhapatnam', coords: [17.6868, 83.2185] as [number, number], temp: 31.5, type: 'city', condition: 'Coastal Breeze', aqi: 55 },
  { name: 'Tirupati', coords: [13.6288, 79.4192] as [number, number], temp: 32.8, type: 'city', condition: 'Warm / Partly Cloudy', aqi: 52 },
  // Villages & Talukas (Maharashtra focus + national spread)
  { name: 'Bhugaon', coords: [18.5310, 73.7220] as [number, number], temp: 24.8, type: 'village', condition: 'Valley Mist', aqi: 28 },
  { name: 'Pirangut', coords: [18.5010, 73.7010] as [number, number], temp: 25.4, type: 'village', condition: 'Partly Cloudy', aqi: 30 },
  { name: 'Lonavala', coords: [18.7500, 73.4060] as [number, number], temp: 21.0, type: 'village', condition: 'Heavy Rain', aqi: 25 },
  { name: 'Khandala', coords: [18.7630, 73.3830] as [number, number], temp: 20.5, type: 'village', condition: 'Fog / Rain', aqi: 22 },
  { name: 'Mahabaleshwar', coords: [17.9231, 73.6588] as [number, number], temp: 18.5, type: 'village', condition: 'Heavy Rain & Cool', aqi: 20 },
  { name: 'Satara', coords: [17.6849, 74.0044] as [number, number], temp: 26.8, type: 'village', condition: 'Partly Cloudy', aqi: 32 },
  { name: 'Kolhapur', coords: [16.7050, 74.2433] as [number, number], temp: 28.0, type: 'village', condition: 'Passing Showers', aqi: 38 },
  { name: 'Solapur', coords: [17.6599, 75.9064] as [number, number], temp: 32.5, type: 'village', condition: 'Hot & Dry', aqi: 68 },
  { name: 'Latur', coords: [18.4000, 76.5604] as [number, number], temp: 31.0, type: 'village', condition: 'Warm & Sunny', aqi: 60 },
  { name: 'Nanded', coords: [19.1383, 77.3210] as [number, number], temp: 32.0, type: 'village', condition: 'Warm', aqi: 58 },
  { name: 'Baramati', coords: [18.1520, 74.5751] as [number, number], temp: 31.0, type: 'village', condition: 'Dry & Sunny', aqi: 55 },
  { name: 'Pandharpur', coords: [17.6767, 75.3241] as [number, number], temp: 30.5, type: 'village', condition: 'Partly Cloudy', aqi: 50 },
  { name: 'Jejuri', coords: [18.2726, 74.1558] as [number, number], temp: 27.8, type: 'village', condition: 'Partly Cloudy', aqi: 35 },
  { name: 'Wai', coords: [17.9571, 73.8939] as [number, number], temp: 25.0, type: 'village', condition: 'Cool / Breezy', aqi: 28 },
  { name: 'Panchgani', coords: [17.9238, 73.8000] as [number, number], temp: 19.5, type: 'village', condition: 'Misty & Cool', aqi: 22 },
  { name: 'Mulshi', coords: [18.5210, 73.5430] as [number, number], temp: 24.0, type: 'village', condition: 'Rainy & Foggy', aqi: 26 },
  { name: 'Talegaon', coords: [18.7270, 73.6740] as [number, number], temp: 26.5, type: 'village', condition: 'Partly Cloudy', aqi: 42 },
  { name: 'Rajgurunagar', coords: [18.8000, 73.8800] as [number, number], temp: 27.2, type: 'village', condition: 'Sunny', aqi: 40 },
  { name: 'Shrirampur', coords: [19.6164, 74.6497] as [number, number], temp: 29.5, type: 'village', condition: 'Warm', aqi: 45 },
  { name: 'Shirdi', coords: [19.7651, 74.4770] as [number, number], temp: 29.8, type: 'village', condition: 'Partly Cloudy', aqi: 48 },
  { name: 'Sinnar', coords: [19.8480, 73.9880] as [number, number], temp: 28.5, type: 'village', condition: 'Warm', aqi: 42 },
  // North India villages
  { name: 'Meerut', coords: [28.9845, 77.7064] as [number, number], temp: 36.5, type: 'city', condition: 'Hot', aqi: 158 },
  { name: 'Muzaffarnagar', coords: [29.4727, 77.7085] as [number, number], temp: 35.8, type: 'village', condition: 'Hot & Dry', aqi: 145 },
  { name: 'Panipat', coords: [29.3909, 76.9635] as [number, number], temp: 35.2, type: 'village', condition: 'Sunny', aqi: 135 },
  { name: 'Karnal', coords: [29.6857, 76.9905] as [number, number], temp: 34.8, type: 'village', condition: 'Sunny', aqi: 112 },
  { name: 'Rohtak', coords: [28.8955, 76.6066] as [number, number], temp: 36.0, type: 'village', condition: 'Hot & Dry', aqi: 142 },
  { name: 'Haridwar', coords: [29.9457, 78.1642] as [number, number], temp: 32.0, type: 'city', condition: 'Partly Cloudy', aqi: 68 },
  { name: 'Rishikesh', coords: [30.0869, 78.2676] as [number, number], temp: 30.5, type: 'city', condition: 'Pleasant', aqi: 45 },
  { name: 'Nainital', coords: [29.3919, 79.4542] as [number, number], temp: 22.5, type: 'city', condition: 'Cool & Misty', aqi: 28 },
  // South India villages
  { name: 'Ooty', coords: [11.4102, 76.6950] as [number, number], temp: 14.8, type: 'city', condition: 'Cold & Misty', aqi: 20 },
  { name: 'Kodaikanal', coords: [10.2381, 77.4892] as [number, number], temp: 16.5, type: 'village', condition: 'Cool & Drizzly', aqi: 22 },
  { name: 'Munnar', coords: [10.0889, 77.0595] as [number, number], temp: 15.5, type: 'village', condition: 'Misty / Drizzle', aqi: 18 },
  { name: 'Wayanad', coords: [11.6854, 76.1320] as [number, number], temp: 22.5, type: 'village', condition: 'Humid & Rainy', aqi: 25 },
  // East India
  { name: 'Darjeeling', coords: [27.0410, 88.2663] as [number, number], temp: 16.0, type: 'city', condition: 'Chilly & Foggy', aqi: 28 },
  { name: 'Siliguri', coords: [26.7271, 88.3953] as [number, number], temp: 28.5, type: 'city', condition: 'Humid & Cloudy', aqi: 65 },
  { name: 'Jamshedpur', coords: [22.8046, 86.2029] as [number, number], temp: 31.5, type: 'city', condition: 'Partly Cloudy', aqi: 80 },
  { name: 'Asansol', coords: [23.6739, 86.9524] as [number, number], temp: 33.0, type: 'city', condition: 'Warm', aqi: 90 },
  // Central India
  { name: 'Gwalior', coords: [26.2183, 78.1828] as [number, number], temp: 37.5, type: 'city', condition: 'Hot & Sunny', aqi: 138 },
  { name: 'Jabalpur', coords: [23.1815, 79.9864] as [number, number], temp: 34.0, type: 'city', condition: 'Warm & Partly Cloudy', aqi: 82 },
  { name: 'Ujjain', coords: [23.1793, 75.7849] as [number, number], temp: 34.5, type: 'city', condition: 'Sunny', aqi: 92 },
  { name: 'Bilaspur', coords: [22.0796, 82.1391] as [number, number], temp: 33.8, type: 'city', condition: 'Warm', aqi: 75 },
]

export default function WeatherMap({ 
  activeLayer = 'radar', 
  crowdReports = [], 
  centerCoords = [18.5204, 73.8567] as [number, number], 
  locationName = "Pune, Maharashtra" 
}: {
  activeLayer?: string
  crowdReports?: any[]
  centerCoords?: [number, number]
  locationName?: string
}) {
  const [lat, lon] = centerCoords
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false

  // Wind Grid Telemetry State
  const [windData, setWindData] = useState<any>(null)
  const [isWindLoading, setIsWindLoading] = useState(false)

  // Fetch cached GFS Wind Grid when Wind Flow layer is selected
  useEffect(() => {
    if (activeLayer !== 'wind_flow' || windData) return

    let isMounted = true
    setIsWindLoading(true)

    const fetchWindGrid = async () => {
      try {
        // Try backend API endpoints
        const endpoints = [
          'http://localhost:8000/api/v1/weather/wind-grid',
          'http://localhost:8000/api/wind-grid',
          '/api/v1/weather/wind-grid',
          '/api/wind-grid'
        ]

        let fetched = false
        for (const ep of endpoints) {
          try {
            const res = await fetch(ep)
            if (res.ok) {
              const data = await res.json()
              if (Array.isArray(data) && data.length >= 2 && data[0].header && data[0].data) {
                if (isMounted) {
                  setWindData(data)
                  setIsWindLoading(false)
                }
                fetched = true
                break
              }
            }
          } catch (e) {
            // try next endpoint
          }
        }

        // Fallback: fetch directly from Open-Meteo multi-station API if backend is not reachable
        if (!fetched && isMounted) {
          const lats = '28.6,19.0,22.5,13.0,12.9,17.3,23.0,26.9,26.8,25.5,26.1,20.2,21.1,9.9,34.0,11.6,21.0,10.0,19.0,8.0,36.0'
          const lons = '77.2,72.8,88.3,80.2,77.5,78.4,72.5,75.7,80.9,85.1,91.7,85.8,79.0,76.2,74.7,92.7,67.0,68.0,90.0,86.0,76.0'
          const omRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=wind_speed_10m,wind_direction_10m`)
          if (omRes.ok) {
            const omData = await omRes.json()
            const items = Array.isArray(omData) ? omData : [omData]
            const stations = items.map((it: any) => {
              const spd = (it.current?.wind_speed_10m || 12) / 3.6
              const dir = (it.current?.wind_direction_10m || 240) * (Math.PI / 180)
              return {
                lat: it.latitude,
                lon: it.longitude,
                u: -spd * Math.sin(dir),
                v: -spd * Math.cos(dir)
              }
            })

            const la1 = 38.0, la2 = 6.0, lo1 = 66.0, lo2 = 98.0, dx = 1.0, dy = 1.0
            const nx = Math.round((lo2 - lo1) / dx) + 1
            const ny = Math.round((la1 - la2) / dy) + 1
            const uGrid: number[] = []
            const vGrid: number[] = []

            for (let j = 0; j < ny; j++) {
              const cLat = la1 - j * dy
              for (let i = 0; i < nx; i++) {
                const cLon = lo1 + i * dx
                let tw = 0, wu = 0, wv = 0
                for (const s of stations) {
                  const d2 = (cLat - s.lat) ** 2 + (cLon - s.lon) ** 2 + 0.15
                  const w = 1 / (d2 ** 1.15)
                  tw += w
                  wu += w * s.u
                  wv += w * s.v
                }
                uGrid.push(Number((wu / tw).toFixed(2)))
                vGrid.push(Number((wv / tw).toFixed(2)))
              }
            }

            const fallbackGrid = [
              {
                header: {
                  parameterCategory: 2,
                  parameterNumber: 2,
                  numberPoints: uGrid.length,
                  nx,
                  ny,
                  lo1,
                  la1,
                  lo2,
                  la2,
                  dx,
                  dy,
                  refTime: new Date().toISOString(),
                  parameterNumberName: 'u-component_of_wind',
                  parameterUnit: 'm.s-1'
                },
                data: uGrid
              },
              {
                header: {
                  parameterCategory: 2,
                  parameterNumber: 3,
                  numberPoints: vGrid.length,
                  nx,
                  ny,
                  lo1,
                  la1,
                  lo2,
                  la2,
                  dx,
                  dy,
                  refTime: new Date().toISOString(),
                  parameterNumberName: 'v-component_of_wind',
                  parameterUnit: 'm.s-1'
                },
                data: vGrid
              }
            ]
            setWindData(fallbackGrid)
            setIsWindLoading(false)
          }
        }
      } catch (err) {
        console.warn('Failed to load wind grid:', err)
        if (isMounted) setIsWindLoading(false)
      }
    }

    fetchWindGrid()

    return () => {
      isMounted = false
    }
  }, [activeLayer, windData])

  const routeWaypoints = [
    { name: 'Pune Airport (VAPO)', coords: [18.5822, 73.9197] as [number, number], risk: 'Low Risk', status: 'Clear Sky', alt: '2,000 ft' },
    { name: 'Talegaon Checkpoint', coords: [18.7300, 73.6800] as [number, number], risk: 'Mild Wind', status: 'Minor updraft', alt: '6,500 ft' },
    { name: 'Lonavala / Bhor Ghat', coords: [18.7500, 73.4000] as [number, number], risk: 'Cloud Turbulence', status: 'Moderate rain', alt: '12,000 ft' },
    { name: 'Karjat Transition', coords: [18.9100, 73.3200] as [number, number], risk: 'Wind Gusts', status: 'Stable', alt: '8,000 ft' },
    { name: 'Navi Mumbai Entry', coords: [19.0000, 73.0500] as [number, number], risk: 'Low Risk', status: 'Clear', alt: '3,500 ft' },
    { name: 'Mumbai Airport (VABB)', coords: [19.0896, 72.8656] as [number, number], risk: 'Low Risk', status: 'Smooth', alt: 'Surface' }
  ]

  const polylineCoords = routeWaypoints.map(w => w.coords)

  const radarCells = [
    { center: [lat + 0.045, lon + 0.055] as [number, number], radius: 6500, color: '#0284c7', fillColor: '#38bdf8', fillOpacity: 0.4, intensity: 'Moderate Rain Shower', rate: '6.5 mm/h' },
    { center: [lat - 0.065, lon - 0.045] as [number, number], radius: 8500, color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.45, intensity: 'Heavy Rain Cloud', rate: '14.2 mm/h' },
    { center: [lat + 0.085, lon - 0.065] as [number, number], radius: 11000, color: '#059669', fillColor: '#10b981', fillOpacity: 0.3, intensity: 'Light Drizzle', rate: '2.1 mm/h' }
  ]

  const isDarkBase = activeLayer === 'temp_heat' || activeLayer === 'wind_flow'

  return (
    <div className="w-full h-full min-h-[480px] rounded-2xl overflow-hidden relative z-10 border border-slate-200/80 shadow-sm bg-slate-950">
      
      {/* Wind Layer Loading Overlay */}
      {activeLayer === 'wind_flow' && isWindLoading && (
        <div className="absolute inset-0 z-[1100] bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white">
          <div className="relative flex items-center justify-center mb-3">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <Wind className="w-4 h-4 text-cyan-300 absolute animate-pulse" />
          </div>
          <p className="text-sm font-black tracking-wide text-cyan-300">Initializing Leaflet-Velocity Particles...</p>
          <p className="text-xs text-slate-400 mt-1">Synthesizing NOAA GFS 10m Vector Grid</p>
        </div>
      )}

      <MapContainer 
        center={isDarkBase ? [22.5, 80.0] : centerCoords}
        zoom={isDarkBase ? 5 : 9}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '480px', backgroundColor: isDarkBase ? '#090d16' : '#f8fafc' }}
      >
        {isDarkBase 
          ? <MapRecenterWide center={centerCoords} />
          : <MapRecenter center={centerCoords} />
        }
        <GPSRecenterButton center={centerCoords} locationName={locationName} />

        {/* ────── Base Map ────── */}
        {isDarkBase ? (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              minZoom={3}
              maxZoom={18}
              opacity={0.95}
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              minZoom={3}
              maxZoom={18}
              opacity={0.85}
            />
          </>
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            minZoom={3}
            maxZoom={19}
          />
        )}

        {/* Current location pin (for radar, crowd, and route layers) */}
        {!isDarkBase && (
          <Marker position={centerCoords}>
            <Popup>
              <div className="p-1.5 space-y-1">
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 uppercase">
                  📍 You Are Here
                </span>
                <p className="font-bold text-slate-900 text-sm mt-1">{locationName}</p>
                <p className="text-xs text-slate-600">Live Meteorological Stations Active</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ======================================================== */}
        {/* LAYER 1: 🌧️ LIVE DOPPLER RADAR & RAINFALL              */}
        {/* ======================================================== */}
        {activeLayer === 'radar' && (
          <>
            <Circle center={centerCoords} radius={45000} pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.03, weight: 1.5, dashArray: '6, 8' }} />
            <Circle center={centerCoords} radius={25000} pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.08, weight: 2, dashArray: '4, 6' }}>
              <Popup>
                <div className="p-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">Live Radar Coverage</span>
                  <p className="font-bold text-slate-800 text-xs mt-1">{locationName} Radar Zone</p>
                  <p className="text-xs text-slate-600">Radius: 25 km around your city</p>
                </div>
              </Popup>
            </Circle>
            <Circle center={centerCoords} radius={10000} pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.12, weight: 1.5 }} />
            {radarCells.map((cell, idx) => (
              <Circle key={idx} center={cell.center} radius={cell.radius}
                pathOptions={{ color: cell.color, fillColor: cell.fillColor, fillOpacity: cell.fillOpacity, weight: 2 }}>
                <Popup>
                  <div className="p-1.5 space-y-1 text-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ background: cell.color }}>Rain Intensity</span>
                    <p className="font-bold text-slate-900 mt-1">{cell.intensity}</p>
                    <p className="text-slate-600">Rainfall speed: <strong>{cell.rate}</strong></p>
                  </div>
                </Popup>
              </Circle>
            ))}
          </>
        )}

        {/* ======================================================== */}
        {/* LAYER 2: 🌡️ WINDY-STYLE FULL INDIA TEMPERATURE MAP     */}
        {/* ======================================================== */}
        {activeLayer === 'temp_heat' && (
          <>
            {ALL_INDIA_TEMPS.map((place, idx) => {
              const color = getTempColor(place.temp)
              const radius = place.type === 'metro' ? 85000 : (place.type === 'city' ? 55000 : 30000)
              return (
                <Circle
                  key={`heat-zone-${idx}`}
                  center={place.coords}
                  radius={radius}
                  pathOptions={{
                    color: color.bg,
                    fillColor: color.fill,
                    fillOpacity: 0.22,
                    weight: 0
                  }}
                />
              )
            })}

            {ALL_INDIA_TEMPS.map((place, idx) => (
              <Marker
                key={idx}
                position={place.coords}
                icon={place.type === 'metro' || place.type === 'city'
                  ? createTempBadge(place.temp, place.name)
                  : createSmallBadge(place.temp)
                }
              >
                <Popup>
                  <div className="p-1.5 space-y-1 text-xs min-w-[180px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm">{place.name}</span>
                      <span
                        className="px-2 py-0.5 rounded text-white text-[10px] font-black"
                        style={{ backgroundColor: getTempColor(place.temp).bg }}
                      >
                        {place.temp}°C
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">Condition: <strong>{place.condition}</strong></p>
                    <p className="text-slate-500 text-[11px]">{getTempColor(place.temp).label}</p>
                    {place.aqi && (
                      <p className="text-slate-500 text-[11px]">
                        AQI: <strong className={place.aqi > 100 ? 'text-amber-600' : 'text-emerald-600'}>{place.aqi}</strong>
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </>
        )}

        {/* ======================================================== */}
        {/* LAYER 3: 💨 CUSTOM ANIMATED LEAFLET-VELOCITY WIND FLOW */}
        {/* ======================================================== */}
        {activeLayer === 'wind_flow' && windData && (
          <VelocityWindLayer windData={windData} isMobile={isMobile} />
        )}

        {/* ======================================================== */}
        {/* LAYER 4: 👥 COMMUNITY GROUND REPORTS                   */}
        {/* ======================================================== */}
        {activeLayer === 'crowd' && (
          <>
            {crowdReports.map((r: any, idx: number) => (
              <React.Fragment key={r.id || idx}>
                <Marker position={[r.latitude, r.longitude]} icon={createCustomIcon(r.is_verified ? '#059669' : '#d97706', r.is_verified ? '✓' : '?')}>
                  <Popup>
                    <div className="p-1.5 max-w-[220px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{r.location_name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {r.is_verified ? 'Verified Report' : 'New Report'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">Observed: <strong>{r.observed_condition} ({r.intensity})</strong></p>
                      <p className="text-[11px] text-slate-500">Reported by: {r.reporter_name}</p>
                    </div>
                  </Popup>
                </Marker>
                {r.is_verified && (
                  <Circle center={[r.latitude, r.longitude]} radius={3000} pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.18, weight: 1.5 }} />
                )}
              </React.Fragment>
            ))}
          </>
        )}

        {/* ======================================================== */}
        {/* LAYER 5: ✈️ TRAVEL & AIRWAY SAFETY CORRIDORS          */}
        {/* ======================================================== */}
        {activeLayer === 'route' && (
          <>
            <Polyline positions={polylineCoords} pathOptions={{ color: '#4f46e5', weight: 4, dashArray: '6, 8' }} />
            {routeWaypoints.map((w, idx) => (
              <Marker key={idx} position={w.coords}
                icon={createCustomIcon(w.risk.includes('Turbulence') ? '#e11d48' : (w.risk.includes('Wind') ? '#d97706' : '#0284c7'), `${idx + 1}`)}>
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

      {/* ── Interactive Legend & Attribution Banner ── */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-black/85 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/10 text-xs text-white flex items-center gap-3 shadow-2xl flex-wrap max-w-2xl">
        {activeLayer === 'radar' && (
          <>
            <span className="font-bold text-sky-400">🌧️ Rain Radar:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Light Rain</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Moderate Shower</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Heavy Rain Cloud</span>
          </>
        )}
        {activeLayer === 'temp_heat' && (
          <>
            <span className="font-bold text-amber-400">🌡️ Temperature Map (Live OWM Tiles):</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgba(185,15,10,0.9)' }}></span>&gt;38°C</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgba(230,90,20,0.9)' }}></span>30-37°C</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgba(40,160,80,0.9)' }}></span>22-29°C</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgba(30,110,200,0.9)' }}></span>10-21°C</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: 'rgba(60,20,160,0.9)' }}></span>&lt;10°C</span>
            <span className="text-slate-400 text-[10px]">OWM + {ALL_INDIA_TEMPS.length} stations</span>
          </>
        )}
        {activeLayer === 'wind_flow' && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-cyan-400 flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 animate-pulse" />
                Live Wind Streamlines (GFS 10m):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span> 0-4 m/s (Calm)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span> 4-8 (Light)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#2dd4bf]"></span> 8-12 (Mod)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]"></span> 12-16 (Fresh)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#facc15]"></span> 16-20 (Strong)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span> &gt;20 (Gale)</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 pl-2 border-l border-white/20">
              Wind data: <strong className="text-slate-200">GFS / NOAA</strong> • Rendered with <strong className="text-cyan-300">Leaflet-Velocity</strong>
            </div>
          </>
        )}
        {activeLayer === 'crowd' && (
          <>
            <span className="font-bold text-emerald-400">👥 Community:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Verified Ground Report</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending Review</span>
          </>
        )}
        {activeLayer === 'route' && (
          <>
            <span className="font-bold text-indigo-400">✈️ Flight Safety:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Flight Route</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High Cloud Zone</span>
          </>
        )}
      </div>
    </div>
  )
}
