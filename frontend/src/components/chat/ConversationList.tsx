import { ListGroup, Badge, Button, Spinner } from 'react-bootstrap';
import { ChatConversationResponse } from '../../clients/ChatClient';

interface ConversationListProps {
  conversations: ChatConversationResponse[];
  activeConversationId?: number;
  onSelect: (id: number) => void;
  hasNext?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 24) {
    return `${hours} giờ trước`;
  }
  if (days === 1) {
    return 'Hôm qua';
  }
  return `${days} ngày trước`;
};

export const ConversationList = ({
  conversations,
  activeConversationId,
  onSelect,
  hasNext = false,
  loadingMore = false,
  onLoadMore,
}: ConversationListProps) => {
  return (
    <div>
      <ListGroup>
        {conversations.map((conv) => (
          <ListGroup.Item
            key={conv.id}
            active={conv.id === activeConversationId}
            action
            onClick={() => onSelect(conv.id)}
            className="d-flex justify-content-between align-items-start"
          >
            <div className="flex-grow-1">
              <div className="fw-bold">
                {conv.booking?.bookingCode || `Conversation #${conv.id}`}
              </div>
              <div className="text-muted small">
                {conv.customer.name} ↔ {conv.chef.name}
              </div>
              <div className="text-muted small">
                {formatRelativeTime(conv.lastMessageAt)}
              </div>
            </div>
            {conv.unreadCount > 0 && (
              <Badge bg="danger" pill>
                {conv.unreadCount}
              </Badge>
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {hasNext && onLoadMore && (
        <div className="d-grid mt-3">
          <Button
            variant="outline-success"
            size="sm"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang tải...
              </>
            ) : (
              'Xem thêm cuộc trò chuyện'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
