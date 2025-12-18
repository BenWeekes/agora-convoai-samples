// React hook for Conversational AI SDK

"use client"

import { useState, useEffect, useCallback } from "react"
import { ConversationalAIAPI, RTCHelper } from "../conversational-ai-api"
import type {
  TranscriptItem,
  ConnectionState,
  ConversationalAIAPIEvents,
} from "../conversational-ai-api/type"
import { ConnectionState as CS } from "../conversational-ai-api/type"

export interface UseConversationalAIOptions {
  appId: string
  channel: string
  token: string | null
  uid: number
  autoConnect?: boolean
  renderMode?: 'auto' | 'word' | 'text' | 'chunk'
}

export interface UseConversationalAIReturn {
  transcript: TranscriptItem[]
  connectionState: ConnectionState
  isConnected: boolean
  isConnecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  error: Error | null
  api: ConversationalAIAPI | null
}

export function useConversationalAI(
  options: UseConversationalAIOptions
): UseConversationalAIReturn {
  const [api, setApi] = useState<ConversationalAIAPI | null>(null)
  const [transcript, setTranscript] = useState<TranscriptItem[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>(CS.DISCONNECTED)
  const [error, setError] = useState<Error | null>(null)

  const connect = useCallback(async () => {
    try {
      const rtcHelper = RTCHelper.getInstance()

      await rtcHelper.init({
        appId: options.appId,
        channel: options.channel,
        token: options.token,
        uid: options.uid,
      })

      await rtcHelper.createAudioTrack()
      await rtcHelper.join()
      await rtcHelper.publish()

      const conversationalAPI = ConversationalAIAPI.init({
        rtcEngine: rtcHelper.client!,
        renderMode: options.renderMode as any,
        enableLog: true,
      })

      setApi(conversationalAPI)
    } catch (err) {
      setError(err as Error)
      console.error("Failed to connect:", err)
    }
  }, [options])

  const disconnect = useCallback(async () => {
    if (api) {
      const rtcHelper = api.getRTCHelper()
      await rtcHelper.leave()
      api.destroy()
      setApi(null)
      setTranscript([])
    }
  }, [api])

  useEffect(() => {
    if (!api) return

    const handleTranscriptUpdate = (messages: TranscriptItem[]) => {
      setTranscript(messages)
    }

    const handleConnectionStateChange = (state: ConnectionState) => {
      setConnectionState(state)
    }

    const handleError = (err: Error) => {
      setError(err)
    }

    api.on('transcript-updated' as any, handleTranscriptUpdate)
    api.on('connection-state-changed' as any, handleConnectionStateChange)
    api.on('agent-error' as any, handleError)

    return () => {
      api.off('transcript-updated' as any, handleTranscriptUpdate)
      api.off('connection-state-changed' as any, handleConnectionStateChange)
      api.off('agent-error' as any, handleError)
    }
  }, [api])

  useEffect(() => {
    if (options.autoConnect) {
      connect()
    }

    return () => {
      if (api) {
        disconnect()
      }
    }
  }, [])

  return {
    transcript,
    connectionState,
    isConnected: connectionState === CS.CONNECTED,
    isConnecting: connectionState === CS.CONNECTING,
    connect,
    disconnect,
    error,
    api,
  }
}
