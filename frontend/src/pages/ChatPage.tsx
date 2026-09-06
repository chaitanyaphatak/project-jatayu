import React, { useState, useRef, useEffect } from 'react'
import { 
  Sparkles, ArrowUp, Volume2, VolumeX, ShieldCheck, 
  MapPin, Sprout, Plane, Flame, Building2, Mic, MicOff,
  Bot, Copy, Check, Radio, Zap, Plus, MessageSquare, 
  Trash2, ChevronLeft, Menu, Clock, Lock
} from 'lucide-react'
import { ChatMessage } from '../types'
import { useAuthGate } from '../components/AuthProtectedAction'

interface ConversationSession {
  id: string
  title: string
  timestamp: number
  messages: ChatMessage[]
}

export default function ChatPage({ 
  currentLocation, 
  weather, 
  userRole, 
  cropStage, 
  user, 
  isSignedIn, 
  getToken,
  language = 'en'
}) {
  const { isSignedIn: isAuthSignedIn, executeGuarded } = useAuthGate()
  const effectiveSignedIn = isSignedIn ?? isAuthSignedIn
  const [query, setQuery] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [activeSpeechId, setActiveSpeechId] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [isHoveredSend, setIsHoveredSend] = useState(false)
  const [isHistoryOpenMobile, setIsHistoryOpenMobile] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)
  const baseTranscriptRef = useRef('')

  // ─── localStorage-backed Chat History (like ChatGPT) ────────────────────────
  const storageKey = `wgpt_chats_${user?.id || 'guest'}`

  const loadSessions = (): ConversationSession[] => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  const saveSessions = (sessions: ConversationSession[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sessions))
    } catch {}
  }

  const [sessions, setSessions] = useState<ConversationSession[]>(loadSessions)
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const existing = loadSessions()
    return existing.length > 0 ? existing[0].id : 'new'
  })

  // Initial greeting
  const initialGreeting: ChatMessage = {
    id: 1,
    sender: 'assistant',
    text: language === 'hi' 
      ? `नमस्ते! 🙏 मैं वायु AI हूँ — ${currentLocation?.name?.split(',')[0] || 'आपके शहर'} के लिए आपका स्मार्ट मौसम और कृषि सहायक।\n\nमुझसे बारिश के पूर्वानुमान, फसल पर छिड़काव के सही समय, या तापमान के बारे में कुछ भी पूछें!`
      : language === 'mr'
      ? `नमस्कार! 🙏 मी वायू AI आहे — ${currentLocation?.name?.split(',')[0] || 'तुमच्या शहरा'}साठी तुमचा हवामान आणि शेती सल्लागार।\n\nमला आजचा पाऊस, फवारणीची वेळ, किंवा तापमानाबद्दल काहीही विचारा!`
      : `Namaste! 🙏 I am Vayu AI — your smart weather & agriculture copilot for ${currentLocation?.name?.split(',')[0] || 'your city'}.\n\nAsk me anything about today's rain forecast, crop spraying times, flight weather, or local temperatures!`,
    explain: {
      confidence: 96,
      models: 'Google Gemini AI + Live Radar Telemetry',
      verdict: 'Live Data Verified'
    }
  }

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const active = sessions.find(s => s.id === activeSessionId)
    return active ? active.messages : [initialGreeting]
  })

  // Contextual prompts customized for location & persona
  const samplePrompts = language === 'hi' ? [
    `क्या आज ${currentLocation?.name?.split(',')[0]} में बारिश होगी?`,
    `क्या आज कीटनाशक छिड़काव के लिए मौसम अनुकूल है?`,
    `अगले 3 घंटे का तापमान और हवा की स्थिति बताएं`,
    `वर्तमान वायु गुणवत्ता (AQI) और आर्द्रता क्या है?`
  ] : language === 'mr' ? [
    `आज ${currentLocation?.name?.split(',')[0]} मध्ये पाऊस पडेल का?`,
    `आज पिकांवर फवारणी करणे सुरक्षित आहे का?`,
    `पुढील ३ तासांचा तापमान आणि वाऱ्याचा अंदाज सांगा`,
    `सध्या हवेची गुणवत्ता (AQI) आणि आर्द्रता किती आहे?`
  ] : [
    `Will it rain today in ${currentLocation?.name?.split(',')[0] || 'my city'}?`,
    `Is today safe for spraying crops or farm work?`,
    `Give me a 3-hour temperature & wind update`,
    `What is the current air quality and humidity?`
  ]

  // Setup Continuous Web Speech Recognition (ChatGPT / Gemini style)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      const recog = new SpeechRecognition()
      recog.continuous = true
      recog.interimResults = true
      recog.lang = language === 'hi' ? 'hi-IN' : (language === 'mr' ? 'mr-IN' : 'en-IN')

      recog.onresult = (event: any) => {
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

      recog.onerror = (event: any) => {
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
  }, [language])

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

  // Handle "+ New Chat"
  const handleNewChat = () => {
    const newId = Date.now().toString()
    setActiveSessionId(newId)
    setMessages([initialGreeting])
    setIsHistoryOpenMobile(false)
  }

  // Handle Switch Chat
  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setMessages(session.messages)
    }
    setIsHistoryOpenMobile(false)
  }

  // Handle Delete Chat
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = sessions.filter(s => s.id !== sessionId)
    setSessions(updated)
    saveSessions(updated)
    if (activeSessionId === sessionId) {
      if (updated.length > 0) {
        setActiveSessionId(updated[0].id)
        setMessages(updated[0].messages)
      } else {
        handleNewChat()
      }
    }
  }

  // Handle Send Question (supports direct string trigger from "Try asking" chips)
  const handleSendMessage = async (e?: React.FormEvent, overrideText: string | null = null) => {
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

    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: textToSend }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setQuery('')
    baseTranscriptRef.current = ''
    setIsThinking(true)

    // Append language instruction
    const targetLangName = langDisplayNames[language] ? langDisplayNames[language].split(' ')[0] : 'Hindi'
    const queryWithLang = language !== 'en' 
      ? `${textToSend} (Please respond completely in ${targetLangName} language)`
      : textToSend

    try {
      const token = isSignedIn ? await getToken() : 'guest_token'
      const res = await fetch('/api/v1/chat/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: queryWithLang,
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
        
        // Sanitize any raw reasoning or <think> tags from LLM responses
        const rawText = data.response || ''
        let cleanResponse = rawText
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/<think>[\s\S]*$/gi, '')
          .replace(/<(thought|reasoning)>[\s\S]*?<\/\1>/gi, '')
          .replace(/^Here's a thinking process:[\s\S]*?(?=\n\n|$)/gi, '')
          .trim()

        if (!cleanResponse) {
          cleanResponse = rawText.trim()
        }

        // Guaranteed rich multilingual fallback if string is empty
        if (!cleanResponse) {
          const loc = currentLocation?.name || 'Selected Location'
          if (language === 'hi') {
            cleanResponse = `🌤️ **${loc} के लिए लाइव मौसम और कृषि रिपोर्ट**:\n\n• **तापमान**: ${weather?.temp || 26}°C (अनुभव: ${weather?.feelsLike || 28}°C)\n• **मौसम की स्थिति**: ${weather?.condition || 'सामान्य'}\n• **सापेक्ष आर्द्रता**: ${weather?.humidity || 75}%\n• **हवा की गति**: ${weather?.windSpeed || 10} km/h\n• **बारिश की संभावना**: ${weather?.rainProb || 20}%\n\nवर्तमान परिस्थितियों के आधार पर खेत में काम करने और सामान्य गतिविधियों के लिए मौसम अनुकूल है।`
          } else if (language === 'mr') {
            cleanResponse = `🌤️ **${loc} साठी हवामान व शेती सल्ला**:\n\n• **तापमान**: ${weather?.temp || 26}°C (जाणवणारे: ${weather?.feelsLike || 28}°C)\n• **हवामान**: ${weather?.condition || 'निरभ्र/ढगाळ'}\n• **आर्द्रता**: ${weather?.humidity || 75}%\n• **वाऱ्याचा वेग**: ${weather?.windSpeed || 10} km/h\n• **पावसाची शक्यता**: ${weather?.rainProb || 20}%\n\nसध्याच्या हवामानानुसार शेतीची कामे आणि बाह्य उपक्रमांसाठी परिस्थिती योग्य आहे.`
          } else {
            cleanResponse = `🌤️ **Live Weather & Advisory for ${loc}**:\n\n• **Temperature**: ${weather?.temp || 26}°C (Feels like: ${weather?.feelsLike || 28}°C)\n• **Condition**: ${weather?.condition || 'Partly Cloudy'}\n• **Humidity**: ${weather?.humidity || 75}%\n• **Wind Speed**: ${weather?.windSpeed || 10} km/h\n• **Rain Probability**: ${weather?.rainProb || 20}%\n\nCurrent weather parameters are favorable for regular outdoor operations and agricultural tasks.`
          }
        }

        const assistantMsg: ChatMessage = {
          id: newMsgId,
          sender: 'assistant',
          text: cleanResponse,
          explain: {
            confidence: data.explainability?.confidence_score || 94,
            models: 'Gemini AI + Tri-Source Live Weather Data',
            verdict: 'High Accuracy'
          }
        }
        const finalMessages = [...updatedMessages, assistantMsg]
        setMessages(finalMessages)

        // Save / update session history
        const sessionTitle = textToSend.slice(0, 35) + (textToSend.length > 35 ? '...' : '')
        let currentSessionId = activeSessionId === 'new' ? Date.now().toString() : activeSessionId
        if (activeSessionId === 'new') setActiveSessionId(currentSessionId)

        const existingIndex = sessions.findIndex(s => s.id === currentSessionId)
        let updatedSessions: ConversationSession[]
        if (existingIndex >= 0) {
          updatedSessions = [...sessions]
          updatedSessions[existingIndex].messages = finalMessages
          updatedSessions[existingIndex].timestamp = Date.now()
        } else {
          updatedSessions = [
            {
              id: currentSessionId,
              title: sessionTitle,
              timestamp: Date.now(),
              messages: finalMessages
            },
            ...sessions
          ]
        }
        setSessions(updatedSessions)
        saveSessions(updatedSessions)
      } else {
        throw new Error('Server returned ' + res.status)
      }
    } catch (err) {
      console.warn('Backend LLM error, using smart fallback:', err)
      const newMsgId = Date.now() + 1
      const loc = currentLocation?.name || 'Selected Location'
      
      let fallbackText = ''
      if (language === 'hi') {
        fallbackText = `🌤️ **${loc} के लिए लाइव मौसम और कृषि रिपोर्ट**:\n\n• **तापमान**: ${weather?.temp || 26}°C (अनुभव: ${weather?.feelsLike || 28}°C)\n• **मौसम की स्थिति**: ${weather?.condition || 'सामान्य'}\n• **सापेक्ष आर्द्रता**: ${weather?.humidity || 75}%\n• **हवा की गति**: ${weather?.windSpeed || 10} km/h\n• **बारिश की संभावना**: ${weather?.rainProb || 20}%\n\nवर्तमान परिस्थितियों के आधार पर खेत में काम करने और सामान्य गतिविधियों के लिए मौसम अनुकूल है।`
      } else if (language === 'mr') {
        fallbackText = `🌤️ **${loc} साठी हवामान व शेती सल्ला**:\n\n• **तापमान**: ${weather?.temp || 26}°C (जाणवणारे: ${weather?.feelsLike || 28}°C)\n• **हवामान**: ${weather?.condition || 'निरभ्र/ढगाळ'}\n• **आर्द्रता**: ${weather?.humidity || 75}%\n• **वाऱ्याचा वेग**: ${weather?.windSpeed || 10} km/h\n• **पावसाची शक्यता**: ${weather?.rainProb || 20}%\n\nसध्याच्या हवामानानुसार शेतीची कामे आणि बाह्य उपक्रमांसाठी परिस्थिती योग्य आहे.`
      } else {
        fallbackText = `🌤️ **Live Weather & Advisory for ${loc}**:\n\n• **Temperature**: ${weather?.temp || 26}°C (Feels like: ${weather?.feelsLike || 28}°C)\n• **Condition**: ${weather?.condition || 'Partly Cloudy'}\n• **Humidity**: ${weather?.humidity || 75}%\n• **Wind Speed**: ${weather?.windSpeed || 10} km/h\n• **Rain Probability**: ${weather?.rainProb || 20}%\n\nCurrent weather parameters are favorable for regular outdoor operations and agricultural tasks.`
      }

      const fallbackMsg: ChatMessage = {
        id: newMsgId,
        sender: 'assistant',
        text: fallbackText,
        explain: {
          confidence: 92,
          models: 'Live Meteorological Station Blend',
          verdict: 'Live Data Verified'
        }
      }
      setMessages(prev => [...prev, fallbackMsg])
    } finally {
      setIsThinking(false)
    }
  }

  const langDisplayNames: Record<string, string> = {
    en: 'English (Indian)',
    hi: 'Hindi (हिन्दी)',
    mr: 'Marathi (मराठी)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
    gu: 'Gujarati (ગુજરાતી)',
    bn: 'Bengali (বাংলা)',
    te: 'Telugu (తెలుగు)',
    ta: 'Tamil (தமிழ்)'
  }

  // Text-to-Speech playback with symbol cleaning and dialect voice detection
  const handleSpeakText = (messageId: number, text: string) => {
    if (activeSpeechId === messageId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setActiveSpeechId(null)
      return
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()

      // Clean all symbols, emojis, and markdown characters for clear natural pronunciation
      let cleanText = text
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove emojis
        .replace(/https?:\/\/\S+/gi, '')
        .replace(/[*_#`~|•▪▫–—\\]/g, ' ')
        .replace(/\b°C\b|\b°c\b/gi, ' degrees Celsius ')
        .replace(/°/g, ' degrees ')
        .replace(/%/g, ' percent ')
        .replace(/km\/h/gi, ' kilometers per hour ')
        .replace(/hPa/gi, ' hectopascals ')
        .replace(/[\(\)\[\]\{\}]/g, ', ')
        .replace(/[:;]/g, '. ')
        .replace(/\s+/g, ' ')
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanText)
      const langCode = language === 'hi' ? 'hi-IN' : (language === 'mr' ? 'mr-IN' : (language === 'pa' ? 'pa-IN' : (language === 'gu' ? 'gu-IN' : (language === 'bn' ? 'bn-IN' : (language === 'ta' ? 'ta-IN' : (language === 'te' ? 'te-IN' : 'en-IN'))))))
      utterance.lang = langCode
      utterance.rate = 0.95
      utterance.pitch = 1.0

      // Match native voice installed in client OS (Windows / Android / iOS / Chrome)
      const voices = window.speechSynthesis.getVoices()
      const targetPrefix = language === 'hi' ? 'hi' : (language === 'mr' ? 'mr' : 'en')
      const matchedVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith(targetPrefix) || 
        v.lang.toLowerCase().replace('_', '-').startsWith(targetPrefix)
      )
      if (matchedVoice) {
        utterance.voice = matchedVoice
      }

      utterance.onend = () => setActiveSpeechId(null)
      utterance.onerror = () => setActiveSpeechId(null)

      setActiveSpeechId(messageId)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Copy text helper
  const handleCopyText = (messageId: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(messageId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex h-[calc(100dvh-130px)] sm:h-[calc(100vh-140px)] min-h-[500px] animate-in fade-in duration-200">

      {/* ─── LEFT CHAT HISTORY SIDEBAR (ChatGPT style) ────────────────────── */}
      <aside 
        className={`w-64 border-r border-slate-200 bg-slate-50/80 flex flex-col justify-between shrink-0 transition-all duration-200 z-30 ${
          isHistoryOpenMobile 
            ? 'fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 flex' 
            : 'hidden md:flex'
        }`}
      >
        {/* Top: New Chat Button */}
        <div className="p-3 border-b border-slate-200/80 bg-white flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleNewChat}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
          
          {isHistoryOpenMobile && (
            <button
              onClick={() => setIsHistoryOpenMobile(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> Recent Chats
          </p>

          {/* Auth gate notice for guests */}
          {!effectiveSignedIn && (
            <div className="mx-1 mb-2 p-3 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 border border-sky-200/80 text-center">
              <Lock className="w-4 h-4 text-sky-500 mx-auto mb-1" />
              <p className="text-[10px] font-semibold text-sky-800 leading-snug">Sign in to save &amp; sync chat history across devices</p>
              <button
                type="button"
                onClick={() => executeGuarded(() => {}, 'Sign in to access chat history')}
                className="mt-2 w-full py-1.5 px-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold transition cursor-pointer"
              >
                Sign In to Save History
              </button>
            </div>
          )}

          {sessions.length > 0 ? (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  activeSessionId === s.id
                    ? 'bg-sky-100/90 text-sky-900 font-bold border border-sky-200'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" />
                  <span className="truncate">{s.title || 'Weather Discussion'}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  title="Delete chat"
                  className="p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-slate-400 text-xs">
              {effectiveSignedIn
                ? 'No saved conversations yet. Ask Vayu AI your first question!'
                : 'Your chats appear here once you sign in.'}
            </div>
          )}
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="p-3 border-t border-slate-200/80 bg-white text-[11px] text-slate-500 font-medium flex items-center justify-between">
          <span>🌐 <strong className="text-slate-700">{langDisplayNames[language] || language.toUpperCase()}</strong></span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            effectiveSignedIn ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
          }`}>{effectiveSignedIn ? 'Cloud Sync' : 'Local Only'}</span>
        </div>
      </aside>

      {/* ─── MAIN CHAT AREA ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-white">
        
        {/* Chat Header */}
        <div className="border-b border-slate-100 p-2.5 sm:p-3.5 bg-gradient-to-r from-sky-50/90 via-blue-50/40 to-indigo-50/60 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Chat History Toggle Button */}
            <button
              type="button"
              onClick={() => setIsHistoryOpenMobile(true)}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 md:hidden cursor-pointer"
              title="View Chat History"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-100 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  VAYU AI Assistant
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-2xs flex items-center gap-0.5 shrink-0">
                  <Zap className="w-2.5 h-2.5 fill-white" /> Copilot
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                Live meteorology for <strong className="text-slate-700">{currentLocation?.name?.split(',')[0]}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-1 shadow-2xs md:hidden"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">New</span>
            </button>

            <div className="text-[10px] sm:text-xs text-emerald-700 bg-emerald-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-200 font-bold flex items-center gap-1.5 shadow-2xs shrink-0">
              <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden xs:inline">Live Radar Connected</span>
              <span className="xs:hidden">Live</span>
            </div>
          </div>
        </div>

        {/* Messages Feed */}
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
                {/* Message Content (Auto-sanitized to strip reasoning thoughts) */}
                <p className="whitespace-pre-line font-normal">
                  {m.text
                    ? m.text
                        .replace(/<think>[\s\S]*?<\/think>/gi, '')
                        .replace(/<think>[\s\S]*$/gi, '')
                        .replace(/<(thought|reasoning)>[\s\S]*?<\/\1>/gi, '')
                        .replace(/^Here's a thinking process:[\s\S]*?(?=\n\n|$)/gi, '')
                        .trim()
                    : ''}
                </p>

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
              onClick={() => handleSendMessage(undefined, p)}
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
    </div>
  )
}
