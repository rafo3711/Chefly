import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../src/theme/colors';
import { GoldButton } from '../src/components/GoldButton';
import { DarkCard } from '../src/components/DarkCard';

export default function ScanResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { recommendations, budget, currency } = params as {
    recommendations: string;
    budget: string;
    currency: string;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Selections</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Budget Info */}
        <View style={styles.budgetSection}>
          <Text style={styles.budgetLabel}>БЮДЖЕТ</Text>
          <Text style={styles.budgetValue}>{budget} {currency}</Text>
        </View>

        {/* AI Results Header */}
        <View style={styles.resultsHeader}>
          <View style={styles.resultsIcon}>
            <Ionicons name="sparkles" size={18} color={Colors.gold} />
          </View>
          <Text style={styles.resultsTitle}>AI Аналіз Результатів</Text>
        </View>

        {/* Recommendations */}
        <DarkCard style={styles.recommendationsCard}>
          <Text style={styles.recommendationsText}>
            {recommendations || 'Рекомендації не знайдено'}
          </Text>
        </DarkCard>

        {/* Action buttons */}
        <View style={styles.actions}>
          <GoldButton
            label="Нове сканування"
            icon="scan"
            onPress={() => router.replace('/(tabs)/scanner')}
          />
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Ionicons name="chatbubble-outline" size={18} color={Colors.gold} />
            <Text style={styles.chatButtonText}>Запитати сомельє</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Ціни орієнтовні. Завжди перевіряйте на касі.
        </Text>
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
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
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
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.goldTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  recommendationsCard: {
    marginBottom: 24,
  },
  recommendationsText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  actions: {
    marginBottom: 24,
  },
  chatButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 14,
    gap: 8,
  },
  chatButtonText: {
    fontSize: 14,
    color: Colors.gold,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 40,
  },
});
