import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { StopCircle, Loader2, CheckCircle2, User } from 'lucide-react';
import { SessionProvider, VideoConference, RoomAudioRenderer } from '@livekit/components-react';
import { RoomEvent, RemoteParticipant, LocalParticipant } from 'livekit-client';
import '@livekit/components-styles';
import { 
  startMockInterview, 
  endMockInterview,
  getPersonas,
} from '../../utils/api';
import { useLiveKitConnection } from '../../hooks/useLiveKitConnection';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api';

export default function MockInterviewPanel({ taskId, onComplete }: { taskId?: string, onComplete?: (evaluation: any) => void }) {
  const [roomName, setRoomName] = useState('');
  const [isInterviewStarted, setInterviewStarted] = useState(false);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('junior-frontend-developer');
  const [personas, setPersonas] = useState<any[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isAgentConnected, setIsAgentConnected] = useState(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Load personas on mount
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const data = await getPersonas();
        setPersonas(data);
      } catch (err) {
        console.error('Failed to load personas:', err);
        setPersonas([
          {
            key: 'junior-frontend-developer',
            name: 'Alex Kumar',
            role: 'Junior Frontend Developer',
            experience: '1 year',
            description: 'Entry-level candidate with 1 year of experience',
            characteristics: ['Eager to learn', 'Basic React knowledge'],
          },
        ]);
      }
    };
    loadPersonas();
  }, []);

  // Get agent name from environment or default
  const agentName = import.meta.env.VITE_LIVEKIT_AGENT_NAME || 'Drew_2a0';

  // Create TokenSource matching agent-starter pattern
  // This will be called automatically when startSession() is invoked
  const tokenSource = useMemo(() => {
    return TokenSource.custom(async () => {
      console.log('🔍 TokenSource: Fetching connection details from API...');
      const url = new URL(`${API_BASE_URL}/mock-interview/connection-details`);
      
      try {
        const requestBody = {
          room_config: agentName
            ? {
                agents: [{ agent_name: agentName }],
              }
            : undefined,
        };
        
        console.log('📤 TokenSource: Request body:', requestBody);
        
        const res = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ TokenSource: API error response:', errorText);
          throw new Error(`Failed to fetch connection details: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('✅ TokenSource: Connection details received:', {
          serverUrl: data.serverUrl,
          roomName: data.roomName,
          participantName: data.participantName,
          hasToken: !!data.participantToken,
        });
        
        // Ensure serverUrl is properly formatted (wss://)
        if (data.serverUrl && !data.serverUrl.startsWith('wss://') && !data.serverUrl.startsWith('ws://')) {
          data.serverUrl = data.serverUrl.replace('https://', 'wss://').replace('http://', 'ws://');
        }
        
        return data;
      } catch (error) {
        console.error('❌ TokenSource: Error fetching connection details:', error);
        throw new Error(`Error fetching connection details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }, [agentName]);

  // Use session hook like agent-starter
  const session = useSession(
    tokenSource,
    agentName ? { agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;

  const handleStartInterview = async () => {
    setIsStarting(true);
    setError(null);
    
    try {
      // Start the session (this will automatically call TokenSource to fetch connection details)
      console.log('🔍 Starting LiveKit session...');
      console.log('📋 TokenSource configured:', !!tokenSource);
      console.log('🤖 Agent name:', agentName);
      console.log('🌐 API Base URL:', API_BASE_URL);
      
      // This will trigger TokenSource.custom() to fetch connection details
      // The TokenSource will POST to /api/mock-interview/connection-details
      await startSession();
      
      // Wait a bit for room to be available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the room name from session after connection
      const currentRoom = session.room;
      if (currentRoom) {
        setRoomName(currentRoom.name);
        console.log('✅ Connected to room:', currentRoom.name);
        console.log('🌐 Room name:', currentRoom.name);
      } else {
        console.warn('⚠️ Session started but room not available yet');
        console.log('📊 Session state:', {
          isConnected: session.isConnected,
          connectionState: session.connectionState,
        });
      }
      
      // Start interview session in backend
      const result = await startMockInterview(currentRoom?.name || `interview-${taskId}-${Date.now()}`, selectedPersona);
      setInterviewStarted(true);
      
      setTranscript([{
        speaker: 'System',
        text: `Interview started with ${result.persona.name}. The AI agent will join shortly...`,
        timestamp: new Date().toISOString(),
      }]);
    } catch (err: any) {
      console.error('❌ Failed to start interview:', err);
      setError(err.message || 'Failed to start interview');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndInterview = async () => {
    setIsEnding(true);
    
    try {
      // End the LiveKit session
      await endSession();
      
      // End interview in backend
      const result = await endMockInterview(roomName || session.room?.name || '');
      setEvaluation(result.interview.evaluation);
      if (onComplete) {
        onComplete(result.interview.evaluation);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to end interview');
    } finally {
      setIsEnding(false);
    }
  };


  // Handle room events to detect agent connection
  useEffect(() => {
    if (!session.room) return;
    
    const room = session.room;
    console.log('✅ Connected to LiveKit room:', room?.name || roomName);
    
    // Log current participants (if any)
    if (room?.remoteParticipants) {
      const participants = Array.from(room.remoteParticipants.values()).map(p => p.identity);
      console.log('🔍 Current participants:', participants);
    } else {
      console.log('🔍 No remote participants yet');
    }
    
    // Check for existing participants immediately
    const checkExistingParticipants = () => {
      if (room?.remoteParticipants) {
        const allParticipants = Array.from(room.remoteParticipants.values()) as RemoteParticipant[];
        console.log('🔍 Checking existing participants:', allParticipants.map((p: RemoteParticipant) => ({
          identity: p.identity,
          kind: p.kind,
          sid: p.sid,
        })));
        
        allParticipants.forEach((participant: RemoteParticipant) => {
          const identityLower = participant.identity?.toLowerCase() || '';
          const isAgent = identityLower.includes('agent') || 
                         identityLower.includes('drew') ||
                         identityLower.includes('bot') ||
                         identityLower === 'drew_2a0' ||
                         participant.identity === 'Drew_2a0';
          
          if (isAgent) {
            console.log('🤖✅ Found existing agent:', participant.identity);
            setIsAgentConnected(true);
          }
        });
      }
    };
    
    // Check immediately
    checkExistingParticipants();
    
    // Set up periodic polling (agent might join after room connection)
    const pollInterval = setInterval(() => {
      console.log('🔍 Periodic check for agent...');
      checkExistingParticipants();
    }, 2000);
    
    // Stop polling after 30 seconds
    const stopPolling = setTimeout(() => clearInterval(pollInterval), 30000);
    
    // Also check at specific intervals
    setTimeout(checkExistingParticipants, 3000);
    setTimeout(checkExistingParticipants, 5000);
    setTimeout(checkExistingParticipants, 10000);
    
    // Event handlers
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      console.log('👤 PARTICIPANT CONNECTED EVENT:', {
        identity: participant.identity,
        sid: participant.sid,
        metadata: participant.metadata,
        kind: participant.kind,
      });
      
      // Log ALL participants in room now
      if (room?.remoteParticipants) {
        const allNow = Array.from(room.remoteParticipants.values()).map((p: RemoteParticipant) => p.identity);
        console.log('📊 ALL participants in room now:', allNow);
      }
      
      // Check if this is the agent (more comprehensive check)
      const identity = participant.identity || '';
      const identityLower = identity.toLowerCase();
      
      const isAgent = identityLower.includes('agent') || 
                     identityLower.includes('drew') ||
                     identityLower.includes('bot') ||
                     identityLower === 'drew_2a0' ||
                     identity === 'Drew_2a0';
      
      console.log(`🔍 Agent check for "${identity}":`, isAgent);
      console.log('   - Contains "agent":', identityLower.includes('agent'));
      console.log('   - Contains "drew":', identityLower.includes('drew'));
      
      if (isAgent) {
        console.log('🎉🤖✅ AI AGENT DETECTED AND CONNECTED:', participant.identity);
        setIsAgentConnected(true);
        setTranscript(prev => [...prev, {
          speaker: 'System',
          text: `AI Agent (${participant.identity}) has joined the interview. You can start speaking now.`,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        console.log('👤 Regular participant joined:', participant.identity);
      }
    };
    
    const handleParticipantMetadataChanged = (metadata: string | undefined, participant: RemoteParticipant | LocalParticipant) => {
      console.log('📝 Participant metadata changed:', participant.identity, metadata);
    };

    const handleDataReceived = (payload: Uint8Array) => {
      // Handle transcript data from agent
      try {
        const text = new TextDecoder().decode(payload);
        const data = JSON.parse(text);
        
        if (data.type === 'transcript') {
          setTranscript(prev => [...prev, {
            speaker: data.speaker || 'Agent',
            text: data.text,
            timestamp: new Date().toISOString(),
          }]);
        }
      } catch (err) {
        console.log('Received non-JSON data:', err);
      }
    };

    const handleDisconnected = () => {
      clearInterval(pollInterval);
      clearTimeout(stopPolling);
    };

    // Register event listeners
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantMetadataChanged, handleParticipantMetadataChanged);
    room.on(RoomEvent.DataReceived, handleDataReceived);
    room.on(RoomEvent.Disconnected, handleDisconnected);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
      clearTimeout(stopPolling);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantMetadataChanged, handleParticipantMetadataChanged);
      room.off(RoomEvent.DataReceived, handleDataReceived);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [session.room, roomName]);

  if (evaluation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-[8px] p-6 border border-[#E5E5E5] max-w-3xl mx-auto mt-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-8 h-8 text-[#059669]" />
          <div>
            <h3 className="text-[20px] font-semibold text-[#0D0D0D]">Interview Complete!</h3>
            <p className="text-[14px] text-[#787878]">Here's your performance evaluation</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-[#EEF2FF] rounded-[8px]">
          <div className="text-center">
            <div className="text-[48px] font-bold text-[#6366F1]">{evaluation.score}</div>
            <div className="text-[14px] text-[#787878]">out of 10</div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-[16px] font-semibold text-[#0D0D0D] mb-2">Strengths</h4>
          <div className="flex flex-wrap gap-2">
            {evaluation.strengths.map((item: string, idx: number) => (
              <span key={idx} className="bg-[#D1FAE5] text-[#059669] px-3 py-1 rounded-full text-sm">{item}</span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-[16px] font-semibold text-[#0D0D0D] mb-2">Weaknesses</h4>
          <div className="flex flex-wrap gap-2">
            {evaluation.weaknesses.map((item: string, idx: number) => (
              <span key={idx} className="bg-[#FEE2E2] text-[#DC2626] px-3 py-1 rounded-full text-sm">{item}</span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-[16px] font-semibold text-[#0D0D0D] mb-2">Suggestions</h4>
          <ul className="list-disc list-inside text-sm text-[#4B5563] space-y-1">
            {evaluation.suggestions.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </motion.div>
    );
  }

  if (!isInterviewStarted) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Start Mock Interview</h2>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Candidate Persona</label>
          <div className="grid gap-4">
            {personas.map((persona) => (
              <button
                key={persona.key}
                onClick={() => setSelectedPersona(persona.key)}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                  selectedPersona === persona.key
                    ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  selectedPersona === persona.key ? 'bg-indigo-200' : 'bg-gray-200'
                }`}>
                  <User className={`w-6 h-6 ${
                    selectedPersona === persona.key ? 'text-indigo-700' : 'text-gray-600'
                  }`} />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{persona.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">{persona.role} • {persona.experience}</p>
                  <p className="text-xs text-gray-400">{persona.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleStartInterview}
          disabled={isStarting}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isStarting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting up Interview Room...
            </>
          ) : (
            <>
              Start Interview with AI Agent
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          The AI agent will automatically join the room when you connect
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-[#E5E5E5] px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Mock Interview - Live</h2>
            <p className="text-sm text-gray-500">
              {isAgentConnected ? '✅ AI Agent Connected' : '⏳ Waiting for AI Agent...'}
            </p>
          </div>
          <button
            onClick={handleEndInterview}
            disabled={isEnding}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <StopCircle className="w-4 h-4" />
            End Interview
          </button>
        </div>

        {/* LiveKit Room - Full Screen */}
        <div className="flex-1 bg-gray-900 relative">
          <SessionProvider session={session}>
            {session.room ? (
              <>
                <VideoConference />
                <RoomAudioRenderer />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                  <p className="text-lg">Connecting to interview room...</p>
                </div>
              </div>
            )}
          </SessionProvider>
        </div>

        {/* Transcript Overlay (Optional) */}
        {transcript.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 max-w-2xl mx-auto bg-white/95 backdrop-blur rounded-lg shadow-lg p-4 max-h-48 overflow-y-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Transcript</h4>
            <div className="space-y-2">
              {transcript.slice(-5).map((entry, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-900">{entry.speaker}:</span>
                  <span className="text-gray-700 ml-2">{entry.text}</span>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
