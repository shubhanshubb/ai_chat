import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

interface ReactionBarProps {
  animatedStyle: AnimatedStyle;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  isUserMessage: boolean;
}

const EMOJIS = ['🙏', '✨', '🌙', '❤️', '👍', '😊'];

export const ReactionBar: React.FC<ReactionBarProps> = ({
  animatedStyle,
  onSelect,
  onClose,
  isUserMessage,
}) => {
  return (
    <Animated.View
      style={[
        styles.container,
        isUserMessage ? styles.containerRight : styles.containerLeft,
        animatedStyle,
      ]}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.bar}>
        {EMOJIS.map((emoji) => (
          <Pressable
            key={emoji}
            style={({ pressed }) => [styles.emojiButton, pressed && styles.emojiButtonPressed]}
            onPress={() => onSelect(emoji)}>
            <Text style={styles.emoji}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -50,
    zIndex: 100,
  },
  containerLeft: {
    left: 0,
  },
  containerRight: {
    right: 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  emojiButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  emojiButtonPressed: {
    backgroundColor: '#F0F0F0',
    transform: [{ scale: 1.2 }],
  },
  emoji: {
    fontSize: 24,
  },
});
