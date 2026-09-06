/**
 * Weather Theme Mapping Engine & Visual Palette Configurations
 * Maps API condition codes (Open-Meteo WMO, WeatherAPI, OpenWeatherMap) and condition texts
 * to day and night visual themes.
 */

export type WeatherThemeKey =
  | 'sunny-day'
  | 'clear-night'
  | 'cloudy-day'
  | 'cloudy-night'
  | 'rainy-day'
  | 'rainy-night'
  | 'stormy-day'
  | 'stormy-night'
  | 'foggy-day'
  | 'foggy-night'
  | 'snowy-day'
  | 'snowy-night'

export interface WeatherThemeConfig {
  key: WeatherThemeKey
  type: 'sunny' | 'rainy' | 'cloudy' | 'stormy' | 'foggy' | 'snowy'
  isNight: boolean
  label: string
  // CSS background gradient for sky
  skyGradient: string
  // Light / dark text and glass styles for high contrast readability
  textPrimary: string
  textSecondary: string
  textMuted: string
  badgeBg: string
  badgeBorder: string
  badgeText: string
  glassBg: string
  glassBorder: string
  cardGlassBg: string
  accentGlow: string
  iconColor: string
}

export const WEATHER_THEMES: Record<WeatherThemeKey, WeatherThemeConfig> = {
  'sunny-day': {
    key: 'sunny-day',
    type: 'sunny',
    isNight: false,
    label: 'Sunny / Clear Day',
    skyGradient: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 45%, #fed7aa 100%)',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    badgeBg: 'bg-amber-100/90',
    badgeBorder: 'border-amber-300',
    badgeText: 'text-amber-900',
    glassBg: 'bg-white/75',
    glassBorder: 'border-white/60',
    cardGlassBg: 'rgba(255, 255, 255, 0.78)',
    accentGlow: 'rgba(251, 191, 36, 0.45)',
    iconColor: '#f59e0b',
  },
  'clear-night': {
    key: 'clear-night',
    type: 'sunny',
    isNight: true,
    label: 'Clear Starry Night',
    skyGradient: 'linear-gradient(135deg, #090d16 0%, #111827 40%, #1e1b4b 100%)',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    badgeBg: 'bg-indigo-950/80',
    badgeBorder: 'border-indigo-700/60',
    badgeText: 'text-indigo-200',
    glassBg: 'bg-slate-900/65',
    glassBorder: 'border-white/10',
    cardGlassBg: 'rgba(15, 23, 42, 0.70)',
    accentGlow: 'rgba(129, 140, 248, 0.35)',
    iconColor: '#a5b4fc',
  },
  'cloudy-day': {
    key: 'cloudy-day',
    type: 'cloudy',
    isNight: false,
    label: 'Cloudy / Overcast Day',
    skyGradient: 'linear-gradient(135deg, #475569 0%, #64748b 40%, #94a3b8 100%)',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    badgeBg: 'bg-slate-100/90',
    badgeBorder: 'border-slate-300',
    badgeText: 'text-slate-800',
    glassBg: 'bg-white/80',
    glassBorder: 'border-white/70',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
    accentGlow: 'rgba(148, 163, 184, 0.3)',
    iconColor: '#64748b',
  },
  'cloudy-night': {
    key: 'cloudy-night',
    type: 'cloudy',
    isNight: true,
    label: 'Cloudy Night',
    skyGradient: 'linear-gradient(135deg, #090d16 0%, #1e293b 45%, #334155 100%)',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    badgeBg: 'bg-slate-800/80',
    badgeBorder: 'border-slate-700',
    badgeText: 'text-slate-300',
    glassBg: 'bg-slate-900/70',
    glassBorder: 'border-white/10',
    cardGlassBg: 'rgba(15, 23, 42, 0.75)',
    accentGlow: 'rgba(100, 116, 139, 0.3)',
    iconColor: '#94a3b8',
  },
  'rainy-day': {
    key: 'rainy-day',
    type: 'rainy',
    isNight: false,
    label: 'Rainy Day',
    skyGradient: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 40%, #0f766e 100%)',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    badgeBg: 'bg-sky-100/90',
    badgeBorder: 'border-sky-300',
    badgeText: 'text-sky-900',
    glassBg: 'bg-white/80',
    glassBorder: 'border-white/60',
    cardGlassBg: 'rgba(255, 255, 255, 0.82)',
    accentGlow: 'rgba(14, 165, 233, 0.4)',
    iconColor: '#0284c7',
  },
  'rainy-night': {
    key: 'rainy-night',
    type: 'rainy',
    isNight: true,
    label: 'Rainy Night',
    skyGradient: 'linear-gradient(135deg, #030712 0%, #0b192c 45%, #132438 100%)',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    badgeBg: 'bg-sky-950/80',
    badgeBorder: 'border-sky-800/60',
    badgeText: 'text-sky-300',
    glassBg: 'bg-slate-900/70',
    glassBorder: 'border-white/10',
    cardGlassBg: 'rgba(15, 23, 42, 0.75)',
    accentGlow: 'rgba(56, 189, 248, 0.35)',
    iconColor: '#38bdf8',
  },
  'stormy-day': {
    key: 'stormy-day',
    type: 'stormy',
    isNight: false,
    label: 'Thunderstorm (Day)',
    skyGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #1f2937 100%)',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-300',
    badgeBg: 'bg-purple-950/90',
    badgeBorder: 'border-purple-600/70',
    badgeText: 'text-purple-200',
    glassBg: 'bg-slate-900/70',
    glassBorder: 'border-white/15',
    cardGlassBg: 'rgba(17, 24, 39, 0.78)',
    accentGlow: 'rgba(168, 85, 247, 0.45)',
    iconColor: '#c084fc',
  },
  'stormy-night': {
    key: 'stormy-night',
    type: 'stormy',
    isNight: true,
    label: 'Thunderstorm (Night)',
    skyGradient: 'linear-gradient(135deg, #05050d 0%, #13091f 40%, #0f172a 100%)',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    badgeBg: 'bg-purple-950/90',
    badgeBorder: 'border-purple-700/60',
    badgeText: 'text-purple-300',
    glassBg: 'bg-slate-900/75',
    glassBorder: 'border-white/10',
    cardGlassBg: 'rgba(10, 10, 20, 0.80)',
    accentGlow: 'rgba(192, 132, 252, 0.5)',
    iconColor: '#e9d5ff',
  },
  'foggy-day': {
    key: 'foggy-day',
    type: 'foggy',
    isNight: false,
    label: 'Foggy / Hazy Day',
    skyGradient: 'linear-gradient(135deg, #475569 0%, #94a3b8 40%, #cbd5e1 100%)',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    badgeBg: 'bg-slate-200/90',
    badgeBorder: 'border-slate-400',
    badgeText: 'text-slate-800',
    glassBg: 'bg-white/80',
    glassBorder: 'border-white/60',
    cardGlassBg: 'rgba(255, 255, 255, 0.84)',
    accentGlow: 'rgba(203, 213, 225, 0.4)',
    iconColor: '#64748b',
  },
  'foggy-night': {
    key: 'foggy-night',
    type: 'foggy',
    isNight: true,
    label: 'Foggy / Mist (Night)',
    skyGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    badgeBg: 'bg-slate-800/80',
    badgeBorder: 'border-slate-700',
    badgeText: 'text-slate-300',
    glassBg: 'bg-slate-900/70',
    glassBorder: 'border-white/10',
    cardGlassBg: 'rgba(15, 23, 42, 0.75)',
    accentGlow: 'rgba(148, 163, 184, 0.3)',
    iconColor: '#94a3b8',
  },
  'snowy-day': {
    key: 'snowy-day',
    type: 'snowy',
    isNight: false,
    label: 'Snowy Day',
    skyGradient: 'linear-gradient(135deg, #38bdf8 0%, #bae6fd 40%, #e0f2fe 100%)',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-600',
    badgeBg: 'bg-sky-100/90',
    badgeBorder: 'border-sky-300',
    badgeText: 'text-sky-900',
    glassBg: 'bg-white/80',
    glassBorder: 'border-white/70',
    cardGlassBg: 'rgba(255, 255, 255, 0.85)',
    accentGlow: 'rgba(224, 242, 254, 0.6)',
    iconColor: '#0ea5e9',
  },
  'snowy-night': {
    key: 'snowy-night',
    type: 'snowy',
    isNight: true,
    label: 'Snowy Night',
    skyGradient: 'linear-gradient(135deg, #030712 0%, #0c1829 40%, #172554 100%)',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    badgeBg: 'bg-blue-950/80',
    badgeBorder: 'border-blue-800/60',
    badgeText: 'text-blue-200',
    glassBg: 'bg-slate-900/70',
    glassBorder: 'border-white/10',
    cardGlassBg: 'rgba(15, 23, 42, 0.75)',
    accentGlow: 'rgba(191, 219, 254, 0.4)',
    iconColor: '#93c5fd',
  },
}

/**
 * Maps condition codes (WMO / Open-Meteo, WeatherAPI, OpenWeatherMap) or condition text
 * into one of the designated theme keys.
 *
 * @param conditionCode - Numeric code or string condition description
 * @param isDayTime - Explicit boolean day indicator. If undefined, defaults based on current hour
 * @param options - Optional extra context (local hour, sunrise/sunset time)
 */
export function getWeatherTheme(
  conditionCode?: number | string | { code?: number; weatherCode?: number; conditionCode?: number; condition?: string; isDay?: boolean },
  isDayTime?: boolean,
  options?: { localHour?: number; sunrise?: string; sunset?: string }
): WeatherThemeKey {
  let code: number | undefined
  let conditionStr = ''
  let resolvedIsDay = isDayTime

  // Unpack object argument if provided
  if (typeof conditionCode === 'object' && conditionCode !== null) {
    code = conditionCode.weatherCode !== undefined 
      ? conditionCode.weatherCode 
      : (conditionCode.conditionCode !== undefined ? conditionCode.conditionCode : conditionCode.code)
    conditionStr = conditionCode.condition || ''
    if (resolvedIsDay === undefined && conditionCode.isDay !== undefined) {
      resolvedIsDay = conditionCode.isDay
    }
  } else if (typeof conditionCode === 'number') {
    code = conditionCode
  } else if (typeof conditionCode === 'string') {
    conditionStr = conditionCode
  }

  // Resolve Day vs Night if not explicitly provided
  if (resolvedIsDay === undefined) {
    const currentHour = options?.localHour !== undefined ? options.localHour : new Date().getHours()
    // By default 6:00 AM to 6:45 PM is considered Day
    resolvedIsDay = currentHour >= 6 && currentHour < 19
  }

  const isNight = !resolvedIsDay
  const normalizedText = conditionStr.toLowerCase()

  // ─── 1. Check WMO / Open-Meteo Standard Codes (0-99) ───
  if (code !== undefined) {
    // WMO Thunderstorm: 95, 96, 99
    if ([95, 96, 99].includes(code) || (code >= 200 && code < 300) || [1087, 1273, 1276, 1279, 1282].includes(code)) {
      return isNight ? 'stormy-night' : 'stormy-day'
    }

    // WMO Snow: 71, 73, 75, 77, 85, 86 or OpenWeather 6xx or WeatherAPI 1066, 1210-1258
    if (
      [71, 73, 75, 77, 85, 86].includes(code) ||
      (code >= 600 && code < 700) ||
      [1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255, 1258].includes(code)
    ) {
      return isNight ? 'snowy-night' : 'snowy-day'
    }

    // WMO Rain & Drizzle: 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82 or OpenWeather 3xx, 5xx
    if (
      [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code) ||
      (code >= 300 && code < 600) ||
      [1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)
    ) {
      return isNight ? 'rainy-night' : 'rainy-day'
    }

    // WMO Fog / Mist: 45, 48 or OpenWeather 7xx or WeatherAPI 1030, 1135, 1147
    if (
      [45, 48].includes(code) ||
      (code >= 700 && code < 800) ||
      [1030, 1135, 1147].includes(code)
    ) {
      return isNight ? 'foggy-night' : 'foggy-day'
    }

    // WMO Clouds: 1, 2, 3 or OpenWeather 801-804 or WeatherAPI 1003, 1006, 1009
    if (
      [1, 2, 3].includes(code) ||
      (code >= 801 && code <= 804) ||
      [1003, 1006, 1009].includes(code)
    ) {
      return isNight ? 'cloudy-night' : 'cloudy-day'
    }

    // Clear Sky: 0 or OpenWeather 800 or WeatherAPI 1000
    if (code === 0 || code === 800 || code === 1000) {
      return isNight ? 'clear-night' : 'sunny-day'
    }
  }

  // ─── 2. Fallback String Condition Matching ───
  if (normalizedText) {
    if (
      normalizedText.includes('thunder') ||
      normalizedText.includes('storm') ||
      normalizedText.includes('lightning') ||
      normalizedText.includes('cyclone')
    ) {
      return isNight ? 'stormy-night' : 'stormy-day'
    }

    if (
      normalizedText.includes('snow') ||
      normalizedText.includes('blizzard') ||
      normalizedText.includes('flurry') ||
      normalizedText.includes('sleet')
    ) {
      return isNight ? 'snowy-night' : 'snowy-day'
    }

    if (
      normalizedText.includes('rain') ||
      normalizedText.includes('drizzle') ||
      normalizedText.includes('shower') ||
      normalizedText.includes('monsoon') ||
      normalizedText.includes('downpour')
    ) {
      return isNight ? 'rainy-night' : 'rainy-day'
    }

    if (
      normalizedText.includes('fog') ||
      normalizedText.includes('mist') ||
      normalizedText.includes('haze') ||
      normalizedText.includes('smoke') ||
      normalizedText.includes('dust') ||
      normalizedText.includes('humid')
    ) {
      return isNight ? 'foggy-night' : 'foggy-day'
    }

    if (
      normalizedText.includes('cloud') ||
      normalizedText.includes('overcast') ||
      normalizedText.includes('stratocumulus') ||
      normalizedText.includes('cumulus') ||
      normalizedText.includes('gloomy')
    ) {
      return isNight ? 'cloudy-night' : 'cloudy-day'
    }

    if (
      normalizedText.includes('sun') ||
      normalizedText.includes('clear') ||
      normalizedText.includes('fair') ||
      normalizedText.includes('fine')
    ) {
      return isNight ? 'clear-night' : 'sunny-day'
    }
  }

  // Default fallback
  return isNight ? 'clear-night' : 'sunny-day'
}
