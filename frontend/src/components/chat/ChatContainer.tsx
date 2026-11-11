import { useState, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  getConversationMessages,
  sendMessage,
  ChatMessageResponse,
} from '../../clients/ChatClient';
import { WS_CHAT_URL } from '../../config/ApiConfig';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ChatContainerProps {
  conversationId: number;
  currentUserId: number;
  currentBookingPrice?: number;
  partnerName?: string;
  bookingCode?: string;
}

export const ChatContainer = ({
  conversationId,
  currentUserId,
  currentBookingPrice,
  partnerName,
  bookingCode,
}: ChatContainerProps) => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<Client | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      const data = await getConversationMessages(conversationId);
      setMessages(data);
      setLoading(false);
    };

    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_CHAT_URL),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        // Subscribe to messages topic
        client.subscribe('/topic/messages', (message) => {
          const newMessage = JSON.parse(message.body) as ChatMessageResponse;
          // Only add if it belongs to current conversation
          if (newMessage.conversationId === conversationId) {
            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          }
        });
      },
      onDisconnect: () => setConnected(false),
      debug: (str) => console.log('STOMP:', str),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [conversationId]);

  const handleSend = async (content: string) => {
    const newMessage = await sendMessage({
      conversationId,
      content,
      messageType: 'TEXT',
    });
    // Optimistically add message (will also come via WebSocket)
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });
  };

  return (
    <Container fluid className="d-flex flex-column" style={{ height: '70vh' }}>
      <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
        <div>
          {partnerName ? (
            <div className="d-flex align-items-center gap-2">
              <strong className="text-dark">{partnerName}</strong>
              {bookingCode && (
                <span className="badge bg-light text-dark border">
                  Đơn #{bookingCode}
                </span>
              )}
            </div>
          ) : (
            <small className="text-muted">Cuộc trò chuyện #{conversationId}</small>
          )}
        </div>
        <div className="d-flex align-items-center gap-3">
          {currentBookingPrice && (
            <div className="text-end">
              <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                Giá hiện tại
              </small>
              <strong className="text-success">
                {currentBookingPrice.toLocaleString('vi-VN')}đ
              </strong>
            </div>
          )}
          <span className={`badge ${connected ? 'bg-success' : 'bg-secondary'}`}>
            {connected ? 'Live' : 'Connecting...'}
          </span>
        </div>
      </div>
      <div className="flex-grow-1 overflow-auto mb-3 p-3 border rounded">
        {loading ? (
          <div className="text-center text-muted">Đang tải...</div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUserId={currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <MessageInput onSend={handleSend} disabled={loading} />
    </Container>
  );
};
