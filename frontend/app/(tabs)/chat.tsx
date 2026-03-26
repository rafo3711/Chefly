import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../src/theme/colors';
import { DarkCard } from '../../src/components/DarkCard';
import * as api from '../../src/services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isVoice?: boolean;
}

const QUICK_PROMPTS = [
  { label: 'Підбери до стейку', icon: 'restaurant' as const },
  { label: 'Вино до 500₴', icon: 'cash' as const },
  { label: 'Що до сиру?', icon: 'nutrition' as const },
];

// Web Speech Recognition hook
const useWebSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'uk-UA'; // Default to Ukrainian, will auto-detect
        
        // Enable multiple languages
        recognition.lang = 'uk-UA';
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            }
          }
          if (finalTranscript) {
            setTranscript(finalTranscript);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = useCallback((language: string = 'uk-UA') => {
    if (recognitionRef.current && isSupported) {
      setTranscript('');
      // Map language codes
      const langMap: Record<string, string> = {
        'UK': 'uk-UA',
        'EN': 'en-US', 
        'RU': 'ru-RU',
      };
      recognitionRef.current.lang = langMap[language] || language;
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript: () => setTranscript(''),
  };
};

// Voice button with pulse animation
const VoiceButton = ({ 
  isRecording, 
  isProcessing,
  onPress,
  disabled 
}: { 
  isRecording: boolean;
  isProcessing: boolean;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Pulse animation for recording
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1.4,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else if (isProcessing) {
      // Rotation animation for processing
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [isRecording, isProcessing]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.voiceButtonContainer}>
      {/* Outer pulse ring */}
      {isRecording && (
        <>
          <Animated.View
            style={[
              styles.pulseRing,
              styles.pulseRingOuter,
              {
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              styles.pulseRingInner,
              {
                transform: [{ scale: Animated.multiply(pulseAnim, 0.7) }],
                opacity: Animated.multiply(opacityAnim, 1.5),
              },
            ]}
          />
        </>
      )}
      
      <TouchableOpacity
        style={[
          styles.voiceButton,
          isRecording && styles.voiceButtonRecording,
          isProcessing && styles.voiceButtonProcessing,
        ]}
        onPress={onPress}
        disabled={disabled || isProcessing}
        activeOpacity={0.7}
      >
        {isProcessing ? (
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="sync" size={24} color={Colors.gold} />
          </Animated.View>
        ) : (
          <Ionicons
            name={isRecording ? 'mic' : 'mic-outline'}
            size={24}
            color={isRecording ? Colors.black : Colors.gold}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userLanguage, setUserLanguage] = useState('UK');
  const scrollViewRef = useRef<ScrollView>(null);

  // Web Speech Recognition
  const {
    isListening,
    transcript,
    isSupported: webSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useWebSpeechRecognition();

  useEffect(() => {
    // Initial greeting
    setMessages([{
      id: '1',
      role: 'assistant',
      text: 'Добрий вечір! Я — ваш приватний сомельє.\n\n🎤 Натисніть на мікрофон і скажіть ваш запит — я відповім голосом!\n\nАбо напишіть текстом.',
      timestamp: new Date(),
    }]);

    loadUserPreferences();
    requestPermissions();
  }, []);

  // Process transcript when speech recognition completes
  useEffect(() => {
    if (transcript && !isListening && !isProcessingVoice) {
      processVoiceInput(transcript);
      resetTranscript();
    }
  }, [transcript, isListening]);

  const loadUserPreferences = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const user = await api.getUser(userId);
        setUserLanguage(user.preferred_language || 'UK');
      }
    } catch (error) {
      console.log('Error loading preferences:', error);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Audio permission not granted');
        }
      } catch (error) {
        console.error('Error requesting audio permission:', error);
      }
    }
  };

  // Main voice button handler
  const handleVoiceButtonPress = async () => {
    if (isRecording || isListening) {
      // Stop recording
      if (Platform.OS === 'web' && webSpeechSupported) {
        stopListening();
      } else {
        await stopNativeRecording();
      }
    } else {
      // Start recording
      if (Platform.OS === 'web' && webSpeechSupported) {
        startListening(userLanguage);
        setIsRecording(true);
      } else {
        await startNativeRecording();
      }
    }
  };

  const startNativeRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Помилка', 'Не вдалося почати запис');
    }
  };

  const stopNativeRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // Convert to base64 and send to backend
        setIsProcessingVoice(true);
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        await processAudioWithBackend(base64);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setRecording(null);
      setIsProcessingVoice(false);
    }
  };

  // Process voice input (from Web Speech API)
  const processVoiceInput = async (userText: string) => {
    if (!userText.trim()) return;
    
    setIsRecording(false);
    setIsProcessingVoice(true);

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
      isVoice: true,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not found');
      }

      // Send to AI with sommelier prompt
      const response = await api.sendChatMessage(
        userId,
        userText,
        sessionId || undefined
      );

      if (!sessionId) {
        setSessionId(response.session_id);
      }

      const aiResponseText = response.response;

      // Add AI response to chat
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // AUTO-SPEAK the response immediately
      await speakResponse(aiResponseText);

    } catch (error) {
      console.error('Voice processing error:', error);
      Alert.alert('Помилка', 'Не вдалося обробити запит');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Process audio with backend (for native mobile)
  const processAudioWithBackend = async (audioBase64: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      // Add placeholder message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: '🎤 Обробка голосу...',
        timestamp: new Date(),
        isVoice: true,
      };
      setMessages(prev => [...prev, userMessage]);

      // Send to voice chat endpoint
      const response = await api.sendVoiceChat(userId, audioBase64, sessionId || undefined);

      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
      }

      // Update user message with transcribed text
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, text: response.user_text || '🎤 Голосовий запит' }
          : msg
      ));

      // Add AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // AUTO-SPEAK immediately
      await speakResponse(response.response);

    } catch (error) {
      console.error('Backend voice error:', error);
      // Fallback: use text prompt
      await processVoiceInput('Порекомендуй вино');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Text-to-Speech with auto language detection
  const speakResponse = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      // Stop any current speech
      Speech.stop();

      // Detect language
      const hasUkrainian = /[іїєґ]/i.test(text);
      const hasRussian = /[ыэъ]/i.test(text) || /\b(что|как|это|для|или)\b/i.test(text);
      const isEnglish = /^[a-zA-Z\s.,!?'"()-]+$/.test(text.substring(0, 100));

      let language = 'uk-UA';
      if (isEnglish) language = 'en-US';
      else if (hasRussian && !hasUkrainian) language = 'ru-RU';

      // Clean text for natural speech
      const cleanText = text
        .replace(/[🍷🌡🍽⭐✨💫🎤🔊]/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ', ')
        .replace(/•/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 800);

      setIsSpeaking(true);

      Speech.speak(cleanText, {
        language,
        pitch: 1.0,
        rate: Platform.OS === 'ios' ? 0.9 : 0.85,
        onDone: () => {
          setIsSpeaking(false);
          resolve();
        },
        onError: () => {
          setIsSpeaking(false);
          resolve();
        },
        onStopped: () => {
          setIsSpeaking(false);
          resolve();
        },
      });
    });
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

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
      if (!userId) throw new Error('User not found');

      const response = await api.sendChatMessage(
        userId,
        text.trim() || 'Проаналізуй це фото і дай рекомендації',
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

  const isVoiceActive = isRecording || isListening;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[
            styles.avatarContainer,
            isSpeaking && styles.avatarSpeaking
          ]}>
            <Text style={styles.avatarText}>C</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>CHEFLY</Text>
            <View style={styles.statusRow}>
              <View style={[
                styles.statusDot,
                isVoiceActive && styles.statusDotRecording,
                isSpeaking && styles.statusDotSpeaking,
                isProcessingVoice && styles.statusDotProcessing,
              ]} />
              <Text style={styles.headerSubtitle}>
                {isVoiceActive ? 'Слухаю...' : 
                 isProcessingVoice ? 'Обробляю...' :
                 isSpeaking ? 'Говорю...' : 
                 'AI Сомельє'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          {isSpeaking && (
            <TouchableOpacity 
              style={styles.stopButton}
              onPress={stopSpeaking}
            >
              <Ionicons name="stop" size={16} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Recording indicator banner */}
      {isVoiceActive && (
        <Animated.View style={styles.recordingBanner}>
          <View style={styles.recordingDotAnimated} />
          <Text style={styles.recordingBannerText}>
            🎤 Говоріть зараз... Натисніть мікрофон щоб завершити
          </Text>
        </Animated.View>
      )}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((message) => (
          <View key={message.id}>
            <View
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                message.isVoice && styles.voiceMessageBubble,
              ]}
            >
              {message.isVoice && (
                <Ionicons 
                  name="mic" 
                  size={14} 
                  color={message.role === 'user' ? Colors.goldDark : Colors.gold} 
                  style={styles.voiceIcon}
                />
              )}
              <Text style={[
                styles.messageText,
                message.role === 'user' && styles.userMessageText
              ]}>
                {message.text}
              </Text>
            </View>
            {/* Re-speak button for AI messages */}
            {message.role === 'assistant' && (
              <TouchableOpacity
                style={styles.speakButton}
                onPress={() => speakResponse(message.text)}
                disabled={isSpeaking}
              >
                <Ionicons 
                  name={isSpeaking ? "volume-high" : "volume-medium-outline"} 
                  size={16} 
                  color={Colors.textMuted} 
                />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {(isLoading || isProcessingVoice) && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color={Colors.gold} />
            <Text style={styles.loadingText}>
              {isProcessingVoice ? 'Готую відповідь...' : 'Сомельє думає...'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Quick prompts */}
      {messages.length <= 1 && !isVoiceActive && (
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

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={pickAndSendImage}
            disabled={isVoiceActive || isProcessingVoice}
          >
            <Ionicons name="camera-outline" size={22} color={Colors.gold} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder={isVoiceActive ? "Слухаю вас..." : "Або напишіть тут..."}
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isVoiceActive && !isProcessingVoice}
          />
          
          {/* Voice Button - Main interaction */}
          <VoiceButton
            isRecording={isVoiceActive}
            isProcessing={isProcessingVoice}
            onPress={handleVoiceButtonPress}
            disabled={isLoading}
          />
          
          {/* Send text button */}
          {inputText.trim() && !isVoiceActive && (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => sendMessage(inputText)}
              disabled={isLoading || isProcessingVoice}
            >
              <Ionicons name="send" size={18} color={Colors.black} />
            </TouchableOpacity>
          )}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarSpeaking: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  statusDotRecording: {
    backgroundColor: Colors.error,
  },
  statusDotSpeaking: {
    backgroundColor: Colors.gold,
  },
  statusDotProcessing: {
    backgroundColor: Colors.warning,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.gold,
    fontWeight: '500',
  },
  stopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.goldTransparent,
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldTransparent40,
  },
  recordingDotAnimated: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    marginRight: 10,
  },
  recordingBannerText: {
    fontSize: 13,
    color: Colors.gold,
    fontWeight: '600',
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
    borderRadius: 18,
    marginBottom: 8,
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
  voiceMessageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  voiceIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
    flex: 1,
  },
  userMessageText: {
    color: Colors.black,
  },
  speakButton: {
    alignSelf: 'flex-start',
    padding: 6,
    marginBottom: 8,
    marginLeft: 8,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    padding: 14,
    borderRadius: 18,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.gold,
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
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
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
    maxHeight: 100,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  voiceButtonContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 56,
    height: 56,
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: Colors.gold,
  },
  pulseRingOuter: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  pulseRingInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.goldTransparent40,
  },
  voiceButtonRecording: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  voiceButtonProcessing: {
    borderColor: Colors.gold,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
