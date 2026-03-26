import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

interface GoldButtonProps {
  label: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  width,
  height = 56,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        { height, width: width || '100%' },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.black} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={Colors.black}
              style={styles.icon}
            />
          )}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const GoldOutlineButton: React.FC<GoldButtonProps> = ({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  width,
  height = 52,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      style={[
        styles.outlineButton,
        { height, width: width || '100%' },
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={Colors.gold} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={Colors.gold}
              style={styles.icon}
            />
          )}
          <Text style={styles.outlineLabel}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.gold,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.goldTransparent40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
    letterSpacing: 0.5,
  },
  outlineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold,
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default GoldButton;
