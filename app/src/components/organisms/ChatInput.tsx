import { useState, type KeyboardEvent } from 'react';
import { Textarea } from '@/components/molecules/Textarea';
import { ChatInputControls } from './ChatInputControls';

interface ChatInputProps {
  height?: { min: number; max: number };
  sendMessage: (message: string) => void;
}

export const ChatInput = ({
  height = { min: 4, max: 8 },
  sendMessage,
}: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const handleKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-neutral-content/20 flex w-[80%] flex-row rounded-4xl border">
      <Textarea
        variant="chat"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ minHeight: `${height.min}rem`, maxHeight: `${height.max}rem` }}
        className="p-6"
        onKeyDown={handleKeydown}
      />
      <div className="flex items-center">
        <ChatInputControls />
      </div>
    </div>
  );
};
