"use client"

import { useState, useRef } from "react"
import { Mic, MicOff, Video, VideoOff } from "lucide-react"
import { useAgoraVoiceClient } from "@/hooks/useAgoraVoiceClient"
import { useAudioVisualization } from "@/hooks/useAudioVisualization"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { MicButton } from "@agora/ui-kit"
import { Conversation, ConversationContent } from "@agora/ui-kit"
import { Message, MessageContent } from "@agora/ui-kit"
import { Response } from "@agora/ui-kit"
import { AvatarVideoDisplay, LocalVideoPreview } from "@agora/ui-kit"
import { VideoGrid, MobileTabs } from "@agora/ui-kit"
import { cn } from "@/lib/utils"

const DEFAULT_BACKEND_URL = "http://localhost:8082"

export function VideoAvatarClient() {
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL)
  const [agentUID, setAgentUID] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [enableLocalVideo, setEnableLocalVideo] = useState(true)
  const [enableAvatar, setEnableAvatar] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState("video")
  const _conversationRef = useRef<HTMLDivElement>(null)
  const _isMobile = useIsMobile()

  const {
    isConnected,
    isMuted,
    micState,
    messageList,
    currentInProgressMessage,
    isAgentSpeaking: _isAgentSpeaking,
    localAudioTrack,
    joinChannel,
    leaveChannel,
    toggleMute,
    sendMessage,
  } = useAgoraVoiceClient()

  // Get audio visualization data (restart on mute/unmute to fix Web Audio API connection)
  const frequencyData = useAudioVisualization(localAudioTrack, isConnected && !isMuted)

  const handleStart = async () => {
    setIsLoading(true)
    try {
      // Build query params for backend
      const params = new URLSearchParams()

      if (enableAvatar) {
        params.append("avatar_enabled", "true")
        params.append("avatar_vendor", "anam")
      }

      const url = params.toString()
        ? `${backendUrl}/start-agent?${params.toString()}`
        : `${backendUrl}/start-agent`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.agent?.uid) {
        setAgentUID(data.agent.uid)
      }

      await joinChannel({
        appId: data.appid,
        channel: data.channel,
        token: data.token || null,
        uid: parseInt(data.uid),
      })

      // TODO: Enable local video if requested
      // if (enableLocalVideo) {
      //   await enableVideo()
      // }
    } catch (error) {
      console.error("Failed to start:", error)
      alert(`Failed to start: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async () => {
    // TODO: Disable video if enabled
    await leaveChannel()
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !isConnected) return

    const success = await sendMessage(chatMessage, agentUID || "100")
    if (success) {
      setChatMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVideo = async () => {
    // TODO: Implement video toggle using useLocalVideo hook
    setIsVideoEnabled(!isVideoEnabled)
  }

  // Helper to determine if message is from agent
  // Agent messages have uid: 0 (stream_id: 0)
  const isAgentMessage = (uid: number) => {
    return uid === 0
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-background to-muted overflow-hidden">
      {/* Header - Responsive */}
      <header className="border-b bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <h1 className="text-lg md:text-2xl font-bold">Video Avatar AI Client</h1>
          <p className="text-xs md:text-sm text-muted-foreground hidden md:block">
            React with Agora AI UIKit - Video + Avatar
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto flex flex-1 px-4 py-6 min-h-0 overflow-hidden">
        {!isConnected ? (
          /* Connection Form - Centered */
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold">Connect to Agent</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="backend" className="mb-2 block text-sm font-medium">
                    Backend URL
                  </label>
                  <input
                    id="backend"
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder={DEFAULT_BACKEND_URL}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableLocalVideo}
                      onChange={(e) => setEnableLocalVideo(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Enable Local Video</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableAvatar}
                      onChange={(e) => setEnableAvatar(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Enable Avatar</span>
                  </label>
                </div>

                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isLoading ? "Connecting..." : "Start Conversation"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Responsive Layout: Desktop (VideoGrid) / Mobile (Tabs) */
          <>
            {/* Desktop Layout */}
            <VideoGrid
              className="hidden md:grid flex-1"
              chat={
                <div className="flex flex-col h-full">
                  {/* Conversation Header */}
                  <div className="border-b p-4 flex-shrink-0">
                    <h2 className="font-semibold">Conversation</h2>
                    <p className="text-sm text-muted-foreground">
                      {messageList.length} message{messageList.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Messages */}
                  <Conversation height="" className="flex-1 min-h-0" style={{ overflow: "scroll" }}>
                    <ConversationContent>
                      {messageList.map((msg, idx) => {
                        const isAgent = isAgentMessage(msg.uid)
                        return (
                          <Message
                            key={`${msg.turn_id}-${msg.uid}-${idx}`}
                            from={isAgent ? "assistant" : "user"}
                            name={isAgent ? "Agent" : "User"}
                          >
                            <MessageContent>
                              <Response>{msg.text}</Response>
                            </MessageContent>
                          </Message>
                        )
                      })}

                      {/* In-progress message */}
                      {currentInProgressMessage &&
                        (() => {
                          const isAgent = isAgentMessage(currentInProgressMessage.uid)
                          return (
                            <Message
                              from={isAgent ? "assistant" : "user"}
                              name={isAgent ? "Agent" : "User"}
                            >
                              <MessageContent className="animate-pulse">
                                <Response>{currentInProgressMessage.text}</Response>
                              </MessageContent>
                            </Message>
                          )
                        })()}
                    </ConversationContent>
                  </Conversation>

                  {/* Input Box */}
                  <div className="border-t p-4 flex-shrink-0">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={!isConnected}
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!isConnected || !chatMessage.trim()}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              }
              avatar={
                <div className="flex flex-col h-full">
                  {/* Avatar Video */}
                  <div className="flex-1 flex items-center justify-center bg-muted/20">
                    <AvatarVideoDisplay
                      videoTrack={null}
                      state="disconnected"
                      className="h-full w-full"
                    />
                  </div>

                  {/* Controls below avatar */}
                  <div className="border-t p-4 flex-shrink-0">
                    <div className="flex gap-3">
                      <MicButton
                        state={micState}
                        icon={
                          isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />
                        }
                        audioData={frequencyData}
                        onClick={toggleMute}
                        className="flex-1"
                      />
                      <button
                        onClick={toggleVideo}
                        className={cn(
                          "flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                          isVideoEnabled
                            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {isVideoEnabled ? (
                          <Video className="h-4 w-4 inline mr-2" />
                        ) : (
                          <VideoOff className="h-4 w-4 inline mr-2" />
                        )}
                        Camera
                      </button>
                      <button
                        onClick={handleStop}
                        className="flex-1 rounded-lg border border-destructive bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
                      >
                        End Call
                      </button>
                    </div>
                  </div>
                </div>
              }
              localVideo={
                <div className="h-full flex items-center justify-center">
                  <LocalVideoPreview videoTrack={null} className="h-full w-full" />
                </div>
              }
            />

            {/* Mobile Layout */}
            <div className="flex md:hidden flex-1 flex-col min-h-0 overflow-hidden">
              <MobileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabs={[
                  {
                    id: "video",
                    label: "Video",
                    content: (
                      <div className="flex flex-col h-full gap-3 p-3">
                        {/* Avatar - 70% */}
                        <div className="flex-[7] rounded-lg border bg-card shadow-lg overflow-hidden">
                          <AvatarVideoDisplay
                            videoTrack={null}
                            state="disconnected"
                            className="h-full w-full"
                          />
                        </div>

                        {/* Local Video - 30% */}
                        <div className="flex-[3] rounded-lg border bg-card shadow-lg overflow-hidden">
                          <LocalVideoPreview videoTrack={null} className="h-full w-full" />
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: "chat",
                    label: "Chat",
                    content: (
                      <div className="flex flex-col h-full gap-3 p-3">
                        {/* Avatar - 40% */}
                        <div className="flex-[4] rounded-lg border bg-card shadow-lg overflow-hidden">
                          <AvatarVideoDisplay
                            videoTrack={null}
                            state="disconnected"
                            className="h-full w-full"
                          />
                        </div>

                        {/* Chat - 60% */}
                        <div className="flex-[6] rounded-lg border bg-card shadow-lg overflow-hidden flex flex-col">
                          {/* Conversation Header */}
                          <div className="border-b p-3 flex-shrink-0">
                            <h2 className="font-semibold text-sm">Conversation</h2>
                            <p className="text-xs text-muted-foreground">
                              {messageList.length} message{messageList.length !== 1 ? "s" : ""}
                            </p>
                          </div>

                          {/* Messages */}
                          <Conversation
                            height=""
                            className="flex-1 min-h-0"
                            style={{ overflow: "scroll" }}
                          >
                            <ConversationContent>
                              {messageList.map((msg, idx) => {
                                const isAgent = isAgentMessage(msg.uid)
                                return (
                                  <Message
                                    key={`${msg.turn_id}-${msg.uid}-${idx}`}
                                    from={isAgent ? "assistant" : "user"}
                                    name={isAgent ? "Agent" : "User"}
                                  >
                                    <MessageContent>
                                      <Response>{msg.text}</Response>
                                    </MessageContent>
                                  </Message>
                                )
                              })}

                              {/* In-progress message */}
                              {currentInProgressMessage &&
                                (() => {
                                  const isAgent = isAgentMessage(currentInProgressMessage.uid)
                                  return (
                                    <Message
                                      from={isAgent ? "assistant" : "user"}
                                      name={isAgent ? "Agent" : "User"}
                                    >
                                      <MessageContent className="animate-pulse">
                                        <Response>{currentInProgressMessage.text}</Response>
                                      </MessageContent>
                                    </Message>
                                  )
                                })()}
                            </ConversationContent>
                          </Conversation>

                          {/* Input Box */}
                          <div className="border-t p-2 flex-shrink-0">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type a message..."
                                disabled={!isConnected}
                                className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                              />
                              <button
                                onClick={handleSendMessage}
                                disabled={!isConnected || !chatMessage.trim()}
                                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />

              {/* Mobile: Fixed Bottom Controls */}
              <div className="flex gap-3 p-4 border-t bg-card flex-shrink-0">
                <MicButton
                  state={micState}
                  icon={isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  audioData={frequencyData}
                  onClick={toggleMute}
                  className="flex-1 min-h-[48px]"
                />
                <button
                  onClick={toggleVideo}
                  className={cn(
                    "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors min-h-[48px]",
                    isVideoEnabled
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background"
                  )}
                >
                  {isVideoEnabled ? (
                    <Video className="h-4 w-4 inline mr-2" />
                  ) : (
                    <VideoOff className="h-4 w-4 inline mr-2" />
                  )}
                  Camera
                </button>
                <button
                  onClick={handleStop}
                  className="flex-1 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/20 min-h-[48px]"
                >
                  End Call
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
