import { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { useSearchParams } from 'react-router';
import {
  getConversations,
  getBookingConversation,
  ChatConversationResponse,
} from '../clients/ChatClient';
import { ConversationList } from '../components/chat/ConversationList';
import { ChatContainer } from '../components/chat/ChatContainer';
import { PriceNegotiationPanel } from '../components/chat/PriceNegotiationPanel';
import { useProfile } from '../contexts/ProfileContext';

export const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');

  const [conversations, setConversations] = useState<ChatConversationResponse[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);

  const { profileData } = useProfile();
  const currentUserId = profileData?.id ? parseInt(profileData.id) : 0;

  useEffect(() => {
    let isMounted = true;

    const initConversations = async () => {
      setLoading(true);
      setAccessError(null);

      try {
        const list = await getConversations();
        if (!isMounted) return;

        if (bookingIdParam) {
          const bookingId = Number(bookingIdParam);
          if (!Number.isNaN(bookingId)) {
            try {
              // Strictly fetch/create conversation for this booking
              const bookingConv = await getBookingConversation(bookingId);
              if (!isMounted) return;

              // De-duplicate in list
              const existingIndex = list.findIndex((c) => c.id === bookingConv.id);
              const updatedList =
                existingIndex >= 0
                  ? list.map((c) => (c.id === bookingConv.id ? bookingConv : c))
                  : [bookingConv, ...list];

              setConversations(updatedList);
              setActiveConversationId(bookingConv.id);
              setLoading(false);
              return;
            } catch (err: any) {
              if (!isMounted) return;
              console.error('Failed to access booking conversation:', err);
              const status = err?.response?.status;
              if (status === 403) {
                setAccessError(
                  'Bạn không có quyền truy cập vào cuộc trò chuyện của đơn đặt bếp này.'
                );
              } else if (status === 404) {
                setAccessError('Không tìm thấy đơn đặt bếp yêu cầu.');
              } else {
                setAccessError(
                  'Đơn đặt bếp này hiện chưa có đầu bếp nhận phục vụ hoặc không thể mở tin nhắn.'
                );
              }
              // Set list without arbitrarily selecting an unintended conversation
              setConversations(list);
              setActiveConversationId(undefined);
              setLoading(false);
              return;
            }
          }
        }

        setConversations(list);
        if (list.length > 0) {
          setActiveConversationId(list[0].id);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load conversations:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void initConversations();

    return () => {
      isMounted = false;
    };
  }, [bookingIdParam]);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const partnerName = activeConversation
    ? currentUserId === activeConversation.customer.id
      ? activeConversation.chef.name
      : activeConversation.customer.name
    : undefined;

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Tin nhắn</h2>

      {accessError && (
        <Alert variant="danger" dismissible onClose={() => setAccessError(null)}>
          {accessError}
        </Alert>
      )}

      <Row>
        <Col md={4} className="border-end">
          {loading ? (
            <div className="text-center text-muted">Đang tải...</div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelect={(id) => {
                setAccessError(null);
                setActiveConversationId(id);
              }}
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
                partnerName={partnerName}
                bookingCode={activeConversation.booking?.bookingCode}
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
