import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Colors from '../theme/colors';

interface DarkCardProps {
  children: React.ReactNode;
  goldBorder?: boolean;
  highlighted?: boolean;
  padding?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const DarkCard: React.FC<DarkCardProps> = ({
  children,
  goldBorder = false,
  highlighted = false,
  padding = 18,
  onPress,
  style,
}) => {
  const cardStyle = [
    styles.card,
    { padding },
    goldBorder && styles.goldBorder,
    highlighted && styles.highlighted,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goldBorder: {
    borderColor: Colors.goldTransparent40,
    borderWidth: 1.5,
  },
  highlighted: {
    backgroundColor: Colors.goldTransparent,
    borderColor: Colors.goldTransparent40,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
});

export default DarkCard;
