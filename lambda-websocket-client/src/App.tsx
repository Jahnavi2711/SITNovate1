import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ChatClient } from './chat-client';
import './App.css';

// Use your AWS WebSocket URL
const WS_URL = 'wss://nmcd5ujx96.execute-api.ap-south-1.amazonaws.com/website1/';

// Add debug logs after WS_URL is defined
console.log('Environment:', process.env.NODE_ENV);
console.log('WebSocket URL:', WS_URL);

const MAX_RETRIES = 3;

const App: React.FC = () => {

  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [chatRows, setChatRows] = useState<React.ReactNode[]>([]);
  const retryCount = useRef(0);
  const isConnecting = useRef(false);

  const onSocketOpen = useCallback(() => {
    console.log('WebSocket connected');
    setIsConnected(true);
    retryCount.current = 0;
    isConnecting.current = false;
    const name = prompt('Enter your name');
    if (name && socket.current) {
      socket.current.send(JSON.stringify({ action: 'setName', name }));
    }
  }, []);

  const onSocketClose = useCallback(() => {
    console.log('WebSocket disconnected');
    setMembers([]);
    setIsConnected(false);
    setChatRows([]);
    isConnecting.current = false;
  }, []);

  const onSocketMessage = useCallback((dataStr: string) => {
    try {
      const data = JSON.parse(dataStr);
      
      // Handle AWS Gateway specific status codes
      if (data.statusCode) {
        switch (data.statusCode) {
          case 200:
            console.log('Message sent successfully');
            break;
          case 410:
            console.log('Connection stale, reconnecting...');
            onConnect();
            break;
          default:
            console.error('Error:', data.body);
        }
        return;
      }

      // Handle regular messages
      if (data.members) {
        setMembers(data.members);
      } else if (data.publicMessage) {
        setChatRows(oldArray => [...oldArray, <span key={Date.now()}><b>{data.publicMessage}</b></span>]);
      } else if (data.privateMessage) {
        alert(data.privateMessage);
      } else if (data.systemMessage) {
        setChatRows(oldArray => [...oldArray, <span key={Date.now()}><i>{data.systemMessage}</i></span>]);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }, []);

  const onConnect = useCallback(() => {
    if (!isConnecting.current && !isConnected && retryCount.current < MAX_RETRIES) {
      console.log('Attempting connection...');
      isConnecting.current = true;
      
      if (socket.current) {
        socket.current.close();
      }

      socket.current = new WebSocket(WS_URL);
      socket.current.addEventListener('open', onSocketOpen);
      socket.current.addEventListener('close', onSocketClose);
      socket.current.addEventListener('message', (event) => {
        onSocketMessage(event.data);
      });
      
      socket.current.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        isConnecting.current = false;
        retryCount.current++;
        if (retryCount.current < MAX_RETRIES) {
          console.log(`Retrying connection (${retryCount.current}/${MAX_RETRIES})...`);
          setTimeout(onConnect, 3000);
        } else {
          console.log('Max retries reached, stopping reconnection attempts');
        }
      });
    }
  }, [onSocketOpen, onSocketClose, onSocketMessage, isConnected]);

  useEffect(() => {
    return () => {
      socket.current?.close();
    };
  }, []);

  const onSendPrivateMessage = useCallback((to: string) => {
    const message = prompt('Enter private message for ' + to);
    socket.current?.send(JSON.stringify({
      action: 'sendPrivate',
      message,
      to,
    }));
  }, []);

  const onSendPublicMessage = useCallback(() => {
    const message = prompt('Enter public message');
    socket.current?.send(JSON.stringify({
      action: 'sendPublic',
      message,
    }));
  }, []);

  const onDisconnect = useCallback(() => {
    if (isConnected) {
      socket.current?.close();
    }
  }, [isConnected]);

  return <ChatClient
    isConnected={isConnected}
    members={members}
    chatRows={chatRows}
    onPublicMessage={onSendPublicMessage}
    onPrivateMessage={onSendPrivateMessage}
    onConnect={onConnect}
    onDisconnect={onDisconnect}
  />;

}

export default App