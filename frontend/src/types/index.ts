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

export interface WeatherSourceReading {
  name: string
  short_name: string
  temp: number
  feels_like?: number
  weight_percent: number
  raw_weight: number
  status: 'active' | 'excluded_anomaly' | string
  model_desc?: string
}

export interface WeatherData {
  temp: number
  feelsLike: number
  condition: string
  humidity: number
  windSpeed: number
  surfacePressure: number
  rainProb: number
  weatherCode?: number
  isDay?: boolean
  conditionCode?: number
  sunrise?: string
  sunset?: string
  aqi?: number
  visibility?: number
  uvIndex?: number
  sourcesUsed?: string[]
  sourceReadings?: WeatherSourceReading[]
  confidenceLevel?: 'high' | 'moderate' | 'low' | string
  confidenceLabel?: string
  confidenceDesc?: string
  confidenceSpread?: number
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
