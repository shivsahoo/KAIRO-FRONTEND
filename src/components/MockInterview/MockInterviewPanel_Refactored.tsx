import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Send, StopCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { 
  getLiveKitToken, 
  startMockInterview, 
  getMockInterview, 
  askMockInterviewQuestion, 
  processMockInterviewAudio, 
  getMockInterviewAudioUrl, 
  endMockInterview 
} from '../../utils/api';

// ... imports ...

export default function MockInterviewPanel({ taskId }: { taskId?: string }) {
  // ... existing state ...
  const [roomName, setRoomName] = useState('');
  const [token, setToken] = useState('');
  const [isInterviewStarted, setInterviewStarted] = useState(false);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('junior-frontend-developer');
  const [personas, setPersonas] = useState<any[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const shouldProcessRef = useRef(false); // New ref to track if stop should trigger processing

  // ... useEffect for personas ...
  // ... handleStartInterview ...
  // ... handleTextQuestion ...

  const startRecording = async () => {
    try {
      // Clear any existing timer first
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      console.log(`🎙️ Starting recording with MIME type: ${mimeType}`);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      shouldProcessRef.current = false; // Reset flag

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle stop event to process audio
      mediaRecorder.onstop = () => {
        if (shouldProcessRef.current) {
          console.log('🛑 Recorder stopped, processing audio...');
          processCapturedAudio();
        } else {
          console.log('🛑 Recorder stopped (cancelled)');
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);

      // Timer triggers STOP (Hard Close) instead of sending directly
      recordingTimerRef.current = setInterval(() => {
        if (!isProcessing && audioChunksRef.current.length > 0) {
          console.log('⏱️ Timer reached - stopping for processing');
          stopRecording(true); // true = should process
        }
      }, 6000);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone. Please grant permission.');
    }
  };

  // Updated stopRecording to accept process flag
  const stopRecording = (shouldProcess: boolean = false) => {
    shouldProcessRef.current = shouldProcess;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); // This triggers onstop
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);
  };

  // New function called by onstop
  const processCapturedAudio = async () => {
    if (audioChunksRef.current.length === 0) return;

    console.log('📤 Processing captured audio...');
    setIsProcessing(true);
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    console.log(`📦 Audio blob size: ${audioBlob.size} bytes`);
    audioChunksRef.current = []; // Clear buffer

    try {
      const result = await processMockInterviewAudio(roomName, audioBlob);
      console.log('✅ Audio processed successfully');

      if (result.transcript) {
        setTranscript(prev => [...prev, {
          speaker: 'HR',
          text: result.transcript,
          timestamp: new Date().toISOString(),
        }]);
      }

      if (result.response) {
        setTranscript(prev => [...prev, {
          speaker: 'Candidate',
          text: result.response,
          timestamp: new Date().toISOString(),
        }]);

        // Play audio response (Resume handled by playAudio)
        const audioUrl = getMockInterviewAudioUrl(roomName, result.audioId);
        playAudio(audioUrl, true); // Always resume after successful response
      } else {
        // No response, resume immediately
        console.log('▶️ Resuming recording (no response)');
        setTimeout(() => startRecording(), 500);
      }
    } catch (err: any) {
      console.error('❌ Failed to process audio:', err);
      setError(err.message || 'Failed to process audio');
      
      // Resume on error
      console.log('▶️ Resuming recording (after error)');
      setTimeout(() => startRecording(), 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = (url: string, shouldResumeRecording: boolean = false) => {
    console.log('🔊 Playing AI audio response');
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    
    const audio = new Audio(url);
    audioElementRef.current = audio;
    
    audio.onended = () => {
      console.log('🔇 Audio finished playing');
      if (shouldResumeRecording) {
        console.log('▶️ Resuming recording after AI response');
        setTimeout(() => startRecording(), 500);
      }
    };
    
    audio.onerror = (err) => {
      console.error('Failed to play audio:', err);
      if (shouldResumeRecording) {
        setTimeout(() => startRecording(), 500);
      }
    };
    
    audio.play().catch(err => {
      console.error('Failed to play audio:', err);
      if (shouldResumeRecording) {
        setTimeout(() => startRecording(), 500);
      }
    });
  };

  // ... rest of component ...
}

