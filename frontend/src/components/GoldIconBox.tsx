import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

interface GoldIconBoxProps {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
}

export const GoldIconBox: React.FC<GoldIconBoxProps> = ({
  icon,
  size = 44,
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Ionicons name={icon} size={size * 0.5} color={Colors.black} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
});

export default GoldIconBox;
