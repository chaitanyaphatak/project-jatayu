import React, { useState } from 'react'
import { X, Camera, MapPin, CheckCircle, Upload, Sparkles } from 'lucide-react'

export default function ReportModal({ isOpen, onClose, onSubmitReport }) {
  const [condition, setCondition] = useState('rainy')
  const [intensity, setIntensity] = useState('moderate')
  const [locationName, setLocationName] = useState('Haveli, Pune')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmitReport({
        latitude: 18.5204 + (Math.random() - 0.5) * 0.02,
        longitude: 73.8567 + (Math.random() - 0.5) * 0.02,
        location_name: locationName,
        observed_condition: condition,
        intensity: intensity,
        image_data_or_url: imageUrl || 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600'
      })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1200)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-3xl max-w-md w-full p-6 shadow-2xl shadow-sky-950/10 relative text-slate-800 animate-in zoom-in-95 duration-150">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit Ground Truth Report</h2>
            <p className="text-xs text-slate-500">Verified via Hugging Face Sky Vision ViT & DBSCAN</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
              <CheckCircle className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-emerald-800">Ground Report Submitted & Clustered!</p>
            <p className="text-xs text-slate-500">+15 Community Trust Points awarded to your profile.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Observed Weather Condition</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'clear', label: '☀️ Clear' },
                  { id: 'cloudy', label: '⛅ Cloudy' },
                  { id: 'rainy', label: '🌧️ Rainy' },
                  { id: 'stormy', label: '⛈️ Stormy' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCondition(item.id)}
                    className={`py-2 px-1 rounded-xl font-medium border text-center transition ${
                      condition === item.id 
                        ? 'bg-sky-50 text-sky-700 border-sky-300 font-bold shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Precipitation Intensity</label>
              <div className="grid grid-cols-3 gap-2">
                {['light', 'moderate', 'heavy'].map((intense) => (
                  <button
                    key={intense}
                    type="button"
                    onClick={() => setIntensity(intense)}
                    className={`py-2 rounded-xl capitalize font-medium border text-center transition ${
                      intensity === intense 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {intense}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Tehsil / Local Location</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus-within:border-sky-400 focus-within:bg-white transition">
                <MapPin className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <input 
                  type="text" 
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="bg-transparent w-full outline-none text-xs text-slate-800"
                  placeholder="e.g. Haveli, Sector 4 Farm"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Sky Photo <span className="font-normal text-slate-400">(Optional for Vision AI)</span>
              </label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus-within:border-sky-400 focus-within:bg-white transition">
                <Upload className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <input 
                  type="text" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="bg-transparent w-full outline-none text-xs text-slate-800 placeholder:text-slate-400"
                  placeholder="Paste image URL (or leave blank for auto-sample)"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Classified by Hugging Face ViT to detect nimbostratus & convective clouds.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold shadow-md shadow-sky-500/25 hover:shadow-lg transition flex items-center justify-center gap-2 text-xs"
            >
              {submitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Verifying with Vision & DBSCAN...
                </>
              ) : (
                'Submit Ground Report (+15 Pts)'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
