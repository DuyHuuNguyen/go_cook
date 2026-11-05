import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface ChatMessage {
  sender: string;
  content: string;
  timestamp: number;
}

export default function ChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('User' + Math.floor(Math.random() * 1000));
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8083/ws-chat'),
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/messages', (message) => {
          const chatMessage = JSON.parse(message.body) as ChatMessage;
          setMessages((prev) => [...prev, chatMessage]);
        });
      },
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (!inputMessage.trim() || !clientRef.current?.connected) return;

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        sender: username,
        content: inputMessage,
        timestamp: Date.now(),
      }),
    });

    setInputMessage('');
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Chat Demo (WebSocket)</h5>
              <span className={`badge ${connected ? 'bg-success' : 'bg-danger'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="card-body">
              <div
                className="border rounded p-3 mb-3"
                style={{ height: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
              >
                {messages.map((msg, idx) => (
                  <div key={idx} className="mb-2">
                    <strong className="text-primary">{msg.sender}:</strong>{' '}
                    <span>{msg.content}</span>
                    <small className="text-muted ms-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </small>
                  </div>
                ))}
              </div>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ maxWidth: '150px' }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type a message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  disabled={!connected}
                />
                <button
                  className="btn btn-primary"
                  onClick={sendMessage}
                  disabled={!connected}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
