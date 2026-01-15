import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  Layout,
} from 'react-native-reanimated';
import { useChatStore } from '../store/useChatStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ChatInput: React.FC = () => {
  const replyingTo = useChatStore((state) => state.replyingTo);
  const setReplyingTo = useChatStore((state) => state.setReplyingTo);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    if (text.trim()) {
      sendMessage(text.trim());
      setText('');
    }
  }, [text, sendMessage]);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, [setReplyingTo]);

  return (
    <Animated.View style={styles.container} layout={Layout.springify()}>
      {/* Reply Preview */}
      {replyingTo && (
        <Animated.View
          style={styles.replyPreview}
          entering={FadeInDown.springify()}
          exiting={FadeOutDown.springify()}>
          <View style={styles.replyContent}>
            <View style={styles.replyBar} />
            <View style={styles.replyTextContainer}>
              <Text style={styles.replyingToLabel}>Replying to</Text>
              <Text style={styles.replyText} numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
          </View>
          <Pressable onPress={handleCancelReply} style={styles.cancelButton}>
            <Text style={styles.cancelIcon}>✕</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <AnimatedPressable
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}>
          <Text style={styles.sendIcon}>➤</Text>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 20,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  replyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  replyBar: {
    width: 4,
    height: 36,
    backgroundColor: '#6B4EE6',
    borderRadius: 2,
    marginRight: 10,
  },
  replyTextContainer: {
    flex: 1,
  },
  replyingToLabel: {
    fontSize: 11,
    color: '#6B4EE6',
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 13,
    color: '#666',
  },
  cancelButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  cancelIcon: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6B4EE6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFF',
  },
});
