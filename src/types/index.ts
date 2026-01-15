export type MessageType = 'event' | 'text' | 'ai' | 'human';

export type SenderType = 'system' | 'user' | 'ai_astrologer' | 'human_astrologer';

export type FeedbackType = 'liked' | 'disliked' | null;

export type DislikeFeedbackReason = 'Inaccurate' | 'Too Vague' | 'Too Long';

export interface Message {
  id: string;
  sender: SenderType;
  text: string;
  timestamp: number;
  type: MessageType;
  hasFeedback?: boolean;
  feedbackType?: FeedbackType;
  dislikeReasons?: DislikeFeedbackReason[];
  replyTo?: string;
  reactions?: string[];
}

export interface ChatContextType {
  messages: Message[];
  replyingTo: Message | null;
  setReplyingTo: (message: Message | null) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  setFeedback: (messageId: string, feedbackType: FeedbackType) => void;
  setDislikeReasons: (messageId: string, reasons: DislikeFeedbackReason[]) => void;
  sendMessage: (text: string) => void;
}
