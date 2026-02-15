"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Mic, MicOff } from "lucide-react"

interface VoiceInputProps {
  onTranscript: (text: string) => void
  language?: string
}

interface RecognitionAlternative {
  transcript: string
}

interface RecognitionResult {
  isFinal: boolean
  0: RecognitionAlternative
}

interface RecognitionEvent {
  resultIndex: number
  results: ArrayLike<RecognitionResult>
}

interface RecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

type BrowserWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

export function VoiceInput({ onTranscript, language = "en-US" }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const speechWindow = typeof window === "undefined" ? null : (window as BrowserWindow)
  const SpeechRecognitionClass = speechWindow?.SpeechRecognition || speechWindow?.webkitSpeechRecognition
  const isSupported = Boolean(SpeechRecognitionClass)

  useEffect(() => {
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

    recognition.onresult = (event: RecognitionEvent) => {
      let finalTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (result?.isFinal) {
          finalTranscript += result[0]?.transcript || ""
        }
      }
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim())
      }
    }

    recognition.onerror = (event: RecognitionErrorEvent) => {
      console.error("Speech recognition error", event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    return () => {
      try {
        recognition.stop()
      } catch {
        // Ignore errors when stopping if already stopped
      }
      recognitionRef.current = null
    }
  }, [SpeechRecognitionClass, language, onTranscript])

  const toggleRecording = () => {
    const recognition = recognitionRef.current
    if (!recognition) return

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
      return
    }

    try {
      recognition.start()
      setIsRecording(true)
    } catch (e) {
      console.error("Failed to start recognition", e)
    }
  }

  // Render a consistent initial state (disabled) to match server, 
  // then update after useEffect determines support
  if (!isSupported) {
    return (
      <Button variant="ghost" type="button" disabled title="Browser speech API not supported">
        <MicOff className="h-4 w-4 text-muted-foreground" />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={isRecording ? "destructive" : "outline"}
      onClick={toggleRecording}
      className={isRecording ? "animate-pulse" : ""}
    >
      {isRecording ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mic className="mr-2 h-4 w-4" />}
      {isRecording ? "Stop" : "Voice"}
    </Button>
  )
}
