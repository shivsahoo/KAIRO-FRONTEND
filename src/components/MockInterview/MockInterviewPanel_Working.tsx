import { useState } from 'react';
import { motion } from 'framer-motion';
import { StopCircle, Loader2, User } from 'lucide-react';
import { LiveKitRoom, RoomAudioRenderer, useParticipants } from '@livekit/components-react';
import '@livekit/components-styles';
import { 
  getLiveKitToken, 
  startMockInterview, 
  endMockInterview,
  getPersonas,
} from '../../utils/api';
import { useEffect } from 'react';

// Simple agent detection component (must be inside LiveKitRoom)
function AgentStatus() {
  const participants = useParticipants();
  
  useEffect(() => {
    console.log('👥 All participants:', participants.map(p => ({
      identity: p.identity,
      name: p.name,
      isLocal: p.isLocal,
    })));
  }, [participants]);
  
  const agent = participants.find(p => 
    !p.isLocal && (
      p.identity.includes('Drew') || 
      p.identity.includes('agent') ||
      p.identity.toLowerCase().includes('drew_2a0')
    )
  );
  
  if (agent) {
    console.log('🤖✅ Agent detected:', agent.identity);
  }
  
  return (
    <div className="text-sm text-gray-500">
      {agent ? `✅ AI Agent Connected (${agent.identity})` : '⏳ Waiting for AI Agent...'}
    </div>
  );
}

export default function MockInterviewPanel({ taskId, onComplete }: { taskId?: string, onComplete?: (evaluation: any) => void }) {
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState('');
  const [isInterviewStarted, setInterviewStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('junior-frontend-developer');
  const [personas, setPersonas] = useState<any[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

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

  const handleStartInterview = async () => {
    setIsStarting(true);
    setError(null);
    
    try {
      const room = `interview-${taskId}-${Date.now()}`;
      setRoomName(room);
      
      console.log('🔍 Requesting LiveKit token for room:', room);
      const tokenResponse = await getLiveKitToken(room, 'HR Interviewer');
      console.log('✅ Token response:', tokenResponse);
      console.log('🤖 Agent will be dispatched:', tokenResponse.agentName);
      
      setToken(tokenResponse.token);
      
      const result = await startMockInterview(room, selectedPersona);
      setInterviewStarted(true);
      
      console.log('✅ Interview started successfully');
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
      const result = await endMockInterview(roomName);
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

  if (evaluation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-[8px] p-6 border border-[#E5E5E5] max-w-3xl mx-auto mt-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="text-[20px] font-semibold text-[#0D0D0D]">Interview Complete!</div>
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
          The AI agent will automatically join when you connect
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* LiveKit Room - Full Height */}
        <div className="flex-1 bg-gray-900 relative">
          {token && (
            <LiveKitRoom
              video={true}
              audio={true}
              token={token}
              serverUrl={import.meta.env.VITE_LIVEKIT_URL || "wss://kairo-imiootqz.livekit.cloud"}
              connect={true}
              data-lk-theme="default"
              style={{ height: '100%', width: '100%' }}
            >
              {/* Header inside room context */}
              <div className="absolute top-0 inset-x-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Mock Interview - Live</h2>
                  <AgentStatus />
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

              {/* Audio renderer */}
              <RoomAudioRenderer />
              
              {/* Center content */}
              <div className="flex h-full items-center justify-center text-white pt-20">
                <div className="text-center">
                  <p className="text-lg mb-4">🎙️ Interview in Progress</p>
                  <p className="text-sm text-gray-300">Speak naturally - the AI is listening</p>
                </div>
              </div>
            </LiveKitRoom>
          )}
          {!token && (
            <div className="flex h-full items-center justify-center text-white">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
                <p className="text-lg">Connecting to interview room...</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-700 px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

