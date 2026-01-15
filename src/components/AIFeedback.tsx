import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { Message, FeedbackType, DislikeFeedbackReason } from '../types';
import { useChatStore } from '../store/useChatStore';

interface AIFeedbackProps {
  message: Message;
}

const DISLIKE_REASONS: DislikeFeedbackReason[] = ['Inaccurate', 'Too Vague', 'Too Long'];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AIFeedback: React.FC<AIFeedbackProps> = ({ message }) => {
  const setFeedback = useChatStore((state) => state.setFeedback);
  const setDislikeReasons = useChatStore((state) => state.setDislikeReasons);
  const chipsExpanded = useSharedValue(message.feedbackType === 'disliked' ? 1 : 0);

  const handleFeedback = useCallback(
    (type: FeedbackType) => {
      if (message.feedbackType === type) {
        // Toggle off
        setFeedback(message.id, null);
        chipsExpanded.value = withSpring(0);
      } else {
        setFeedback(message.id, type);
        if (type === 'disliked') {
          chipsExpanded.value = withSpring(1, { damping: 12, stiffness: 100 });
        } else {
          chipsExpanded.value = withSpring(0);
        }
      }
    },
    [message.id, message.feedbackType, setFeedback, chipsExpanded]
  );

  const handleReasonToggle = useCallback(
    (reason: DislikeFeedbackReason) => {
      const currentReasons = message.dislikeReasons || [];
      if (currentReasons.includes(reason)) {
        setDislikeReasons(
          message.id,
          currentReasons.filter((r) => r !== reason)
        );
      } else {
        setDislikeReasons(message.id, [...currentReasons, reason]);
      }
    },
    [message.id, message.dislikeReasons, setDislikeReasons]
  );

  const animatedChipsContainerStyle = useAnimatedStyle(() => {
    const height = interpolate(chipsExpanded.value, [0, 1], [0, 44], Extrapolation.CLAMP);
    const opacity = interpolate(chipsExpanded.value, [0, 0.5, 1], [0, 0, 1], Extrapolation.CLAMP);
    const marginTop = interpolate(chipsExpanded.value, [0, 1], [0, 8], Extrapolation.CLAMP);

    return {
      height,
      opacity,
      marginTop,
      overflow: 'hidden',
    };
  });

  return (
    <Animated.View style={styles.container} layout={Layout.springify()}>
      <View style={styles.feedbackRow}>
        <AnimatedPressable
          style={[styles.feedbackButton, message.feedbackType === 'liked' && styles.feedbackActive]}
          onPress={() => handleFeedback('liked')}
          entering={FadeIn}
          exiting={FadeOut}>
          <Text style={styles.feedbackIcon}>👍</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={[
            styles.feedbackButton,
            message.feedbackType === 'disliked' && styles.feedbackActiveDislike,
          ]}
          onPress={() => handleFeedback('disliked')}
          entering={FadeIn}
          exiting={FadeOut}>
          <Text style={styles.feedbackIcon}>👎</Text>
        </AnimatedPressable>
      </View>

      <Animated.View style={[styles.chipsContainer, animatedChipsContainerStyle]}>
        {DISLIKE_REASONS.map((reason, index) => {
          const isSelected = message.dislikeReasons?.includes(reason);
          return (
            <AnimatedPressable
              key={reason}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => handleReasonToggle(reason)}
              entering={FadeIn.delay(index * 50).springify()}
              exiting={FadeOut}>
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{reason}</Text>
            </AnimatedPressable>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackActive: {
    backgroundColor: '#E8F5E9',
  },
  feedbackActiveDislike: {
    backgroundColor: '#FFEBEE',
  },
  feedbackIcon: {
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF5350',
  },
  chipText: {
    fontSize: 12,
    color: '#666',
  },
  chipTextSelected: {
    color: '#D32F2F',
    fontWeight: '600',
  },
});
