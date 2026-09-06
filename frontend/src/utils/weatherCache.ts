/**
 * Fast In-Memory Weather Telemetry Cache with Stale-While-Revalidate support
 * Stores normalized location weather responses for instant repeat lookups (0ms latency).
 */
import { WeatherData } from '../types'

interface CacheEntry {
  data: WeatherData
  timestamp: number
}

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes fresh
const STALE_TTL_MS = 15 * 60 * 1000 // 15 minutes max stale

const memoryCache = new Map<string, CacheEntry>()

export function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(4)}_${lon.toFixed(4)}`
}

export function getCachedWeather(lat: number, lon: number): { data: WeatherData | null; isStale: boolean } {
  const key = getCacheKey(lat, lon)
  const entry = memoryCache.get(key)

  if (!entry) {
    return { data: null, isStale: true }
  }

  const age = Date.now() - entry.timestamp
  if (age > STALE_TTL_MS) {
    memoryCache.delete(key)
    return { data: null, isStale: true }
  }

  return {
    data: entry.data,
    isStale: age > CACHE_TTL_MS
  }
}

export function setCachedWeather(lat: number, lon: number, data: WeatherData): void {
  const key = getCacheKey(lat, lon)
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

export function clearWeatherCache(): void {
  memoryCache.clear()
}
