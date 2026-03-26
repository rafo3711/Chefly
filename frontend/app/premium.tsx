import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../src/theme/colors';
import { GoldButton } from '../src/components/GoldButton';
import { PremiumBadge } from '../src/components/PremiumBadge';

type PlanType = 'budget' | 'sommelier' | 'connoisseur';

const PLANS = [
  {
    id: 'budget' as PlanType,
    icon: 'flash',
    title: 'Розумний Бюджет',
    price: '199 грн',
    period: '/місяць',
    features: [
      'Порівняння цін',
      'Бюджетні альтернативи',
      'Обмежена кількість сканувань',
    ],
  },
  {
    id: 'sommelier' as PlanType,
    icon: 'sparkles',
    title: 'Приватний Сомельє',
    price: '499 грн',
    period: '/місяць',
    features: [
      'Безлімітне сканування',
      'Розширений підбір страв',
      'Пріоритетна підтримка',
    ],
    badge: 'НАЙПОПУЛЯРНІШИЙ',
    trialText: 'Спробувати 7 днів безкоштовно',
  },
  {
    id: 'connoisseur' as PlanType,
    icon: 'shield',
    title: 'Знавець',
    price: '3 999 грн',
    period: '/рік',
    features: [
      'Ексклюзивний доступ',
      'Ранній доступ до функцій',
      'Персоналізований погріб',
    ],
  },
];

export default function PremiumScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('sommelier');
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);
    // Simulate purchase - RevenueCat would be integrated here
    setTimeout(() => {
      setIsLoading(false);
      router.back();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ПРЕМІУМ ДОСТУП</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Badge */}
          <View style={styles.badgeContainer}>
            <PremiumBadge />
          </View>

          {/* Headline */}
          <Text style={styles.headline}>Приєднуйтесь{"\n"}до еліти</Text>
          <Text style={styles.subheadline}>
            Розкрийте безмежний потенціал AI та отримайте{"\n"}поради приватного сомельє.
          </Text>

          {/* Plan Cards */}
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardActive,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              {/* Plan Header */}
              <View style={styles.planHeader}>
                <View style={[
                  styles.planIcon,
                  selectedPlan === plan.id && styles.planIconActive,
                ]}>
                  <Ionicons
                    name={plan.icon as any}
                    size={20}
                    color={selectedPlan === plan.id ? Colors.black : Colors.textMuted}
                  />
                </View>
                <Text style={styles.planTitle}>{plan.title}</Text>
                {plan.badge && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}
              </View>

              {/* Price */}
              <View style={styles.priceRow}>
                <Text style={styles.price}>{plan.price}</Text>
                <Text style={styles.period}>{plan.period}</Text>
              </View>

              {/* Features */}
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color={selectedPlan === plan.id ? Colors.gold : Colors.textMuted}
                  />
                  <Text style={[
                    styles.featureText,
                    selectedPlan === plan.id && styles.featureTextActive,
                  ]}>
                    {feature}
                  </Text>
                </View>
              ))}

              {/* Trial Button */}
              {plan.trialText && selectedPlan === plan.id && (
                <View style={styles.trialButton}>
                  <Text style={styles.trialButtonText}>{plan.trialText}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* CTA Button */}
          <GoldButton
            label="Почати преміум доступ"
            icon="diamond"
            onPress={handlePurchase}
            loading={isLoading}
            style={styles.ctaButton}
          />

          {/* Restore */}
          <TouchableOpacity style={styles.restoreButton}>
            <Text style={styles.restoreText}>Відновити покупки</Text>
          </TouchableOpacity>

          {/* Trial notice */}
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              Підписка поновлюється автоматично, якщо її не скасувати за 24 години до кінця пробного 7-денного безкоштовного тріалу.
            </Text>
          </View>

          {/* Links */}
          <View style={styles.linksRow}>
            <TouchableOpacity>
              <Text style={styles.linkText}>Умови використання</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.linkText}>Політика конфіденційності</Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  content: {
    padding: 20,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.gold,
    textAlign: 'center',
    fontFamily: 'Georgia',
    lineHeight: 40,
  },
  subheadline: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 28,
  },
  planCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planCardActive: {
    backgroundColor: Colors.goldTransparent,
    borderColor: Colors.goldTransparent40,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planIconActive: {
    backgroundColor: Colors.gold,
  },
  planTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'Georgia',
  },
  planBadge: {
    backgroundColor: Colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.black,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.gold,
    fontFamily: 'Georgia',
  },
  period: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  featureTextActive: {
    color: Colors.textPrimary,
  },
  trialButton: {
    marginTop: 12,
    backgroundColor: Colors.gold,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  trialButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.black,
  },
  ctaButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  noticeBox: {
    marginTop: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  noticeText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    marginBottom: 40,
  },
  linkText: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
