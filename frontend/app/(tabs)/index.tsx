import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../src/theme/colors';
import { CheflyLogo } from '../../src/components/CheflyLogo';
import { PremiumBadge } from '../../src/components/PremiumBadge';
import { GoldButton, GoldOutlineButton } from '../../src/components/GoldButton';
import { DarkCard } from '../../src/components/DarkCard';
import { GoldIconBox } from '../../src/components/GoldIconBox';

const FEATURES = [
  {
    icon: 'camera-outline' as const,
    title: 'Фото пляшки',
    subtitle: 'Миттєве розпізнавання етикетки',
    route: '/scanner' as const,
  },
  {
    icon: 'layers-outline' as const,
    title: 'Розумне сканування полиці',
    subtitle: 'Знайдіть найкраще в ряду',
    route: '/scanner' as const,
  },
  {
    icon: 'chatbubble-outline' as const,
    title: 'Приватний сомельє',
    subtitle: 'Запитайте пораду експерта',
    route: '/chat' as const,
  },
  {
    icon: 'restaurant-outline' as const,
    title: 'Гурманські поєднання',
    subtitle: 'Ідеальна пара до страви',
    route: '/chat' as const,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLogo}>
            <View style={styles.miniLogo}>
              <Text style={styles.miniLogoText}>C</Text>
            </View>
            <Text style={styles.headerTitle}>CHEFLY</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <CheflyLogo size={90} glowing />
          <View style={styles.badgeContainer}>
            <PremiumBadge />
          </View>

          <Text style={styles.heroTitle}>
            Вдосконалюйте свій{' '}
            <Text style={styles.heroTitleGold}>Смак</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Ваш приватний AI сомельє та кулінарний помічник.
            Відчуйте унікальний гастрономічний досвід.
          </Text>
        </View>

        {/* Feature Tiles */}
        <View style={styles.featuresSection}>
          {FEATURES.map((feature, index) => (
            <DarkCard
              key={index}
              padding={14}
              onPress={() => router.push(feature.route)}
              style={styles.featureCard}
            >
              <View style={styles.featureContent}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={20} color={Colors.gold} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textMuted}
                />
              </View>
            </DarkCard>
          ))}
        </View>

        {/* Privacy Card */}
        <DarkCard goldBorder style={styles.privacyCard}>
          <View style={styles.privacyContent}>
            <GoldIconBox icon="shield-outline" size={40} />
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Приватний AI Консьєрж</Text>
              <Text style={styles.privacySubtitle}>
                Ваші дані конфіденційні. Ми не зберігаємо ваші фото на серверах.
              </Text>
            </View>
          </View>
        </DarkCard>

        {/* Premium Button */}
        <GoldOutlineButton
          label="Отримати преміум доступ"
          icon="diamond-outline"
          onPress={() => router.push('/premium')}
          style={styles.premiumButton}
        />

        {/* Footer */}
        <Text style={styles.footer}>
          CHEFLY • PREMIUM AI SOMMELIER
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniLogoText: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Georgia',
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  settingsButton: {
    padding: 8,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badgeContainer: {
    marginTop: 12,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  heroTitleGold: {
    color: Colors.gold,
    fontStyle: 'italic',
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
  },
  featuresSection: {
    marginBottom: 20,
  },
  featureCard: {
    marginBottom: 10,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.goldTransparent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldTransparent20,
  },
  featureText: {
    flex: 1,
    marginLeft: 14,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  featureSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  privacyCard: {
    marginBottom: 16,
  },
  privacyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyText: {
    flex: 1,
    marginLeft: 14,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold,
  },
  privacySubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 4,
  },
  premiumButton: {
    marginBottom: 24,
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 2,
    opacity: 0.5,
  },
});
