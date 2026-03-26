import { StyleSheet, Platform } from 'react-native';
import Colors from './colors';

// Font families - using system fonts as fallback
const SERIF_FONT = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
});

const SANS_FONT = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const Typography = StyleSheet.create({
  // Display styles - Serif
  displayLarge: {
    fontFamily: SERIF_FONT,
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  displayMedium: {
    fontFamily: SERIF_FONT,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  displaySmall: {
    fontFamily: SERIF_FONT,
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 28,
  },

  // Body styles - Sans-serif
  bodyLarge: {
    fontFamily: SANS_FONT,
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: SANS_FONT,
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  bodySmall: {
    fontFamily: SANS_FONT,
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
    lineHeight: 17,
  },

  // Label styles
  labelLarge: {
    fontFamily: SANS_FONT,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: SANS_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 1.2,
  },
  goldLabel: {
    fontFamily: SANS_FONT,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gold,
    letterSpacing: 1.5,
  },

  // Price style
  priceLarge: {
    fontFamily: SERIF_FONT,
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gold,
    lineHeight: 36,
  },
});

export default Typography;
