import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../src/theme/colors';
import { CheflyLogo } from '../src/components/CheflyLogo';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [loadingText, setLoadingText] = useState('Initializing your private cellar...');

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Update loading text
    const textTimer = setTimeout(() => {
      setLoadingText('Preparing sommelier experience...');
    }, 1500);

    // Navigate after delay
    const navTimer = setTimeout(async () => {
      const isOnboarded = await AsyncStorage.getItem('isOnboarded');
      if (isOnboarded === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 3000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(navTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <View style={styles.glowBackground} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <CheflyLogo size={110} glowing animated />
      </Animated.View>

      {/* Text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.appName}>CHEFLY</Text>
        <Text style={styles.tagline}>YOUR PREMIUM AI CONCIERGE</Text>
      </Animated.View>

      {/* Loading text */}
      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <Text style={styles.loadingText}>{loadingText}</Text>
      </Animated.View>

      {/* Bottom line */}
      <Animated.View style={[styles.bottomLine, { opacity: fadeAnim }]} />

      {/* Version */}
      <Text style={styles.version}>EST. 2025 • VERSION 1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBackground: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: Colors.gold,
    opacity: 0.05,
  },
  logoContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.gold,
    letterSpacing: 10,
    fontFamily: 'Georgia',
  },
  tagline: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.goldTransparent40,
    letterSpacing: 3,
    marginTop: 10,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  bottomLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.goldTransparent40,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
});
