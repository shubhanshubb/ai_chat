import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  runOnJS,
} from 'react-native-reanimated';

interface RatingOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');
const STARS = [1, 2, 3, 4, 5];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const RatingOverlay: React.FC<RatingOverlayProps> = ({ visible, onClose }) => {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleStarPress = useCallback((star: number) => {
    setRating(star);
  }, []);

  const handleSubmit = useCallback(() => {
    if (rating > 0) {
      setSubmitted(true);
      Alert.alert(
        'Thank You!',
        `Your ${rating}-star rating has been recorded. We appreciate your feedback!`,
        [
          {
            text: 'OK',
            onPress: () => {
              onClose();
              setRating(0);
              setSubmitted(false);
            },
          },
        ]
      );
    }
  }, [rating, onClose]);

  if (!visible) return null;

  return (
    <Animated.View
      style={styles.overlay}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}>
      {/* Blur background simulation */}
      <View style={styles.blurBackground} />

      <Animated.View
        style={styles.content}
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown}>
        {/* Moon decoration */}
        <Text style={styles.moonIcon}>🌙</Text>

        <Text style={styles.title}>Session Complete</Text>
        <Text style={styles.subtitle}>
          Thank you for consulting with Astrologer Vikram. How was your experience?
        </Text>

        {/* Star Rating */}
        <View style={styles.starsContainer}>
          {STARS.map((star) => (
            <AnimatedPressable
              key={star}
              style={styles.starButton}
              onPress={() => handleStarPress(star)}>
              <Animated.Text
                style={[styles.star, rating >= star && styles.starActive]}
                entering={FadeIn.delay(star * 50)}>
                {rating >= star ? '★' : '☆'}
              </Animated.Text>
            </AnimatedPressable>
          ))}
        </View>

        {rating > 0 && (
          <Animated.Text style={styles.ratingText} entering={FadeIn} exiting={FadeOut}>
            {rating === 5
              ? 'Excellent!'
              : rating === 4
                ? 'Great!'
                : rating === 3
                  ? 'Good'
                  : rating === 2
                    ? 'Fair'
                    : 'Poor'}
          </Animated.Text>
        )}

        {/* Submit Button */}
        <AnimatedPressable
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0}
          entering={FadeIn.delay(300)}>
          <Text style={[styles.submitButtonText, rating === 0 && styles.submitButtonTextDisabled]}>
            Submit Rating
          </Text>
        </AnimatedPressable>

        {/* Skip Button */}
        <Pressable style={styles.skipButton} onPress={onClose}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    width: width * 0.85,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  moonIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
    color: '#DDD',
  },
  starActive: {
    color: '#FFD700',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B4EE6',
    marginBottom: 20,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#6B4EE6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
  skipButton: {
    padding: 8,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#999',
  },
});
