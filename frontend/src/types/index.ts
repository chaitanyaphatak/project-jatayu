export interface LocationItem {
  name: string
  displayName?: string
  state: string
  region?: string
  lat: number
  lon: number
  type: string
  crop?: string
  risk?: string
}

export interface WeatherData {
  temp: number
  feelsLike: number
  condition: string
  humidity: number
  windSpeed: number
  surfacePressure: number
  rainProb: number
  aqi?: number
  sourcesUsed?: string[]
  modelAgreement?: number
  modelRating?: string
  contributingFactors?: string[]
  activityImpact?: any
}

export interface SystemAlert {
  title: string
  detail: string
  zScore?: string
  severity?: 'info' | 'warning' | 'critical'
}

export interface CrowdReport {
  id: string
  latitude: number
  longitude: number
  location_name: string
  observed_condition: string
  intensity: string
  reporter_name: string
  is_verified: boolean
  cluster_peer_count?: number
  timestamp?: string
}

export interface ChatMessage {
  id: number
  sender: 'user' | 'assistant'
  text: string
  explain?: {
    confidence: number
    models: string
    verdict: string
  }
}

export type UserRole = 'farmer' | 'pilot' | 'disaster_manager' | 'citizen'
