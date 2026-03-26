import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../src/theme/colors';
import { GoldButton, GoldOutlineButton } from '../../src/components/GoldButton';
import { DarkCard } from '../../src/components/DarkCard';
import * as api from '../../src/services/api';

const SCAN_TIPS = [
  'Тримайте камеру нерухомо',
  'Забезпечте хороше освітлення',
  'Уникайте відблисків',
  'Тримайте етикетку в центрі',
];

export default function ScannerScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [budget, setBudget] = useState(500);
  const [currency, setCurrency] = useState('UAH');

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const user = await api.getUser(userId);
        setBudget(user.budget_limit || 500);
        setCurrency(user.preferred_currency || 'UAH');
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Помилка', 'Потрібен дозвіл на доступ');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            base64: true,
          });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].base64 || null);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Помилка', 'Не вдалося вибрати фото');
    }
  };

  const analyzeShelf = async () => {
    if (!image) return;

    try {
      setIsAnalyzing(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        Alert.alert('Помилка', 'Користувача не знайдено');
        return;
      }

      const result = await api.scanShelf(
        userId,
        image,
        budget,
        currency,
        'UK'
      );

      // Navigate to results
      router.push({
        pathname: '/scan-result',
        params: {
          recommendations: result.recommendations,
          budget: budget.toString(),
          currency: currency,
        },
      });
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Помилка', 'Не вдалося проаналізувати фото. Спробуйте ще раз.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Сканування полиці</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budget display */}
        <View style={styles.budgetSection}>
          <Text style={styles.budgetLabel}>БЮДЖЕТ</Text>
          <Text style={styles.budgetValue}>
            {budget} {currency}
          </Text>
        </View>

        {/* Image preview area */}
        <View style={styles.previewContainer}>
          {image ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${image}` }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons
                name="image-outline"
                size={60}
                color={Colors.goldTransparent40}
              />
              <Text style={styles.placeholderText}>
                Торкніться, щоб обрати фото
              </Text>
            </View>
          )}

          {/* Corner brackets */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        {/* Action buttons */}
        {!image ? (
          <View style={styles.actionButtons}>
            <GoldOutlineButton
              label="Галерея"
              icon="images-outline"
              onPress={() => pickImage(false)}
              style={styles.actionButton}
            />
            <GoldOutlineButton
              label="Камера"
              icon="camera-outline"
              onPress={() => pickImage(true)}
              style={styles.actionButton}
            />
          </View>
        ) : (
          <View style={styles.analyzeButtons}>
            <GoldButton
              label={isAnalyzing ? 'Аналіз...' : 'Проаналізувати'}
              icon="sparkles"
              onPress={analyzeShelf}
              loading={isAnalyzing}
            />
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setImage(null)}
            >
              <Text style={styles.resetText}>Скинути</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips */}
        <DarkCard style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.gold} />
            <Text style={styles.tipsTitle}>ПРОТОКОЛ СКАНУВАННЯ</Text>
          </View>
          {SCAN_TIPS.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </DarkCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Georgia',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  budgetSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
  },
  budgetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  budgetValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gold,
  },
  previewContainer: {
    aspectRatio: 3 / 4,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: Colors.gold,
  },
  topLeft: {
    top: 20,
    left: 20,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  topRight: {
    top: 20,
    right: 20,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
  },
  analyzeButtons: {
    marginBottom: 20,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resetText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  tipsCard: {
    marginBottom: 20,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    marginLeft: 8,
    fontSize: 10,
    fontWeight: '600',
    color: Colors.gold,
    letterSpacing: 1.5,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
    marginRight: 10,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
