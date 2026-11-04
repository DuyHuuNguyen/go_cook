import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { getConversations, ChatConversationResponse } from '../clients/ChatClient';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatContainer } from '../components/chat/ChatContainer';
import { PriceNegotiationPanel } from '../components/chat/PriceNegotiationPanel';
import { useProfile } from '../contexts/ProfileContext';

export const ChatPage = () => {
  const [conversations, setConversations] = useState<ChatConversationResponse[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number>();
  const [loading, setLoading] = useState(true);

  const { profileData } = useProfile();
  const currentUserId = profileData?.id ? parseInt(profileData.id) : 0;

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0) {
        setActiveConversationId(data[0].id);
      }
      setLoading(false);
    };

    loadConversations();
  }, []);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Tin nhắn</h2>
      <Row>
        <Col md={4} className="border-end">
          {loading ? (
            <div className="text-center text-muted">Đang tải...</div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelect={setActiveConversationId}
            />
          )}
        </Col>
        <Col md={8}>
          {activeConversation ? (
            <>
              <ChatContainer
                conversationId={activeConversation.id}
                currentUserId={currentUserId}
                currentBookingPrice={activeConversation.booking?.totalAmount}
              />
              {activeConversation.booking && (
                <div className="mt-3">
                  <PriceNegotiationPanel
                    conversationId={activeConversation.id}
                    bookingId={activeConversation.booking.id}
                    currentBookingPrice={activeConversation.booking.totalAmount}
                    currentUserId={currentUserId}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted mt-5">
              Chọn một cuộc trò chuyện để bắt đầu
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};
