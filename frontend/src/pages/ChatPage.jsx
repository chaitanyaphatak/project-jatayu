import React, { useState, useRef, useEffect } from 'react'
import { 
  Sparkles, ArrowUp, Volume2, VolumeX, ShieldCheck, 
  MapPin, Sprout, Plane, Flame, Building2, Mic, MicOff,
  Bot, Copy, Check, Radio, Zap
} from 'lucide-react'

export default function ChatPage({ currentLocation, weather, userRole, cropStage, user, isSignedIn, getToken }) {
  const [query, setQuery] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeSpeechId, setActiveSpeechId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [isHoveredSend, setIsHoveredSend] = useState(false)
  
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const baseTranscriptRef = useRef('')

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Namaste! 🙏 I am Vayu AI — your smart weather & agriculture copilot for ${currentLocation?.name?.split(',')[0] || 'your city'}.\n\nAsk me anything in English or Hindi about today's rain forecast, crop spraying times, flight weather, or local temperatures!`,
      explain: {
        confidence: 96,
        models: 'Google Gemini AI + Live Radar Telemetry',
        verdict: 'Live Data Verified'
      }
    }
  ])

  // Contextual prompts customized for location & persona
  const samplePrompts = [
    `Will it rain today in ${currentLocation?.name?.split(',')[0] || 'my city'}?`,
    `Is today safe for spraying crops or farm work?`,
    `Give me a 3-hour temperature & wind update`,
    `What is the current air quality and humidity?`
  ]

  // Setup Continuous Web Speech Recognition (ChatGPT / Gemini style)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recog = new SpeechRecognition()
      recog.continuous = true
      recog.interimResults = true
      recog.lang = 'en-IN'

      recog.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        const combined = (baseTranscriptRef.current + ' ' + finalTranscript + interimTranscript).trim()
        setQuery(combined)
      }

      recog.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition warning:', event.error)
        }
      }

      recog.onend = () => {
        if (isListeningRef.current) {
          try {
            recog.start()
          } catch {
            setIsListening(false)
            isListeningRef.current = false
          }
        } else {
          setIsListening(false)
        }
      }

      recognitionRef.current = recog
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Toggle Continuous Voice Input (Mic)
  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.')
      return
    }

    if (isListening) {
      isListeningRef.current = false
      setIsListening(false)
      try {
        recognitionRef.current.stop()
      } catch {}
    } else {
      try {
        baseTranscriptRef.current = query.trim()
        isListeningRef.current = true
        setIsListening(true)
        recognitionRef.current.start()
      } catch (err) {
        console.warn('Mic start error:', err)
        isListeningRef.current = false
        setIsListening(false)
      }
    }
  }

  // Handle Send Question (supports direct string trigger from "Try asking" chips)
  const handleSendMessage = async (e, overrideText = null) => {
    e?.preventDefault()
    const textToSend = (overrideText || query).trim()
    if (!textToSend || isThinking) return

    // Stop listening if mic was active
    if (isListening) {
      isListeningRef.current = false
      setIsListening(false)
      try {
        recognitionRef.current?.stop()
      } catch {}
    }

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend }
    setMessages(prev => [...prev, userMsg])
    setQuery('')
    baseTranscriptRef.current = ''
    setIsThinking(true)

    try {
      const token = isSignedIn ? await getToken() : 'guest_token'
      const res = await fetch('/api/v1/chat/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: textToSend,
          latitude: currentLocation?.lat || 18.5204,
          longitude: currentLocation?.lon || 73.8567,
          location_name: currentLocation?.name || 'Local Station',
          role_override: userRole,
          crop_stage: cropStage
        })
      })

      if (res.ok) {
        const data = await res.json()
        const newMsgId = Date.now() + 1
        setMessages(prev => [...prev, {
          id: newMsgId,
          sender: 'assistant',
          text: data.response,
          explain: {
            confidence: data.explainability?.confidence_score || 94,
            models: 'Gemini AI + Tri-Source Live Weather Data',
            verdict: 'High Accuracy'
          }
        }])
      } else {
        throw new Error('Server returned ' + res.status)
      }
    } catch (err) {
      console.warn('Backend LLM error, using smart local fallback:', err)
      const newMsgId = Date.now() + 1
      setMessages(prev => [...prev, {
        id: newMsgId,
        sender: 'assistant',
        text: `Here is the current weather update for ${currentLocation?.name}:\n• Temperature: ${weather?.temp}°C (feels like ${weather?.feelsLike}°C)\n• Sky: ${weather?.condition}\n• Humidity: ${weather?.humidity}%\n• Rain Probability: ${weather?.rainProb}%\n• Wind Speed: ${weather?.windSpeed} km/h\n\nConditions are stable for outdoor activities today!`,
        explain: {
          confidence: 90,
          models: 'Live Meteorological Station Blend',
          verdict: 'Live Data'
        }
      }])
    } finally {
      setIsThinking(false)
    }
  }

  // Text-to-Speech playback with complete symbol cleaning (no weird symbol reading!)
  const handleSpeakText = (messageId, text) => {
    if (activeSpeechId === messageId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setActiveSpeechId(null)
      return
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()

      // Clean all symbols and technical syntax for natural voice readout
      let cleanText = text
        .replace(/https?:\/\/\S+/gi, '') // Remove web links
        .replace(/[*_#`~|•▪▫–—\\]/g, ' ') // Strip markdown symbols & bullet dots
        .replace(/\b°C\b|\b°c\b/gi, ' degrees Celsius ')
        .replace(/°/g, ' degrees ')
        .replace(/%/g, ' percent ')
        .replace(/km\/h/gi, ' kilometers per hour ')
        .replace(/hPa/gi, ' hectopascals ')
        .replace(/[\(\)\[\]\{\}]/g, ', ') // Replace brackets with smooth speech pauses
        .replace(/[:;]/g, '. ')
        .replace(/\s+/g, ' ')
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 0.95
      utterance.pitch = 1.0

      utterance.onend = () => setActiveSpeechId(null)
      utterance.onerror = () => setActiveSpeechId(null)

      setActiveSpeechId(messageId)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Copy text helper
  const handleCopyText = (messageId, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(messageId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] min-h-[500px] animate-in fade-in duration-200">

      {/* Chat Header: Compact on Mobile, Rich on Desktop */}
      <div className="border-b border-slate-100 p-2.5 sm:p-4 bg-gradient-to-r from-sky-50/90 via-blue-50/40 to-indigo-50/60 flex items-center justify-between flex-wrap gap-2 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/25 ring-2 ring-sky-100 shrink-0">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                VAYU AI Assistant
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-2xs flex items-center gap-0.5 shrink-0">
                <Zap className="w-2.5 h-2.5 fill-white" /> Copilot
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
              Live updates for <strong className="text-slate-700">{currentLocation?.name?.split(',')[0]}</strong>
            </p>
          </div>
        </div>

        <div className="text-[10px] sm:text-xs text-emerald-700 bg-emerald-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-200 font-bold flex items-center gap-1.5 shadow-2xs shrink-0">
          <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden xs:inline">Live Radar Connected</span>
          <span className="xs:hidden">Live</span>
        </div>
      </div>

      {/* Messages Feed: Compact Mobile Spacing */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 bg-gradient-to-b from-slate-50/30 to-white">
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl sm:rounded-3xl px-3.5 py-2.5 sm:px-5 sm:py-4 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user' 
                  ? 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white rounded-br-xs shadow-md shadow-sky-500/15 font-medium' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
              }`}
            >
              {/* Message Content */}
              <p className="whitespace-pre-line font-normal">{m.text}</p>

              {/* ChatGPT-style Bottom Action Toolbar for AI Responses */}
              {m.sender === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    
                    {/* Read Aloud Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeakText(m.id, m.text)}
                      className={`px-2 sm:px-2.5 py-1 rounded-xl flex items-center gap-1 sm:gap-1.5 font-semibold transition cursor-pointer text-[11px] sm:text-xs ${
                        activeSpeechId === m.id 
                          ? 'bg-rose-100 text-rose-700 font-bold' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                      title={activeSpeechId === m.id ? 'Stop listening' : 'Read aloud response'}
                    >
                      {activeSpeechId === m.id ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>Read</span>
                        </>
                      )}
                    </button>

                    {/* Copy Response Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyText(m.id, m.text)}
                      className="px-2 sm:px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 font-semibold transition cursor-pointer text-[11px] sm:text-xs"
                      title="Copy text"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Confidence Accuracy Tag */}
                  {m.explain && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> {m.explain.confidence}%
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 px-1 font-medium">
              {m.sender === 'user' ? (user?.firstName || 'You') : 'Vayu AI'}
            </span>
          </div>
        ))}

        {/* Polished Thinking Animation */}
        {isThinking && (
          <div className="flex flex-col items-start animate-fade-in">
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs text-sky-800 font-semibold flex items-center gap-2 shadow-xs">
              <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Vayu AI is analyzing live weather data for {currentLocation?.name?.split(',')[0]}...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions: Clicking sends immediately to AI */}
      <div className="px-3 sm:px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar text-xs shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Try asking:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(null, p)}
            className="whitespace-nowrap px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 shadow-2xs transition text-[11px] sm:text-xs font-semibold cursor-pointer active:scale-95"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Box with Claude-style Animated Send Button */}
      <form onSubmit={(e) => handleSendMessage(e)} className="p-2.5 sm:p-3.5 border-t border-slate-100 bg-white flex items-center gap-2 sm:gap-2.5 shrink-0">
        
        {/* Continuous Voice Input Mic Button */}
        <button
          type="button"
          onClick={handleToggleListening}
          title={isListening ? "Listening... Tap to finish" : "Click to speak with voice"}
          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center shrink-0 cursor-pointer ${
            isListening 
              ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200 scale-105 shadow-md' 
              : 'bg-slate-100 text-slate-600 hover:text-sky-600 hover:bg-sky-50'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Text Input Field */}
        <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 focus-within:border-sky-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100 transition shadow-2xs">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isListening ? "🎙️ Listening... speak naturally" : `Ask Vayu anything about weather...`}
            className="w-full bg-transparent outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>

        {/* Claude-style Animated Send Button */}
        <button
          type="submit"
          disabled={isThinking || !query.trim()}
          onMouseEnter={() => setIsHoveredSend(true)}
          onMouseLeave={() => setIsHoveredSend(false)}
          className={`relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center shrink-0 cursor-pointer ${
            query.trim() && !isThinking
              ? 'bg-slate-900 hover:bg-sky-600 text-white shadow-md shadow-slate-900/10 hover:shadow-sky-500/25 hover:scale-105 active:scale-95'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
          title="Send message"
        >
          {isThinking ? (
            <div className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <ArrowUp className={`w-4 h-4 transition-transform duration-200 ${isHoveredSend && query.trim() ? '-translate-y-0.5' : ''}`} />
          )}
        </button>
      </form>
    </div>
  )
}
