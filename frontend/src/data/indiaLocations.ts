// Comprehensive Pan-India Geolocation Database (All 28 States & 8 Union Territories)
export const INDIA_LOCATIONS = [
  // --- METROS & CAPITAL REGIONS ---
  { name: 'New Delhi, Delhi NCR', state: 'Delhi', region: 'North', lat: 28.6139, lon: 77.2090, type: 'Metro', crop: 'Urban / Garden', risk: 'Heatwave & AQI' },
  { name: 'Noida, Uttar Pradesh', state: 'Uttar Pradesh', region: 'North', lat: 28.5355, lon: 77.3910, type: 'Urban', crop: 'Vegetables', risk: 'AQI Anomaly' },
  { name: 'Gurugram, Haryana', state: 'Haryana', region: 'North', lat: 28.4595, lon: 77.0266, type: 'Urban', crop: 'Mustard / Wheat', risk: 'Urban Inundation' },
  { name: 'Mumbai, Maharashtra', state: 'Maharashtra', region: 'West', lat: 19.0760, lon: 72.8777, type: 'Metro / Coastal', crop: 'Coastal Horticulture', risk: 'Monsoon High Tide' },
  { name: 'Navi Mumbai, Maharashtra', state: 'Maharashtra', region: 'West', lat: 19.0330, lon: 73.0297, type: 'Urban', crop: 'Paddy', risk: 'High Precipitation' },
  { name: 'Pune (Haveli), Maharashtra', state: 'Maharashtra', region: 'West', lat: 18.5204, lon: 73.8567, type: 'Agri-Metro', crop: 'Soybean & Sugarcane', risk: 'Convective Updraft' },
  { name: 'Bengaluru, Karnataka', state: 'Karnataka', region: 'South', lat: 12.9716, lon: 77.5946, type: 'Metro', crop: 'Ragi & Vegetables', risk: 'Localized Flash Inundation' },
  { name: 'Hyderabad, Telangana', state: 'Telangana', region: 'South', lat: 17.3850, lon: 78.4867, type: 'Metro', crop: 'Cotton & Paddy', risk: 'Convective Storms' },
  { name: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', region: 'South', lat: 13.0827, lon: 80.2707, type: 'Metro / Coastal', crop: 'Paddy & Groundnut', risk: 'NE Monsoon Cyclonic' },
  { name: 'Kolkata, West Bengal', state: 'West Bengal', region: 'East', lat: 22.5726, lon: 88.3639, type: 'Metro / Coastal', crop: 'Jute & Paddy', risk: 'Bay of Bengal Depressions' },
  { name: 'Ahmedabad, Gujarat', state: 'Gujarat', region: 'West', lat: 23.0225, lon: 72.5714, type: 'Metro', crop: 'Cotton & Groundnut', risk: 'Extreme Summer Heat' },

  // --- MAHARASHTRA (AGRI & HILL HUBS) ---
  { name: 'Nashik (Panchavati), Maharashtra', state: 'Maharashtra', region: 'West', lat: 19.9975, lon: 73.7898, type: 'Agri-Hub', crop: 'Grapes & Onion', risk: 'Unseasonal Hail' },
  { name: 'Nagpur (Vidarbha), Maharashtra', state: 'Maharashtra', region: 'West', lat: 21.1458, lon: 79.0882, type: 'Agri-Hub', crop: 'Orange & Cotton', risk: 'Heatwave & Drought' },
  { name: 'Chhatrapati Sambhajinagar (Aurangabad)', state: 'Maharashtra', region: 'West', lat: 19.8762, lon: 75.3433, type: 'Agri-Hub', crop: 'Cotton & Maize', risk: 'Dry Spell Saturation' },
  { name: 'Kolhapur, Maharashtra', state: 'Maharashtra', region: 'West', lat: 16.7050, lon: 74.2433, type: 'Agri-Hub', crop: 'Sugarcane & Rice', risk: 'Panchganga Flood Inundation' },
  { name: 'Solapur, Maharashtra', state: 'Maharashtra', region: 'West', lat: 17.6599, lon: 75.9064, type: 'Agri-Hub', crop: 'Pomegranate & Jowar', risk: 'Arid Heatwave' },
  { name: 'Mahabaleshwar / Western Ghats', state: 'Maharashtra', region: 'West', lat: 17.9237, lon: 73.6586, type: 'Hill Station', crop: 'Strawberry', risk: 'Extreme Orographic Rain' },
  { name: 'Lonavala / Bhor Ghat Corridor', state: 'Maharashtra', region: 'West', lat: 18.7500, lon: 73.4000, type: 'Aviation Waypoint', crop: 'Horticulture', risk: 'Flight Turbulence (FL180)' },
  { name: 'Baramati, Maharashtra', state: 'Maharashtra', region: 'West', lat: 18.1517, lon: 74.5772, type: 'Agri-Hub', crop: 'Sugarcane & Grapes', risk: 'Frost & Spray Drift' },

  // --- NORTH INDIA & PUNJAB/HARYANA/UP ---
  { name: 'Ludhiana, Punjab', state: 'Punjab', region: 'North', lat: 30.9010, lon: 75.8573, type: 'Agri-Hub', crop: 'Wheat & Paddy', risk: 'Western Disturbance' },
  { name: 'Amritsar, Punjab', state: 'Punjab', region: 'North', lat: 31.6340, lon: 74.8723, type: 'Agri-Hub', crop: 'Wheat & Mustard', risk: 'Dense Winter Fog' },
  { name: 'Karnal, Haryana', state: 'Haryana', region: 'North', lat: 29.6857, lon: 76.9905, type: 'Agri-Hub', crop: 'Basmati Rice & Wheat', risk: 'Sudden Squall' },
  { name: 'Hisar, Haryana', state: 'Haryana', region: 'North', lat: 29.1492, lon: 75.7217, type: 'Agri-Hub', crop: 'Cotton & Mustard', risk: 'Dust Storm (Andhi)' },
  { name: 'Lucknow, Uttar Pradesh', state: 'Uttar Pradesh', region: 'North', lat: 26.8467, lon: 80.9462, type: 'State Capital', crop: 'Mango & Wheat', risk: 'Humid Heat Index' },
  { name: 'Varanasi, Uttar Pradesh', state: 'Uttar Pradesh', region: 'North', lat: 25.3176, lon: 82.9739, type: 'Cultural / River', crop: 'Paddy & Vegetables', risk: 'Ganga Flood Level' },
  { name: 'Agra, Uttar Pradesh', state: 'Uttar Pradesh', region: 'North', lat: 27.1767, lon: 78.0081, type: 'Heritage', crop: 'Potato & Mustard', risk: 'Summer Loo Winds' },
  { name: 'Kanpur, Uttar Pradesh', state: 'Uttar Pradesh', region: 'North', lat: 26.4499, lon: 80.3319, type: 'Industrial', crop: 'Wheat & Pulses', risk: 'Smog & Heatwave' },
  { name: 'Jaipur, Rajasthan', state: 'Rajasthan', region: 'North-West', lat: 26.9124, lon: 75.7873, type: 'State Capital', crop: 'Mustard & Pearl Millet', risk: 'Heatwave Anomaly' },
  { name: 'Jodhpur, Rajasthan', state: 'Rajasthan', region: 'North-West', lat: 26.2389, lon: 73.0243, type: 'Arid Hub', crop: 'Bajra & Guar', risk: 'Extreme Heat & Aridity' },
  { name: 'Udaipur, Rajasthan', state: 'Rajasthan', region: 'North-West', lat: 24.5854, lon: 73.7125, type: 'Hilly Arid', crop: 'Maize & Wheat', risk: 'Sudden Flash Runoff' },
  { name: 'Kota, Rajasthan', state: 'Rajasthan', region: 'North-West', lat: 25.2138, lon: 75.8648, type: 'Agri / Education', crop: 'Soybean & Coriander', risk: 'Chambal Inundation' },

  // --- HIMALAYAS & HILL STATIONS ---
  { name: 'Srinagar, Jammu & Kashmir', state: 'Jammu and Kashmir', region: 'North', lat: 34.0837, lon: 74.7973, type: 'Hill Valley', crop: 'Apple & Saffron', risk: 'Heavy Snowfall / Frost' },
  { name: 'Leh, Ladakh', state: 'Ladakh', region: 'North', lat: 34.1526, lon: 77.5771, type: 'High Altitude', crop: 'Barley & Buckwheat', risk: 'Cloudburst & Sub-Zero' },
  { name: 'Jammu, Jammu & Kashmir', state: 'Jammu and Kashmir', region: 'North', lat: 32.7266, lon: 74.8570, type: 'Sub-Himalayan', crop: 'Basmati & Maize', risk: 'Monsoon Flash Flood' },
  { name: 'Shimla, Himachal Pradesh', state: 'Himachal Pradesh', region: 'North', lat: 31.1048, lon: 77.1734, type: 'Hill Station', crop: 'Apple & Cherries', risk: 'Landslide & Convection' },
  { name: 'Manali, Himachal Pradesh', state: 'Himachal Pradesh', region: 'North', lat: 32.2432, lon: 77.1892, type: 'High Valley', crop: 'Apple & Plum', risk: 'Beas River Swell' },
  { name: 'Dharamshala, Himachal Pradesh', state: 'Himachal Pradesh', region: 'North', lat: 32.2190, lon: 76.3234, type: 'Hill Station', crop: 'Kangra Tea', risk: 'Extreme Monsoon Rainfall' },
  { name: 'Dehradun, Uttarakhand', state: 'Uttarakhand', region: 'North', lat: 30.3165, lon: 78.0322, type: 'State Capital', crop: 'Basmati & Litchi', risk: 'Convective Storms' },
  { name: 'Rishikesh / Haridwar, Uttarakhand', state: 'Uttarakhand', region: 'North', lat: 29.9457, lon: 78.1642, type: 'River Plains', crop: 'Sugarcane', risk: 'Ganga Reservoir Spills' },
  { name: 'Nainital, Uttarakhand', state: 'Uttarakhand', region: 'North', lat: 29.3919, lon: 79.4542, type: 'Lake District', crop: 'Horticulture', risk: 'Debris Flow' },

  // --- GUJARAT & WEST ---
  { name: 'Surat, Gujarat', state: 'Gujarat', region: 'West', lat: 21.1702, lon: 72.8311, type: 'Coastal / Industrial', crop: 'Sugarcane & Banana', risk: 'Tapi River Spate' },
  { name: 'Vadodara, Gujarat', state: 'Gujarat', region: 'West', lat: 22.3072, lon: 73.1812, type: 'Urban Hub', crop: 'Cotton & Tobacco', risk: 'Vishwamitri River Surge' },
  { name: 'Rajkot, Gujarat', state: 'Gujarat', region: 'West', lat: 22.3039, lon: 70.8022, type: 'Saurashtra Hub', crop: 'Groundnut & Sesame', risk: 'Cyclone Tracking' },
  { name: 'Bhuj (Kutch), Gujarat', state: 'Gujarat', region: 'West', lat: 23.2420, lon: 69.6669, type: 'Arid Coastal', crop: 'Dates & Cotton', risk: 'Arabian Sea Cyclones' },
  { name: 'Panaji / Goa Coast', state: 'Goa', region: 'West', lat: 15.4909, lon: 73.8278, type: 'Coastal Resort', crop: 'Cashew & Coconut', risk: 'Monsoon Sea Squall' },

  // --- SOUTH INDIA (KARNATAKA, TN, AP, TELANGANA, KERALA) ---
  { name: 'Mysuru, Karnataka', state: 'Karnataka', region: 'South', lat: 12.2958, lon: 76.6394, type: 'Heritage Hub', crop: 'Sugarcane & Paddy', risk: 'Cauvery Basin Highflow' },
  { name: 'Hubballi-Dharwad, Karnataka', state: 'Karnataka', region: 'South', lat: 15.3647, lon: 75.1240, type: 'Agri-Hub', crop: 'Cotton & Chilli', risk: 'Intermittent Dry Spell' },
  { name: 'Mangaluru Coast, Karnataka', state: 'Karnataka', region: 'South', lat: 12.9141, lon: 74.8560, type: 'Coastal Port', crop: 'Arecanut & Coconut', risk: 'Coastal High Surf' },
  { name: 'Coimbatore, Tamil Nadu', state: 'Tamil Nadu', region: 'South', lat: 11.0168, lon: 76.9558, type: 'Agri-Industrial', crop: 'Cotton & Tea', risk: 'Palakkad Gap Wind Shear' },
  { name: 'Madurai, Tamil Nadu', state: 'Tamil Nadu', region: 'South', lat: 9.9252, lon: 78.1198, type: 'Temple City', crop: 'Jasmine & Paddy', risk: 'High Heat Index' },
  { name: 'Tiruchirappalli, Tamil Nadu', state: 'Tamil Nadu', region: 'South', lat: 10.7905, lon: 78.7047, type: 'Delta Hub', crop: 'Banana & Rice', risk: 'Cauvery Delta Spate' },
  { name: 'Visakhapatnam, Andhra Pradesh', state: 'Andhra Pradesh', region: 'South', lat: 17.6868, lon: 83.2185, type: 'Coastal Port', crop: 'Paddy & Cashew', risk: 'Severe Cyclonic Storms' },
  { name: 'Vijayawada, Andhra Pradesh', state: 'Andhra Pradesh', region: 'South', lat: 16.5062, lon: 80.6480, type: 'Delta City', crop: 'Mango & Tobacco', risk: 'Krishna River Crest' },
  { name: 'Guntur, Andhra Pradesh', state: 'Andhra Pradesh', region: 'South', lat: 16.3067, lon: 80.4365, type: 'Agri-Hub', crop: 'Chilli & Cotton', risk: 'Monsoon Inundation' },
  { name: 'Tirupati, Andhra Pradesh', state: 'Andhra Pradesh', region: 'South', lat: 13.6288, lon: 79.4192, type: 'Foothill Hub', crop: 'Groundnut & Rice', risk: 'Convective Showers' },
  { name: 'Warangal, Telangana', state: 'Telangana', region: 'South', lat: 17.9689, lon: 79.5941, type: 'Agri-Hub', crop: 'Cotton & Chilli', risk: 'Heat Anomaly' },
  { name: 'Kochi (Cochin), Kerala', state: 'Kerala', region: 'South', lat: 9.9312, lon: 76.2673, type: 'Coastal Port', crop: 'Spices & Rubber', risk: 'Arabian Sea Inundation' },
  { name: 'Thiruvananthapuram, Kerala', state: 'Kerala', region: 'South', lat: 8.5241, lon: 76.9366, type: 'State Capital', crop: 'Coconut & Tapioca', risk: 'Onset of SW Monsoon' },
  { name: 'Kozhikode (Calicut), Kerala', state: 'Kerala', region: 'South', lat: 11.2588, lon: 75.7804, type: 'Malabar Coast', crop: 'Black Pepper & Areca', risk: 'Heavy Monsoon Runoff' },
  { name: 'Munnar / Idukki, Kerala', state: 'Kerala', region: 'South', lat: 10.0889, lon: 77.0595, type: 'High Range', crop: 'Tea & Cardamom', risk: 'Landslide Saturation' },

  // --- CENTRAL & EAST INDIA ---
  { name: 'Bhopal, Madhya Pradesh', state: 'Madhya Pradesh', region: 'Central', lat: 23.2599, lon: 77.4126, type: 'State Capital', crop: 'Soybean & Wheat', risk: 'Summer Heatwave' },
  { name: 'Indore (Malwa), Madhya Pradesh', state: 'Madhya Pradesh', region: 'Central', lat: 22.7196, lon: 75.8577, type: 'Agri-Metro', crop: 'Soybean & Potato', risk: 'Micro-burst Storms' },
  { name: 'Jabalpur, Madhya Pradesh', state: 'Madhya Pradesh', region: 'Central', lat: 23.1815, lon: 79.9864, type: 'Narmada Valley', crop: 'Wheat & Pulses', risk: 'Narmada High Flow' },
  { name: 'Gwalior, Madhya Pradesh', state: 'Madhya Pradesh', region: 'Central', lat: 26.2183, lon: 78.1828, type: 'Chambal Hub', crop: 'Mustard & Gram', risk: 'Extreme 46°C+ Heat' },
  { name: 'Raipur, Chhattisgarh', state: 'Chhattisgarh', region: 'Central', lat: 21.2514, lon: 81.6296, type: 'Rice Bowl Hub', crop: 'Paddy & Maize', risk: 'Convective Lightning' },
  { name: 'Bhubaneswar, Odisha', state: 'Odisha', region: 'East', lat: 20.2961, lon: 85.8245, type: 'State Capital', crop: 'Paddy & Pulses', risk: 'Tropical Cyclone Track' },
  { name: 'Puri Coast, Odisha', state: 'Odisha', region: 'East', lat: 19.8135, lon: 85.8312, type: 'Coastal Pilgrimage', crop: 'Betel Vine & Coconut', risk: 'Storm Surge & Gale' },
  { name: 'Cuttack, Odisha', state: 'Odisha', region: 'East', lat: 20.4625, lon: 85.8828, type: 'Mahanadi Delta', crop: 'Rice & Vegetables', risk: 'Mahanadi Flood Inundation' },
  { name: 'Patna, Bihar', state: 'Bihar', region: 'East', lat: 25.5941, lon: 85.1376, type: 'State Capital', crop: 'Paddy & Maize', risk: 'Ganga Flood Stage' },
  { name: 'Gaya, Bihar', state: 'Bihar', region: 'East', lat: 24.7914, lon: 85.0002, type: 'Valley Hub', crop: 'Pulses & Wheat', risk: 'Severe Heatwave' },
  { name: 'Muzaffarpur, Bihar', state: 'Bihar', region: 'East', lat: 26.1209, lon: 85.3647, type: 'Agri-Hub', crop: 'Shahi Litchi & Maize', risk: 'Burhi Gandak Inundation' },
  { name: 'Ranchi, Jharkhand', state: 'Jharkhand', region: 'East', lat: 23.3441, lon: 85.3096, type: 'Plateau Capital', crop: 'Paddy & Vegetables', risk: 'Severe Lightning Strikes' },
  { name: 'Jamshedpur, Jharkhand', state: 'Jharkhand', region: 'East', lat: 22.8046, lon: 86.2029, type: 'Industrial City', crop: 'Horticulture', risk: 'Subarnarekha Rise' },

  // --- NORTH-EAST INDIA ---
  { name: 'Guwahati, Assam', state: 'Assam', region: 'North-East', lat: 26.1445, lon: 91.7362, type: 'Gateway Metro', crop: 'Assam Tea & Rice', risk: 'Brahmaputra Flood Peak' },
  { name: 'Dibrugarh, Assam', state: 'Assam', region: 'North-East', lat: 27.4728, lon: 94.9120, type: 'Tea Capital', crop: 'CTC Tea & Mustard', risk: 'River Bank Erosion' },
  { name: 'Shillong, Meghalaya', state: 'Meghalaya', region: 'North-East', lat: 25.5788, lon: 91.8933, type: 'Hill Station', crop: 'Ginger & Pineapple', risk: 'Extreme High Precipitation' },
  { name: 'Cherrapunji (Sohra), Meghalaya', state: 'Meghalaya', region: 'North-East', lat: 25.2702, lon: 91.7323, type: 'Rain Peak', crop: 'Oranges & Betel', risk: 'World Highest Rainfall' },
  { name: 'Gangtok, Sikkim', state: 'Sikkim', region: 'North-East', lat: 27.3389, lon: 88.6065, type: 'Himalayan Capital', crop: 'Large Cardamom', risk: 'Flash Flood & Landslide' },
  { name: 'Imphal, Manipur', state: 'Manipur', region: 'North-East', lat: 24.8170, lon: 93.9368, type: 'State Capital', crop: 'Black Rice & Maize', risk: 'Loktak Lake Swell' },
  { name: 'Agartala, Tripura', state: 'Tripura', region: 'North-East', lat: 23.8315, lon: 91.2868, type: 'State Capital', crop: 'Rubber & Tea', risk: 'Howrah River Flash Flood' },
  { name: 'Aizawl, Mizoram', state: 'Mizoram', region: 'North-East', lat: 23.7271, lon: 92.7176, type: 'Hill Capital', crop: 'Bamboo & Ginger', risk: 'Hillside Slope Failure' },
  { name: 'Kohima, Nagaland', state: 'Nagaland', region: 'North-East', lat: 25.6751, lon: 94.1086, type: 'Hill Capital', crop: 'Naga King Chilli', risk: 'Cloudburst & Fog' },
  { name: 'Itanagar, Arunachal Pradesh', state: 'Arunachal Pradesh', region: 'North-East', lat: 27.0844, lon: 93.6053, type: 'State Capital', crop: 'Kiwi & Cardamom', risk: 'Monsoon Flash Inundation' },

  // --- ISLANDS & UNION TERRITORIES ---
  { name: 'Port Blair, Andaman & Nicobar', state: 'Andaman and Nicobar', region: 'Islands', lat: 11.6234, lon: 92.7265, type: 'Island Capital', crop: 'Coconut & Arecanut', risk: 'Tropical Cyclones & Surge' },
  { name: 'Puducherry (Pondicherry)', state: 'Puducherry', region: 'South', lat: 11.9416, lon: 79.8083, type: 'Coastal UT', crop: 'Paddy & Cashew', risk: 'Coastal Sea Squalls' },
  { name: 'Daman & Diu, UT', state: 'Daman and Diu', region: 'West', lat: 20.4283, lon: 72.8397, type: 'Coastal UT', crop: 'Fishing / Palm', risk: 'Arabian Sea Swell' }
]

// Fuzzy match search helper for auto-recommendations
export function searchIndiaLocations(query, limit = 8) {
  if (!query || query.trim().length === 0) return []
  const clean = query.toLowerCase().trim()
  
  return INDIA_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(clean) ||
    loc.state.toLowerCase().includes(clean) ||
    loc.region.toLowerCase().includes(clean) ||
    loc.crop.toLowerCase().includes(clean)
  ).slice(0, limit)
}
