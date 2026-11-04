import { useState } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSend, disabled }: MessageInputProps) => {
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (content.trim()) {
      onSend(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <InputGroup>
      <Form.Control
        as="textarea"
        rows={2}
        placeholder="Nhập tin nhắn..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <Button onClick={handleSend} disabled={disabled || !content.trim()}>
        Gửi
      </Button>
    </InputGroup>
  );
};
