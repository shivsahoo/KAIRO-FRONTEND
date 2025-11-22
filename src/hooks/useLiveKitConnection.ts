import { useState, useMemo } from 'react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api';

export function useLiveKitConnection(agentName: string) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);

  const tokenSource = useMemo(() => {
    return TokenSource.custom(async () => {
      const url = new URL(`${API_BASE_URL}/mock-interview/connection-details`);
      
      console.log('🔍 TokenSource: Fetching connection details from:', url.toString());

      try {
        const res = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            room_config: agentName
              ? {
                  agents: [{ agent_name: agentName }],
                }
              : undefined,
          }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('❌ TokenSource: API error response:', errorText);
          throw new Error(`Failed to fetch connection details: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('✅ TokenSource: Connection details received');
        return data;
      } catch (error) {
        console.error('❌ TokenSource: Error fetching connection details:', error);
        throw new Error(`Error fetching connection details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }, [agentName]);

  const session = useSession(
    tokenSource,
    agentName ? { agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;

  const connect = async () => {
    setIsConnectionActive(true);
    try {
      await startSession();
    } catch (error) {
      console.error('Failed to start session:', error);
      setIsConnectionActive(false);
      throw error;
    }
  };

  const disconnect = async () => {
    setIsConnectionActive(false);
    await endSession();
  };

  return {
    session,
    isConnectionActive,
    connect,
    disconnect,
  };
}

