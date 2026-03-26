import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../src/theme/colors';
import { DarkCard } from '../../src/components/DarkCard';
import { GoldButton } from '../../src/components/GoldButton';
import * as api from '../../src/services/api';

const LANGUAGES = [
  { code: 'UK', name: 'Українська' },
  { code: 'EN', name: 'English' },
  { code: 'RU', name: 'Русский' },
];

const CURRENCIES = [
  { code: 'UAH', symbol: '₴' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState('UK');
  const [currency, setCurrency] = useState('UAH');
  const [budget, setBudget] = useState(500);
  const [notifications, setNotifications] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
      
      if (id) {
        const user = await api.getUser(id);
        setLanguage(user.preferred_language || 'UK');
        setCurrency(user.preferred_currency || 'UAH');
        setBudget(user.budget_limit || 500);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveSettings = async () => {
    try {
      if (userId) {
        await api.updateUser(userId, {
          preferred_language: language,
          preferred_currency: currency,
          budget_limit: budget,
        });
        Alert.alert('Збережено', 'Налаштування збережено');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Помилка', 'Не вдалося зберегти');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Вихід',
      'Ви впевнені, що хочете вийти?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('isOnboarded');
            await AsyncStorage.removeItem('userId');
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Профіль</Text>
        </View>

        {/* User Card */}
        <View style={styles.content}>
          <DarkCard style={styles.userCard}>
            <View style={styles.userContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>C</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>CHEFLY Користувач</Text>
                <Text style={styles.userStatus}>ЧЛЕН КЛУБУ</Text>
              </View>
            </View>
          </DarkCard>

          {/* Premium Card */}
          <DarkCard
            goldBorder
            highlighted
            onPress={() => router.push('/premium')}
            style={styles.premiumCard}
          >
            <View style={styles.premiumContent}>
              <Ionicons name="diamond" size={20} color={Colors.gold} />
              <View style={styles.premiumText}>
                <Text style={styles.premiumTitle}>Приватний Сомельє</Text>
                <Text style={styles.premiumSubtitle}>АКТИВНИЙ ПЛАН</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
            </View>
          </DarkCard>

          {/* Language Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>МОВА</Text>
            <DarkCard padding={4}>
              {LANGUAGES.map((lang, index) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.optionItem,
                    language === lang.code && styles.optionItemActive,
                    index < LANGUAGES.length - 1 && styles.optionItemBorder,
                  ]}
                  onPress={() => setLanguage(lang.code)}
                >
                  <Text style={[
                    styles.optionText,
                    language === lang.code && styles.optionTextActive,
                  ]}>
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <Ionicons name="checkmark" size={18} color={Colors.gold} />
                  )}
                </TouchableOpacity>
              ))}
            </DarkCard>
          </View>

          {/* Currency Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ВАЛЮТА</Text>
            <View style={styles.currencyGrid}>
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.currencyItem,
                    currency === curr.code && styles.currencyItemActive,
                  ]}
                  onPress={() => setCurrency(curr.code)}
                >
                  <Text style={[
                    styles.currencySymbol,
                    currency === curr.code && styles.currencySymbolActive,
                  ]}>
                    {curr.symbol}
                  </Text>
                  <Text style={[
                    styles.currencyCode,
                    currency === curr.code && styles.currencyCodeActive,
                  ]}>
                    {curr.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Budget Section */}
          <View style={styles.section}>
            <View style={styles.budgetHeader}>
              <Text style={styles.sectionTitle}>БЮДЖЕТ</Text>
              <Text style={styles.budgetValue}>
                {budget} {CURRENCIES.find(c => c.code === currency)?.symbol}
              </Text>
            </View>
            <View style={styles.budgetOptions}>
              {[100, 300, 500, 1000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.budgetButton,
                    budget === val && styles.budgetButtonActive,
                  ]}
                  onPress={() => setBudget(val)}
                >
                  <Text style={[
                    styles.budgetButtonText,
                    budget === val && styles.budgetButtonTextActive,
                  ]}>
                    {val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>НАЛАШТУВАННЯ</Text>
            <DarkCard padding={16}>
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleTitle}>Сповіщення</Text>
                  <Text style={styles.toggleSubtitle}>Отримувати поради сомельє</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: Colors.border, true: Colors.goldTransparent40 }}
                  thumbColor={notifications ? Colors.gold : Colors.textMuted}
                />
              </View>
            </DarkCard>
          </View>

          {/* Save Button */}
          <GoldButton
            label="Зберегти"
            icon="save-outline"
            onPress={saveSettings}
            style={styles.saveButton}
          />

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.error} />
            <Text style={styles.logoutText}>Вийти</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Georgia',
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    marginBottom: 12,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.black,
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'Georgia',
  },
  userInfo: {
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  userStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gold,
    letterSpacing: 1,
    marginTop: 2,
  },
  premiumCard: {
    marginBottom: 20,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumText: {
    flex: 1,
    marginLeft: 12,
  },
  premiumTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  premiumSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.gold,
    letterSpacing: 1,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gold,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  optionItemActive: {
    backgroundColor: Colors.goldTransparent,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  currencyGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  currencyItem: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currencyItemActive: {
    backgroundColor: Colors.goldTransparent,
    borderColor: Colors.gold,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  currencySymbolActive: {
    color: Colors.gold,
  },
  currencyCode: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  currencyCodeActive: {
    color: Colors.textPrimary,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gold,
  },
  budgetOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  budgetButton: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  budgetButtonActive: {
    backgroundColor: Colors.goldTransparent,
    borderColor: Colors.gold,
  },
  budgetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  budgetButtonTextActive: {
    color: Colors.gold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  saveButton: {
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    color: Colors.error,
  },
});
