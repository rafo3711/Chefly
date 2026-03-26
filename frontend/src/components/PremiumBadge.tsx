import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

interface PremiumBadgeProps {
  text?: string;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  text = 'ПРЕМІУМ',
}) => {
  return (
    <View style={styles.badge}>
      <Ionicons name="star" size={14} color={Colors.black} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  text: {
    color: Colors.black,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});

export default PremiumBadge;
