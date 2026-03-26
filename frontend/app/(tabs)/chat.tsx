import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../src/theme/colors';
import { DarkCard } from '../../src/components/DarkCard';
import * as api from '../../src/services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { label: 'Підбери до стейку', icon: 'restaurant' as const },
  { label: 'Вино до 500₴', icon: 'cash' as const },
  { label: 'Що до сиру?', icon: 'nutrition' as const },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([{
      id: '1',
      role: 'assistant',
      text: 'Добрий вечір! Я — ваш приватний сомельє. Чим можу допомогти сьогодні?\n\nЗапитайте мене про:\n• Підбір вина до страви\n• Рекомендації в межах бюджету\n• Страви до вашого напою',
      timestamp: new Date(),
    }]);
  }, []);

  const sendMessage = async (text: string, imageBase64?: string) => {
    if (!text.trim() && !imageBase64) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim() || 'Проаналізуй це фото',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not found');
      }

      const response = await api.sendChatMessage(
        userId,
        text.trim() || 'Проаналізуй це фото і дай рекомендації як сомельє',
        sessionId || undefined,
        imageBase64
      );

      if (!sessionId) {
        setSessionId(response.session_id);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Помилка', 'Не вдалося отримати відповідь');
    } finally {
      setIsLoading(false);
    }
  };

  const pickAndSendImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        await sendMessage(inputText, result.assets[0].base64);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>C</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>CHEFLY</Text>
            <Text style={styles.headerSubtitle}>AI Сомельє Онлайн</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color={Colors.gold} />
            <Text style={styles.loadingText}>Сомельє думає...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <View style={styles.quickPrompts}>
          {QUICK_PROMPTS.map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickPromptButton}
              onPress={() => sendMessage(prompt.label)}
            >
              <Ionicons name={prompt.icon} size={14} color={Colors.gold} />
              <Text style={styles.quickPromptText}>{prompt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={pickAndSendImage}
          >
            <Ionicons name="camera-outline" size={22} color={Colors.gold} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Запитайте сомельє..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (inputText.trim() || isLoading) && styles.sendButtonActive,
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() ? Colors.black : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Georgia',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.gold,
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.gold,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    padding: 14,
    borderRadius: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  quickPrompts: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  quickPromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.goldTransparent40,
    gap: 6,
  },
  quickPromptText: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.gold,
  },
});
