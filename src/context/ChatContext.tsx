import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Message, ChatContextType, FeedbackType, DislikeFeedbackReason } from '../types';
import { mockMessages } from '../data/mockMessages';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = msg.reactions || [];
          if (currentReactions.includes(emoji)) {
            return msg;
          }
          return { ...msg, reactions: [...currentReactions, emoji] };
        }
        return msg;
      })
    );
  }, []);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = msg.reactions || [];
          return { ...msg, reactions: currentReactions.filter((r) => r !== emoji) };
        }
        return msg;
      })
    );
  }, []);

  const setFeedback = useCallback((messageId: string, feedbackType: FeedbackType) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            feedbackType,
            hasFeedback: true,
            dislikeReasons: feedbackType === 'disliked' ? msg.dislikeReasons : undefined,
          };
        }
        return msg;
      })
    );
  }, []);

  const setDislikeReasons = useCallback((messageId: string, reasons: DislikeFeedbackReason[]) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return { ...msg, dislikeReasons: reasons };
        }
        return msg;
      })
    );
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text,
        timestamp: Date.now(),
        type: 'text',
        replyTo: replyingTo?.id,
      };
      setMessages((prev) => [...prev, newMessage]);
      setReplyingTo(null);
    },
    [replyingTo]
  );

  return (
    <ChatContext.Provider
      value={{
        messages,
        replyingTo,
        setReplyingTo,
        addReaction,
        removeReaction,
        setFeedback,
        setDislikeReasons,
        sendMessage,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
