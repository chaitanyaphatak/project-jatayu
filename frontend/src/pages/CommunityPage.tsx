import React from 'react'
import { 
  Users, Trophy, MapPin, PlusCircle, Activity, 
  ShieldCheck, CheckCircle2, Award
} from 'lucide-react'

export default function CommunityPage({ 
  currentLocation, 
  crowdReports, 
  leaderboard, 
  nowcastCorrection,
  onOpenReportModal 
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            Community Ground Truth & Leaderboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            DBSCAN-verified peer reports & Hugging Face ViT Vision Transformer sky classification for <strong className="text-slate-800">{currentLocation?.name}</strong>
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 rounded-2xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 transition shadow-sm shadow-amber-500/20"
        >
          <PlusCircle className="w-4 h-4" /> Submit Ground Report (+15 Pts)
        </button>
      </div>

      {/* Top ML Card: Time-Series Nowcast Correction Model */}
      {nowcastCorrection && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-50 via-blue-50/60 to-indigo-50 border border-sky-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-600" />
              Hyperlocal Time-Series Correction Model
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-mono font-bold shadow-xs">
              Weight Alpha: {nowcastCorrection?.ml_corrected_nowcast?.ground_weight_alpha}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <p className="text-slate-500 font-medium">Official NWP (GFS/ECMWF)</p>
              <p className="text-2xl font-black text-slate-800 mt-1">
                Rain Prob: {nowcastCorrection?.official_forecast?.rain_prob}%
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Coarse 25km Grid Resolution</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
              <p className="text-emerald-800 font-medium">ML Ground-Truth Corrected</p>
              <p className="text-2xl font-black text-emerald-700 mt-1">
                Rain Prob: {nowcastCorrection?.ml_corrected_nowcast?.rain_prob}%
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                Adjusted by {nowcastCorrection?.ml_corrected_nowcast?.verified_peer_reports || 3} Verified Ground Peers
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 italic font-medium pt-1">
            "{nowcastCorrection?.explanation}"
          </p>
        </div>
      )}

      {/* Clustered Ground Reports List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-600" />
          Live DBSCAN Clustered Observations ({crowdReports?.length || 0} Reports Active)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crowdReports && crowdReports.length > 0 ? (
            crowdReports.map((r) => (
              <div 
                key={r.id} 
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{r.location_name}</span>
                    {r.is_verified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        ✓ DBSCAN Verified Cluster
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        Pending Cluster Peer
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700">
                    Observed: <strong className="capitalize">{r.observed_condition} ({r.intensity})</strong> | Reporter: {r.reporter_name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Vision AI: <span className="text-sky-700 font-semibold">{r.vision_predicted_label}</span> (Confidence: {Math.round((r.vision_confidence || 0.94) * 100)}%)
                  </p>
                </div>

                {r.image_url && (
                  <img 
                    src={r.image_url} 
                    alt="Sky condition" 
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 col-span-2 text-center py-6">
              No crowd reports yet for this sector. Be the first to report ground conditions!
            </p>
          )}
        </div>
      </div>

      {/* Community Trust Leaderboard */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-600" />
          Community Trust Leaderboard
        </h3>
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">Rank / Contributor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Verified Reports</th>
                <th className="py-3 px-4">Trust Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((item, idx) => (
                  <tr key={item.clerk_user_id || idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 flex items-center gap-2.5 font-semibold">
                      <span className="w-6 text-slate-400 font-bold">#{idx + 1}</span>
                      <span className="text-slate-900">{item.reporter_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-bold">
                        {item.badge}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 capitalize">{item.role}</td>
                    <td className="py-3 px-4 font-mono font-medium">{item.reports_verified}/{item.reports_submitted}</td>
                    <td className="py-3 px-4 font-black text-amber-600">
                      {item.trust_score} PTS
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-4 px-4 text-center text-slate-400">
                    Leaderboard syncing with ground truth network...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
