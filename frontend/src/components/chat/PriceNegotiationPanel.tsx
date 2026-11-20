import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, Badge, Card, Form, Button, ListGroup } from 'react-bootstrap';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
  getPriceOffers,
  createPriceOffer,
  acceptPriceOffer,
  rejectPriceOffer,
  PriceOfferResponse,
} from '../../clients/PriceOfferClient';
import { WS_CHAT_URL } from '../../config/ApiConfig';

interface PriceNegotiationPanelProps {
  conversationId: number;
  bookingId: number;
  currentBookingPrice: number;
  currentUserId: number;
  onOfferAccepted?: (bookingId: number, newTotalAmount: number) => void;
}

const formatPrice = (amount: number): string => {
  return amount.toLocaleString('vi-VN') + 'đ';
};

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mergeOffers = (
  existing: PriceOfferResponse[],
  incoming: PriceOfferResponse[]
): PriceOfferResponse[] => {
  const byId = new Map<number, PriceOfferResponse>();
  for (const offer of existing) {
    byId.set(offer.id, offer);
  }
  for (const offer of incoming) {
    byId.set(offer.id, offer);
  }
  return Array.from(byId.values()).sort((a, b) => a.id - b.id);
};

export const PriceNegotiationPanel = ({
  conversationId,
  bookingId,
  currentBookingPrice,
  currentUserId,
  onOfferAccepted,
}: PriceNegotiationPanelProps) => {
  const [offers, setOffers] = useState<PriceOfferResponse[]>([]);
  const [proposedPrice, setProposedPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<Client | null>(null);
  const onOfferAcceptedRef = useRef(onOfferAccepted);

  useEffect(() => {
    onOfferAcceptedRef.current = onOfferAccepted;
  }, [onOfferAccepted]);

  const pendingOffer = [...offers].reverse().find((o) => o.status === 'PENDING');
  const offerHistory = [...offers]
    .filter((o) => o.status !== 'PENDING')
    .sort((a, b) => b.id - a.id);

  const syncOffers = useCallback(async () => {
    try {
      const data = await getPriceOffers(conversationId);
      setOffers((prev) => mergeOffers(prev, data));
    } catch (err) {
      console.error('Failed to load price offers:', err);
      setError('Không thể tải danh sách đề xuất giá.');
    }
  }, [conversationId]);

  useEffect(() => {
    setOffers([]);
    setError(null);
    void syncOffers();
  }, [conversationId, syncOffers]);

  // WebSocket for real-time offer updates
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_CHAT_URL),
      reconnectDelay: 3000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/offers/${conversationId}`, (message) => {
          const offer = JSON.parse(message.body) as PriceOfferResponse;
          setOffers((prev) => mergeOffers(prev, [offer]));
          if (offer.status === 'ACCEPTED') {
            onOfferAcceptedRef.current?.(offer.bookingId, offer.totalAmount);
          }
        });
        // Re-sync after subscribe so offers created right before connect aren't missed
        void syncOffers();
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      debug: (str) => console.log('STOMP Offers:', str),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setConnected(false);
      void client.deactivate();
    };
  }, [conversationId, syncOffers]);

  const handlePropose = async () => {
    const amount = parseInt(proposedPrice.replace(/\D/g, ''), 10);
    if (!amount || amount <= 0) return;

    setLoading(true);
    setError(null);
    try {
      const created = await createPriceOffer({
        bookingId,
        chatConversationId: conversationId,
        totalAmount: amount,
      });
      setOffers((prev) => mergeOffers(prev, [created]));
      setProposedPrice('');
    } catch (err) {
      console.error('Failed to create price offer:', err);
      setError('Không thể gửi đề xuất giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (offerId: number) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await acceptPriceOffer(offerId);
      setOffers((prev) => mergeOffers(prev, [updated]));
      onOfferAcceptedRef.current?.(updated.bookingId, updated.totalAmount);
    } catch (err) {
      console.error('Failed to accept price offer:', err);
      setError('Không thể chấp nhận đề xuất giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (offerId: number) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await rejectPriceOffer(offerId);
      setOffers((prev) => mergeOffers(prev, [updated]));
    } catch (err) {
      console.error('Failed to reject price offer:', err);
      setError('Không thể từ chối đề xuất giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <strong>Thương lượng giá</strong>
        <Badge bg={connected ? 'success' : 'secondary'} pill>
          {connected ? 'Real-time' : 'Đang kết nối...'}
        </Badge>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="mb-3">
          <div className="text-muted small">Giá hiện tại</div>
          <div className="fs-5 fw-bold text-primary">
            {formatPrice(currentBookingPrice)}
          </div>
        </div>

        {!pendingOffer ? (
          <div className="mb-3">
            <Form.Label>Đề xuất giá mới</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Nhập giá..."
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handlePropose();
                  }
                }}
                disabled={loading}
              />
              <Button onClick={handlePropose} disabled={loading || !proposedPrice}>
                Đề xuất
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <div className="alert alert-info">
              <div className="fw-bold">Đề xuất đang chờ</div>
              <div className="fs-5">{formatPrice(pendingOffer.totalAmount)}</div>
              {pendingOffer.senderId !== currentUserId ? (
                <div className="mt-2 d-flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleAccept(pendingOffer.id)}
                    disabled={loading}
                  >
                    Chấp nhận
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleReject(pendingOffer.id)}
                    disabled={loading}
                  >
                    Từ chối
                  </Button>
                </div>
              ) : (
                <div className="mt-2 text-muted small">
                  Đang chờ phản hồi từ bên kia...
                </div>
              )}
            </div>
          </div>
        )}

        {offerHistory.length > 0 && (
          <div>
            <div className="text-muted small mb-2">Lịch sử đề xuất</div>
            <ListGroup variant="flush">
              {offerHistory.map((offer) => (
                <ListGroup.Item key={offer.id} className="px-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div>{formatPrice(offer.totalAmount)}</div>
                      <div className="text-muted small">
                        {formatDate(offer.createdAt)}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        offer.status === 'ACCEPTED' ? 'bg-success' : 'bg-danger'
                      }`}
                    >
                      {offer.status === 'ACCEPTED' ? 'Đã chấp nhận' : 'Đã từ chối'}
                    </span>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
