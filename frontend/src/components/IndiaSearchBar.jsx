import React, { useState, useEffect, useRef } from 'react'
import { Search, MapPin, Navigation, Sparkles, X, ChevronRight, Loader2, Building, TreePine, Mountain, Waves } from 'lucide-react'
import { INDIA_LOCATIONS, searchIndiaLocations } from '../data/indiaLocations'

export default function IndiaSearchBar({ currentLocation, onSelectLocation, onDetectLocation }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const dropdownRef = useRef(null)
  const debounceTimerRef = useRef(null)

  // Debounced search-as-you-type with Nominatim Pan-India Village & District Resolver
  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setSuggestions([])
      setLoading(false)
      return
    }

    const trimmed = query.trim()

    // First check instant local presets
    const localMatches = searchIndiaLocations(trimmed, 6)

    // Set immediate local matches while fetching deep online Nominatim village results
    if (localMatches.length > 0 && query.length < 3) {
      setSuggestions(localMatches)
      setIsOpen(true)
      return
    }

    setLoading(true)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    debounceTimerRef.current = setTimeout(async () => {
      try {
        // Query OpenStreetMap Nominatim with India country constraint and detailed address hierarchy
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=in&addressdetails=1&limit=10`,
          {
            headers: {
              'Accept-Language': 'en,hi'
            }
          }
        )

        if (res.ok) {
          const data = await res.json()

          const formattedResults = data.map((item) => {
            const addr = item.address || {}
            
            // Extract hierarchy: village / town / city / suburb / hamlet
            const placeName = addr.village || addr.town || addr.city || addr.suburb || addr.hamlet || addr.county || item.name || trimmed
            const district = addr.state_district || addr.district || addr.county || ''
            const state = addr.state || 'India'
            const postcode = addr.postcode ? ` - ${addr.postcode}` : ''
            
            // Sub-district / Tehsil / Block if available
            const tehsil = addr.suburb || addr.municipality || ''

            const fullContext = [placeName, tehsil, district, state].filter(Boolean).join(', ')

            return {
              name: `${placeName}, ${state}`,
              displayName: fullContext + postcode,
              placeName: placeName,
              district: district,
              state: state,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              type: addr.village ? 'Village (Gram Panchayat)' : (addr.town ? 'Town / Tehsil' : (addr.city ? 'City / District' : 'Regional Micro-Sector')),
              crop: 'Regional Agriculture',
              risk: 'Atmospheric Micro-climate'
            }
          })

          // Combine with relevant local presets
          const combined = [...localMatches, ...formattedResults]
          // De-duplicate by lat/lon proximity
          const unique = []
          const seen = new Set()
          for (const item of combined) {
            const key = `${item.lat.toFixed(2)}_${item.lon.toFixed(2)}`
            if (!seen.has(key)) {
              seen.add(key)
              unique.push(item)
            }
          }

          setSuggestions(unique.slice(0, 10))
          setIsOpen(true)
        }
      } catch (err) {
        console.warn('Nominatim village search error:', err)
        setSuggestions(localMatches)
      } finally {
        setLoading(false)
      }
    }, 320)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [query])

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reverse geocode live GPS coordinates to exact Indian village/city
  const handleGPSDetect = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4))
          const lon = parseFloat(pos.coords.longitude.toFixed(4))
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`)
            if (res.ok) {
              const data = await res.json()
              const addr = data.address || {}
              const place = addr.village || addr.town || addr.city || addr.suburb || 'Local Area'
              const state = addr.state || 'India'
              const district = addr.state_district || addr.district || ''
              
              onSelectLocation({
                name: `${place}, ${state}`,
                displayName: `${place}, ${district}, ${state}`,
                state: state,
                lat: lat,
                lon: lon,
                type: 'Live GPS Ground Station',
                crop: 'Local Agriculture',
                risk: 'Active Micro-climate'
              })
              setIsOpen(false)
            }
          } catch (e) {
            onDetectLocation()
          } finally {
            setLoading(false)
          }
        },
        (err) => {
          setLoading(false)
          alert('GPS location permission denied. Please search your village or city in the search bar.')
        }
      )
    }
  }

  // Filter preset locations
  const getFilteredPresets = () => {
    if (selectedCategory === 'All') return INDIA_LOCATIONS.slice(0, 8)
    return INDIA_LOCATIONS.filter(l => l.type.toLowerCase().includes(selectedCategory.toLowerCase()) || l.region.toLowerCase().includes(selectedCategory.toLowerCase())).slice(0, 8)
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input Box */}
      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-2xl px-3 py-1.5 focus-within:border-sky-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100 transition-all shadow-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any Indian village, tehsil, city, or pincode..."
          className="w-full bg-transparent outline-none text-xs md:text-sm text-slate-800 placeholder-slate-400 font-medium py-1"
        />

        {loading ? (
          <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
        ) : query ? (
          <button 
            onClick={() => { setQuery(''); setSuggestions([]) }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}

        <button
          onClick={handleGPSDetect}
          title="Detect Exact Village/City GPS"
          className="px-2 py-1 rounded-xl bg-white hover:bg-sky-50 text-sky-700 text-xs font-bold flex items-center gap-1 border border-slate-200 hover:border-sky-300 transition shrink-0 shadow-xs"
        >
          <Navigation className="w-3 h-3 text-sky-600" />
          <span className="hidden sm:inline">GPS</span>
        </button>
      </div>

      {/* Auto-Recommendations Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[420px] flex flex-col">
          
          {/* Category Chips Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-bold">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] mr-1 shrink-0">
              Quick Filter:
            </span>
            {[
              { id: 'All', label: 'All India' },
              { id: 'Metro', label: 'Metros' },
              { id: 'Agri-Hub', label: '🌾 Agri Hubs' },
              { id: 'Hill Station', label: '🏔️ Himalayas' },
              { id: 'Coastal', label: '🌊 Coastal Ports' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                  selectedCategory === cat.id 
                    ? 'bg-sky-600 text-white shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-slate-100">
            {suggestions.length > 0 ? (
              suggestions.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectLocation(loc)
                    setQuery('')
                    setIsOpen(false)
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-sky-50/80 transition flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg group-hover:bg-sky-200 transition mt-0.5 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-sky-900">
                        {loc.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {loc.displayName || `${loc.district ? loc.district + ', ' : ''}${loc.state}`}
                      </p>
                      {loc.crop && (
                        <p className="text-[10px] text-emerald-700 font-semibold">
                          🌾 Primary Crop: {loc.crop}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 shrink-0">
                    {loc.type}
                  </span>
                </button>
              ))
            ) : query.trim().length > 0 && !loading ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-slate-600">
                  No direct village match for <strong>"{query}"</strong>
                </p>
                <p className="text-[11px] text-slate-400">
                  Try typing the district or state name (e.g. "{query}, Satara" or "{query}, Uttar Pradesh").
                </p>
              </div>
            ) : (
              getFilteredPresets().map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectLocation(loc)
                    setIsOpen(false)
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-slate-900">
                        {loc.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {loc.state} • <span className="text-emerald-700 font-medium">{loc.crop}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                    {loc.type}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center font-medium">
            OpenStreetMap Nominatim village geocoder & 100+ Indian meteorological stations active
          </div>
        </div>
      )}
    </div>
  )
}
