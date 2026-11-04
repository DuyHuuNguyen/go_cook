import { ChatMessageResponse } from '../../clients/ChatClient';

interface MessageBubbleProps {
  message: ChatMessageResponse;
  currentUserId: number;
}

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const MessageBubble = ({ message, currentUserId }: MessageBubbleProps) => {
  const isSystem = message.messageType === 'SYSTEM';
  const isSelf = message.senderId === currentUserId;

  if (isSystem) {
    return (
      <div className="text-center my-3">
        <span className="badge bg-secondary">{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`d-flex mb-3 ${isSelf ? 'justify-content-end' : 'justify-content-start'}`}>
      <div style={{ maxWidth: '70%' }}>
        {!isSelf && (
          <div className="text-muted small mb-1">{message.senderName}</div>
        )}
        <div
          className={`p-3 rounded ${
            isSelf ? 'bg-primary text-white' : 'bg-light'
          }`}
        >
          {message.content}
        </div>
        <div className={`text-muted small mt-1 ${isSelf ? 'text-end' : ''}`}>
          {formatTime(message.sentAt)}
        </div>
      </div>
    </div>
  );
};
