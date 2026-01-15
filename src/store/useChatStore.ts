import { create } from 'zustand';
import { Message, FeedbackType, DislikeFeedbackReason } from '../types';
import { mockMessages } from '../data/mockMessages';

interface ChatState {
  messages: Message[];
  replyingTo: Message | null;

  // Actions
  setReplyingTo: (message: Message | null) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  setFeedback: (messageId: string, feedbackType: FeedbackType) => void;
  setDislikeReasons: (messageId: string, reasons: DislikeFeedbackReason[]) => void;
  sendMessage: (text: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: mockMessages,
  replyingTo: null,

  setReplyingTo: (message) => set({ replyingTo: message }),

  addReaction: (messageId, emoji) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = msg.reactions || [];
          if (currentReactions.includes(emoji)) {
            return msg;
          }
          return { ...msg, reactions: [...currentReactions, emoji] };
        }
        return msg;
      }),
    })),

  removeReaction: (messageId, emoji) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id === messageId) {
          const currentReactions = msg.reactions || [];
          return { ...msg, reactions: currentReactions.filter((r) => r !== emoji) };
        }
        return msg;
      }),
    })),

  setFeedback: (messageId, feedbackType) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            feedbackType,
            hasFeedback: true,
            dislikeReasons: feedbackType === 'disliked' ? msg.dislikeReasons : undefined,
          };
        }
        return msg;
      }),
    })),

  setDislikeReasons: (messageId, reasons) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg.id === messageId) {
          return { ...msg, dislikeReasons: reasons };
        }
        return msg;
      }),
    })),

  sendMessage: (text) => {
    const { replyingTo } = get();
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: Date.now(),
      type: 'text',
      replyTo: replyingTo?.id,
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
      replyingTo: null,
    }));
  },
}));
