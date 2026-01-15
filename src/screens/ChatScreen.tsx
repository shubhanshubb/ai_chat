import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useChatStore } from '../store/useChatStore';
import { MessageBubble, ChatInput, ChatHeader, RatingOverlay } from '../components';
import { Message } from '../types';

const ChatContent: React.FC = () => {
  const messages = useChatStore((state) => state.messages);
  const [showRatingOverlay, setShowRatingOverlay] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Create a map of messages for quick lookup
  const messagesMap = useMemo(() => {
    return messages.reduce(
      (acc, msg) => {
        acc[msg.id] = msg;
        return acc;
      },
      {} as Record<string, Message>
    );
  }, [messages]);

  const handleEndChat = useCallback(() => {
    setShowRatingOverlay(true);
  }, []);

  const handleCloseRating = useCallback(() => {
    setShowRatingOverlay(false);
  }, []);

  const handleReplyPress = useCallback(
    (messageId: string) => {
      // Find index of the message
      const index = messages.findIndex((msg) => msg.id === messageId);
      if (index !== -1 && flatListRef.current) {
        // Scroll to the message
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });

        // Highlight the message temporarily
        setHighlightedMessageId(messageId);
        setTimeout(() => {
          setHighlightedMessageId(null);
        }, 1500);
      }
    },
    [messages]
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const replyToMessage = item.replyTo ? messagesMap[item.replyTo] : undefined;
      return (
        <MessageBubble
          message={item}
          replyToMessage={replyToMessage}
          onReplyPress={handleReplyPress}
          isHighlighted={highlightedMessageId === item.id}
        />
      );
    },
    [messagesMap, handleReplyPress, highlightedMessageId]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number; averageItemLength: number }) => {
      // Fallback: scroll to approximate position
      flatListRef.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: true,
      });
    },
    []
  );

  return (
    <View style={styles.container}>
      <ChatHeader onEndChat={handleEndChat} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onScrollToIndexFailed={onScrollToIndexFailed}
        />

        <ChatInput />
      </KeyboardAvoidingView>

      <RatingOverlay visible={showRatingOverlay} onClose={handleCloseRating} />
    </View>
  );
};

export const ChatScreen: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider>
        <ChatContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  keyboardAvoid: {
    flex: 1,
  },
  messageList: {
    paddingVertical: 16,
  },
});
