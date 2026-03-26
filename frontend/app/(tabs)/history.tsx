import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import Colors from '../../src/theme/colors';
import { DarkCard } from '../../src/components/DarkCard';
import * as api from '../../src/services/api';

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const data = await api.getChatSessions(userId);
        setSessions(data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Сьогодні';
      if (diffDays === 1) return 'Вчора';
      if (diffDays < 7) return `${diffDays} днів тому`;
      return format(date, 'dd.MM.yyyy');
    } catch {
      return '';
    }
  };

  const getSessionIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('вин') || lower.includes('wine')) return 'wine';
    if (lower.includes('віск') || lower.includes('whisky')) return 'flask';
    if (lower.includes('стейк') || lower.includes('steak')) return 'restaurant';
    if (lower.includes('сир') || lower.includes('cheese')) return 'pizza';
    return 'chatbubble-ellipses';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Консультації</Text>
        <Text style={styles.headerSubtitle}>Ваші попередні AI сеанси</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Пошук консультацій...</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={60} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Історія порожня</Text>
          <Text style={styles.emptySubtitle}>
            Ваші консультації з сомельє з'являться тут
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/chat')}
          >
            <Text style={styles.startButtonText}>Почати розмову</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.sessionsList}
          showsVerticalScrollIndicator={false}
        >
          {sessions.map((session) => (
            <DarkCard
              key={session.id}
              padding={16}
              onPress={() => router.push(`/chat?session=${session.id}`)}
              style={styles.sessionCard}
            >
              <View style={styles.sessionContent}>
                <View style={styles.sessionIcon}>
                  <Ionicons
                    name={getSessionIcon(session.title) as any}
                    size={20}
                    color={Colors.gold}
                  />
                </View>
                <View style={styles.sessionText}>
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {session.title}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {session.message_count} повідомлень • {formatDate(session.updated_at)}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              </View>
            </DarkCard>
          ))}
        </ScrollView>
      )}
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'Georgia',
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  startButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.goldTransparent,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gold,
  },
  sessionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sessionCard: {
    marginBottom: 10,
  },
  sessionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.goldTransparent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionText: {
    flex: 1,
    marginLeft: 12,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sessionMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
