import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { submitTask } from '../utils/api';
import { RoomAudioRenderer, SessionProvider, useSessionContext, useSessionMessages, useSession } from '@livekit/components-react';
import { TokenSource } from 'livekit-client';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Download } from 'lucide-react';

interface ConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
}

// Transcript interface
interface TranscriptEntry {
  id: string;
  timestamp: number;
  speaker: 'user' | 'agent';
  message: string;
  type: 'text' | 'audio';
}

// Simple Interview Session Component
function InterviewSession({ taskId }: { taskId?: string | null }) {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Capture transcript from messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const newEntries: TranscriptEntry[] = messages.map((msg) => ({
        id: msg.id,
        timestamp: msg.timestamp,
        speaker: msg.from?.isLocal ? 'user' : 'agent',
        message: msg.message,
        type: 'text',
      }));

      // Update transcript, avoiding duplicates
      setTranscript((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const uniqueNew = newEntries.filter((entry) => !existingIds.has(entry.id));
        return [...prev, ...uniqueNew].sort((a, b) => a.timestamp - b.timestamp);
      });
    }
  }, [messages]);

  const handleEndCall = async () => {
    // If this is hr_t4 task, auto-submit transcript for evaluation
    if (taskId === 'hr_t4' && transcript.length > 0) {
      setIsSubmitting(true);
      try {
        // Save transcript first
        await saveTranscript();
        // Submit for evaluation
        await submitTranscriptAsTask();
      } catch (error) {
        console.error('Error submitting transcript:', error);
      } finally {
        setIsSubmitting(false);
        // Navigate after submission completes
        session.end();
        navigate('/task-result');
      }
    } else {
      // Save transcript before ending call (non-task interviews)
      await saveTranscript();
      session.end();
      // Navigate to home
      navigate('/');
    }
  };

  const submitTranscriptAsTask = async () => {
    try {
      const transcriptText = transcript
        .map((entry) => {
          const time = new Date(entry.timestamp).toLocaleTimeString();
          const speaker = entry.speaker === 'user' ? 'You' : 'AI Interviewer';
          return `[${time}] ${speaker}: ${entry.message}`;
        })
        .join('\n\n');

      const response = await submitTask({
        text: `Interview Transcript:\n\n${transcriptText}\n\nDuration: ${Math.round((Date.now() - sessionStartTime) / 1000 / 60)} minutes\nTotal Messages: ${transcript.length}`,
      });

      // Store response for showing evaluation results
      localStorage.setItem('taskSubmissionResponse', JSON.stringify(response));
    } catch (error) {
      console.error('Error submitting transcript as task:', error);
    }
  };

  const saveTranscript = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:3000';
      const token = localStorage.getItem('authToken');

      if (!token || transcript.length === 0) {
        console.log('No transcript to save or not authenticated');
        return;
      }

      const transcriptData = {
        sessionId: session.room?.name || `interview_${Date.now()}`,
        startTime: sessionStartTime,
        endTime: Date.now(),
        duration: Date.now() - sessionStartTime,
        transcript: transcript,
        agentName: 'Drew_2a0',
        roomName: session.room?.name,
      };

      const response = await fetch(`${backendUrl}/api/interviews/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(transcriptData),
      });

      if (response.ok) {
        console.log('Transcript saved successfully');
      } else {
        console.error('Failed to save transcript:', await response.text());
      }
    } catch (error) {
      console.error('Error saving transcript:', error);
    }
  };

  const exportTranscript = () => {
    const transcriptText = transcript
      .map((entry) => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        const speaker = entry.speaker === 'user' ? 'You' : 'AI Interviewer';
        return `[${time}] ${speaker}: ${entry.message}`;
      })
      .join('\n\n');

    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartAudio = () => {
    if (!audioStarted && session.room) {
      // User interaction required for audio - this handles the autoplay policy
      session.room.startAudio().then(() => {
        setAudioStarted(true);
      }).catch((err) => {
        console.error('Failed to start audio:', err);
      });
    }
  };

  // Show loading overlay when submitting
  if (isSubmitting) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-transparent border-t-green-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Submitting Transcript</h3>
          <p className="text-gray-400 text-sm mb-4">Evaluating your interview performance...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Transcript Indicator */}
      {transcript.length > 0 && (
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          Recording: {transcript.length} messages
        </div>
      )}

      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
          {/* AI Agent Video */}
          <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center border-2 border-blue-500">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl text-white">AI</span>
              </div>
              <p className="text-white text-lg">Alex</p>
              <p className="text-gray-400 text-sm mt-2">Connected</p>
            </div>
          </div>

          {/* User Video */}
          <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center border-2 border-gray-700">
            {videoEnabled ? (
              <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
                <p className="text-gray-400">Your Camera</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl text-gray-400">You</span>
                </div>
                <p className="text-white text-lg">You</p>
                <p className="text-gray-400 text-sm mt-2">Camera Off</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="absolute bottom-24 left-0 right-0 bg-gray-800 border-t border-gray-700 max-h-64 overflow-y-auto p-4"
        >
          <div className="space-y-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded ${
                  msg.from?.isLocal
                    ? 'bg-blue-600 text-white ml-auto max-w-md'
                    : 'bg-gray-700 text-white mr-auto max-w-md'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
          {!audioStarted && (
            <button
              onClick={handleStartAudio}
              className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
              title="Start Audio"
            >
              <Mic size={20} />
            </button>
          )}
          <button
            onClick={() => setMicEnabled(!micEnabled)}
            className={`p-3 rounded-full transition-colors ${
              micEnabled ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`p-3 rounded-full transition-colors ${
              videoEnabled ? 'bg-gray-700 text-white' : 'bg-gray-600 text-white'
            }`}
          >
            {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-3 rounded-full transition-colors ${
              chatOpen ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
            }`}
          >
            <MessageSquare size={20} />
          </button>

          {transcript.length > 0 && (
            <button
              onClick={exportTranscript}
              className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
              title="Export Transcript"
            >
              <Download size={20} />
            </button>
          )}

          <button
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>

      <RoomAudioRenderer />
    </div>
  );
}

// Main Interview Component
export default function Interview() {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');

  // Create token source - only when connection details are available
  const tokenSource = useMemo(() => {
    if (!connectionDetails) {
      // Return a token source that will wait - won't be called until connectionDetails is ready
      return TokenSource.custom(async () => {
        // This should never be called if connectionDetails is null due to early returns
        await new Promise(() => {}); // Wait forever
        throw new Error('Connection details not available');
      });
    }
    return TokenSource.custom(async () => {
      return {
        serverUrl: connectionDetails.serverUrl,
        participantToken: connectionDetails.participantToken,
        participantName: connectionDetails.participantName,
        roomName: connectionDetails.roomName,
      };
    });
  }, [connectionDetails]);

  const session = useSession(tokenSource, {
    agentName: 'Drew_2a0', // Specify agent name for LiveKit Cloud dispatch
  });

  // Auto-start session when connection details are available
  useEffect(() => {
    if (connectionDetails && session && !session.isConnected) {
      // Small delay to ensure token source is ready
      const timer = setTimeout(() => {
        if (!session.isConnected && connectionDetails) {
          session.start();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [connectionDetails, session]);

  useEffect(() => {
    const fetchConnectionDetails = async () => {
      try {
        // Use the same API base URL pattern as other pages
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const backendUrl = apiBaseUrl.replace('/api', '') || 'http://localhost:3000';
        const token = localStorage.getItem('authToken');

        if (!token) {
          setError('Please login first');
          setLoading(false);
          return;
        }

        const response = await fetch(`${backendUrl}/api/livekit/connection-details`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            room_config: {
              agents: [{ agent_name: 'Drew_2a0' }],
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch connection details`);
        }

        const data = await response.json();
        setConnectionDetails(data);
      } catch (err: any) {
        console.error('Error fetching connection details:', err);
        const errorMessage = err.message || 'Failed to connect. Please check your backend is running and CORS is configured.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectionDetails();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Connecting to interview...</p>
        </div>
      </div>
    );
  }

  if (error || !connectionDetails) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error || 'Unable to establish connection'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <SessionProvider session={session}>
      <InterviewSession taskId={taskId} />
    </SessionProvider>
  );
}

