import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomAudioRenderer, SessionProvider, useSessionContext, useSessionMessages, useSession } from '@livekit/components-react';
import { TokenSource } from 'livekit-client';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare } from 'lucide-react';

interface ConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
}

// Simple Interview Session Component
function InterviewSession() {
  const session = useSessionContext();
  const { messages } = useSessionMessages(session);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const navigate = useNavigate();

  const handleEndCall = () => {
    session.end();
    navigate('/');
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

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Main Video Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
          {/* AI Agent Video */}
          <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center border-2 border-blue-500">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl text-white">AI</span>
              </div>
              <p className="text-white text-lg">AI Interviewer</p>
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
      <InterviewSession />
    </SessionProvider>
  );
}

