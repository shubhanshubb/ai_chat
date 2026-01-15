import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Message } from '../types';
import { useChatStore } from '../store/useChatStore';
import { ReactionBar } from './ReactionBar';
import { AIFeedback } from './AIFeedback';

interface MessageBubbleProps {
  message: Message;
  replyToMessage?: Message;
  onReplyPress?: (messageId: string) => void;
  isHighlighted?: boolean;
}

const SWIPE_THRESHOLD = 60;
const REPLY_ICON_SIZE = 24;

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, replyToMessage, onReplyPress, isHighlighted }) => {
  const setReplyingTo = useChatStore((state) => state.setReplyingTo);
  const addReaction = useChatStore((state) => state.addReaction);
  const translateX = useSharedValue(0);
  const showReactionBar = useSharedValue(false);
  const reactionBarOpacity = useSharedValue(0);
  const reactionBarScale = useSharedValue(0.8);

  const isUserMessage = message.sender === 'user';
  const isSystemMessage = message.type === 'event';
  const isAIMessage = message.type === 'ai';

  const handleReply = useCallback(() => {
    setReplyingTo(message);
  }, [message, setReplyingTo]);

  const handleLongPress = useCallback(() => {
    showReactionBar.value = true;
    reactionBarOpacity.value = withSpring(1, { damping: 15 });
    reactionBarScale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, [showReactionBar, reactionBarOpacity, reactionBarScale]);

  const handleReactionSelect = useCallback(
    (emoji: string) => {
      addReaction(message.id, emoji);
      reactionBarOpacity.value = withSpring(0);
      reactionBarScale.value = withSpring(0.8);
      showReactionBar.value = false;
    },
    [message.id, addReaction, reactionBarOpacity, reactionBarScale, showReactionBar]
  );

  const handleCloseReactionBar = useCallback(() => {
    reactionBarOpacity.value = withSpring(0);
    reactionBarScale.value = withSpring(0.8);
    showReactionBar.value = false;
  }, [reactionBarOpacity, reactionBarScale, showReactionBar]);

  // Pan gesture for swipe-to-reply (only for non-system messages)
  const panGesture = Gesture.Pan()
    .activeOffsetX(10)
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      // Only allow right swipe
      if (event.translationX > 0) {
        translateX.value = Math.min(event.translationX, SWIPE_THRESHOLD + 20);
      }
    })
    .onEnd(() => {
      if (translateX.value >= SWIPE_THRESHOLD) {
        runOnJS(handleReply)();
      }
      translateX.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    });

  // Animated styles for message bubble
  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Animated styles for reply icon
  const animatedReplyIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Animated styles for reaction bar
  const animatedReactionBarStyle = useAnimatedStyle(() => ({
    opacity: reactionBarOpacity.value,
    transform: [{ scale: reactionBarScale.value }],
  }));

  if (isSystemMessage) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{message.text}</Text>
      </View>
    );
  }

  const getSenderLabel = () => {
    switch (message.sender) {
      case 'ai_astrologer':
        return 'AI Astrologer';
      case 'human_astrologer':
        return 'Astrologer Vikram';
      default:
        return null;
    }
  };

  const senderLabel = getSenderLabel();

  return (
    <View style={[styles.container, isUserMessage && styles.containerRight, isHighlighted && styles.highlighted]}>
      {/* Reply icon (appears on left when swiping) */}
      <Animated.View style={[styles.replyIconContainer, animatedReplyIconStyle]}>
        <Text style={styles.replyIcon}>↩️</Text>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.bubbleWrapper,
            isUserMessage && styles.bubbleWrapperRight,
            animatedBubbleStyle,
          ]}>
          <Pressable onLongPress={handleLongPress} delayLongPress={300}>
            <View
              style={[
                styles.bubble,
                isUserMessage ? styles.userBubble : styles.otherBubble,
                message.sender === 'ai_astrologer' && styles.aiBubble,
                message.sender === 'human_astrologer' && styles.humanAstrologerBubble,
              ]}>
              {senderLabel && <Text style={styles.senderLabel}>{senderLabel}</Text>}

              {/* Reply preview */}
              {replyToMessage && (
                <Pressable
                  style={[styles.replyPreview, isUserMessage && styles.replyPreviewUser]}
                  onPress={() => onReplyPress?.(replyToMessage.id)}>
                  <View style={[styles.replyBar, isUserMessage && styles.replyBarUser]} />
                  <Text style={[styles.replyPreviewText, isUserMessage && styles.replyPreviewTextUser]} numberOfLines={1}>
                    {replyToMessage.text}
                  </Text>
                </Pressable>
              )}

              <Text style={[styles.messageText, isUserMessage && styles.userMessageText]}>
                {message.text}
              </Text>

              <Text style={[styles.timestamp, isUserMessage && styles.userTimestamp]}>
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            {/* Display reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <View style={[styles.reactionsContainer, isUserMessage && styles.reactionsRight]}>
                {message.reactions.map((emoji, index) => (
                  <Text key={index} style={styles.reactionEmoji}>
                    {emoji}
                  </Text>
                ))}
              </View>
            )}

            {/* AI Feedback component */}
            {isAIMessage && <AIFeedback message={message} />}
          </Pressable>

          {/* Reaction bar (appears on long press) */}
          <ReactionBar
            animatedStyle={animatedReactionBarStyle}
            onSelect={handleReactionSelect}
            onClose={handleCloseReactionBar}
            isUserMessage={isUserMessage}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  containerRight: {
    justifyContent: 'flex-end',
  },
  highlighted: {
    backgroundColor: 'rgba(107, 78, 230, 0.15)',
    borderRadius: 12,
  },
  replyIconContainer: {
    position: 'absolute',
    left: 16,
    width: REPLY_ICON_SIZE,
    height: REPLY_ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  replyIcon: {
    fontSize: 20,
  },
  bubbleWrapper: {
    maxWidth: '80%',
    position: 'relative',
  },
  bubbleWrapperRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    minWidth: 80,
  },
  userBubble: {
    backgroundColor: '#6B4EE6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#E8F4FD',
    borderLeftWidth: 3,
    borderLeftColor: '#4A90D9',
  },
  humanAstrologerBubble: {
    backgroundColor: '#FFF8E7',
    borderLeftWidth: 3,
    borderLeftColor: '#F5A623',
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  replyPreviewUser: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  replyBar: {
    width: 3,
    height: '100%',
    minHeight: 16,
    backgroundColor: '#6B4EE6',
    borderRadius: 2,
    marginRight: 8,
  },
  replyBarUser: {
    backgroundColor: '#FFF',
  },
  replyPreviewText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  replyPreviewTextUser: {
    color: 'rgba(255,255,255,0.9)',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFF',
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  systemMessageText: {
    fontSize: 12,
    color: '#888',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reactionsRight: {
    alignSelf: 'flex-end',
  },
  reactionEmoji: {
    fontSize: 16,
    marginHorizontal: 2,
  },
});
