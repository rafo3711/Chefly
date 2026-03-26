import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '../theme/colors';

interface CheflyLogoProps {
  size?: number;
  glowing?: boolean;
  animated?: boolean;
}

export const CheflyLogo: React.FC<CheflyLogoProps> = ({
  size = 90,
  glowing = false,
  animated = false,
}) => {
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (animated) {
      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [animated]);

  const fontSize = size * 0.45;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ scale: animated ? scaleAnim : 1 }],
        },
        glowing && styles.glowing,
      ]}
    >
      <Text style={[styles.letter, { fontSize }]}>C</Text>
      {glowing && (
        <Animated.View
          style={[
            styles.glowOverlay,
            {
              width: size + 40,
              height: size + 40,
              borderRadius: (size + 40) / 2,
              opacity: animated ? glowAnim : 0.5,
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  letter: {
    color: Colors.black,
    fontWeight: '900',
    fontFamily: 'Georgia',
  },
  glowing: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  glowOverlay: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.goldTransparent40,
  },
});

export default CheflyLogo;
