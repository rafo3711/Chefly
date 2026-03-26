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
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../src/theme/colors';
import * as api from '../../src/services/api';

// ============================================
// 🎭 AI ORCHESTRATOR - Voice-to-Voice System
// ============================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isVoice?: boolean;
}

// ============================================
// 🔊 NATURAL TTS CONFIGURATION
// ============================================
const TTS_CONFIG = {
  // Voice settings for natural, friendly tone (like Alisa)
  pitch: 1.1,           // Slightly higher - more emotional
  rate: 1.08,           // Slightly faster - more natural
  pauseBeforeMs: 350,   // "Taking breath" pause before speaking
  
  // Language-specific rates (some languages need adjustment)
  languageRates: {
    'uk-UA': 1.05,      // Ukrainian sounds better slightly slower
    'ru-RU': 1.08,      // Russian natural pace
    'en-US': 1.1,       // English slightly faster
    'en-GB': 1.05,      // British English more measured
  } as Record<string, number>,
};

// Sommelier prompt for concise, warm responses
const SOMMELIER_PROMPT = `Ти — елітний сомельє-консьєрж. 
Твоя відповідь має бути КОРОТКОЮ (2-3 речення), теплою та професійною.
Відповідай тією ж мовою, якою до тебе звернулися.
Говори природно, ніби в живій розмові.`;

// ============================================
// 🎤 Web Speech Recognition Hook
// ============================================
const useWebSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isFinal, setIsFinal] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                                 (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        
        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript;
              setIsFinal(true);
            } else {
              interim += result[0].transcript;
            }
          }
          
          if (final) {
            setTranscript(final);
            setInterimTranscript('');
          } else {
            setInterimTranscript(interim);
          }
        };

        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => {
          setIsListening(false);
          setIsFinal(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = useCallback((language: string = 'uk-UA') => {
    if (recognitionRef.current && isSupported) {
      setTranscript('');
      setInterimTranscript('');
      setIsFinal(false);
      
      const langMap: Record<string, string> = {
        'UK': 'uk-UA', 'EN': 'en-US', 'RU': 'ru-RU',
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
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    interimTranscript,
    isFinal,
    isSupported,
    startListening,
    stopListening,
    reset: () => {
      setTranscript('');
      setInterimTranscript('');
      setIsFinal(false);
    },
  };
};

// ============================================
// 🎵 Animated Voice Button
// ============================================
const VoiceButton = ({ 
  isRecording, 
  isProcessing,
  isSpeaking,
  onPress,
  disabled 
}: { 
  isRecording: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulse2Anim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(pulseAnim, { toValue: 1.6, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
              Animated.timing(opacityAnim, { toValue: 0.7, duration: 500, useNativeDriver: true }),
            ]),
            Animated.timing(pulseAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.delay(300),
            Animated.timing(pulse2Anim, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
            Animated.timing(pulse2Anim, { toValue: 1, duration: 0, useNativeDriver: true }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 250, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 250, useNativeDriver: true }),
          ])
        ),
      ]).start();
    } else if (isProcessing) {
      Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.08, duration: 180, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        ])
      ).start();
    } else {
      [pulseAnim, pulse2Anim, opacityAnim, rotateAnim].forEach(a => a.setValue(a === opacityAnim ? 0 : 1));
      scaleAnim.setValue(1);
    }
  }, [isRecording, isProcessing, isSpeaking]);

  const rotation = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.voiceButtonWrapper}>
      {isRecording && (
        <>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: opacityAnim }]} />
          <Animated.View style={[styles.pulseRing, styles.pulseRing2, { transform: [{ scale: pulse2Anim }], opacity: Animated.multiply(opacityAnim, 0.5) }]} />
        </>
      )}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.voiceButton,
            isRecording && styles.voiceButtonRecording,
            isProcessing && styles.voiceButtonProcessing,
            isSpeaking && styles.voiceButtonSpeaking,
          ]}
          onPress={onPress}
          disabled={disabled || isProcessing}
          activeOpacity={0.7}
        >
          {isProcessing ? (
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Ionicons name="sparkles" size={26} color={Colors.gold} />
            </Animated.View>
          ) : (
            <Ionicons
              name={isSpeaking ? 'volume-high' : isRecording ? 'mic' : 'mic-outline'}
              size={26}
              color={isRecording ? Colors.black : Colors.gold}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

// ============================================
// 🎭 Main Chat Screen
// ============================================
export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userLanguage, setUserLanguage] = useState('UK');
  const [orchestratorStatus, setOrchestratorStatus] = useState<string>('ready');
  
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    isFinal,
    isSupported: webSpeechSupported,
    startListening,
    stopListening,
    reset: resetSpeech,
  } = useWebSpeechRecognition();

  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      text: 'Вітаю! Я ваш персональний сомельє.\n\n🎤 Натисніть мікрофон і скажіть запит — я одразу відповім голосом!',
      timestamp: new Date(),
    }]);
    loadUserPreferences();
  }, []);

  // Process voice input when recognition is final
  useEffect(() => {
    if (isFinal && transcript && !isProcessingAI) {
      runAIOrchestrator(transcript);
      resetSpeech();
    }
  }, [isFinal, transcript]);

  // Show interim transcript
  useEffect(() => {
    if (isListening && interimTranscript) setInputText(interimTranscript);
    if (transcript) setInputText(transcript);
  }, [interimTranscript, transcript, isListening]);

  const loadUserPreferences = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId) {
        const user = await api.getUser(userId);
        setUserLanguage(user.preferred_language || 'UK');
      }
    } catch (error) {
      console.log('Error loading preferences');
    }
  };

  // ============================================
  // 🎭 AI ORCHESTRATOR - Main Flow
  // ============================================
  const runAIOrchestrator = async (v_input: string) => {
    if (!v_input.trim()) return;

    console.log('🎭 Orchestrator: v_input =', v_input);
    
    setIsRecording(false);
    stopListening();
    setInputText('');
    setOrchestratorStatus('thinking');
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: v_input,
      timestamp: new Date(),
      isVoice: true,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessingAI(true);
    
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      // Send to Gemini AI
      const response = await api.sendChatMessage(
        userId,
        `${SOMMELIER_PROMPT}\n\nЗапит: ${v_input}`,
        sessionId || undefined
      );

      if (!sessionId && response.session_id) setSessionId(response.session_id);

      const v_output = response.response;
      console.log('🧠 Orchestrator: v_output =', v_output.substring(0, 80));

      // Add AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: v_output,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessingAI(false);
      
      // Speak with natural voice
      setOrchestratorStatus('speaking');
      await speakNaturally(v_output);
      setOrchestratorStatus('ready');

    } catch (error) {
      console.error('❌ Orchestrator error:', error);
      Alert.alert('Помилка', 'Не вдалося отримати відповідь');
      setIsProcessingAI(false);
      setOrchestratorStatus('ready');
    }
  };

  // ============================================
  // 🔊 NATURAL TTS - Human-like Voice
  // ============================================
  const speakNaturally = async (v_output: string): Promise<void> => {
    return new Promise(async (resolve) => {
      // Stop any current speech
      Speech.stop();

      // Detect language
      const detectLanguage = (text: string): string => {
        const sample = text.substring(0, 150);
        if (/[іїєґ]/i.test(sample)) return 'uk-UA';
        if (/[ыэъ]/i.test(sample) || /\b(что|как|это|для|или|на|вы|мы|не)\b/i.test(sample)) return 'ru-RU';
        if (/^[a-zA-Z\s.,!?'"()\-:;0-9]+$/.test(sample)) return 'en-US';
        return 'uk-UA';
      };

      const language = detectLanguage(v_output);
      console.log('🗣️ Language detected:', language);

      // Clean text for natural speech
      const cleanText = v_output
        .replace(/[🍷🌡🍽⭐✨💫🎤🔊🥂🍾🍇🍎]/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/#{1,3}\s/g, '')
        .replace(/•\s/g, '')
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ', ')
        .replace(/\s{2,}/g, ' ')
        .replace(/\([^)]*\)/g, '')  // Remove parentheses content
        .trim()
        .substring(0, 500);

      // Get language-specific rate
      const rate = TTS_CONFIG.languageRates[language] || TTS_CONFIG.rate;

      console.log('🔊 TTS Config: pitch=', TTS_CONFIG.pitch, 'rate=', rate);

      // ⏳ "Taking breath" pause before speaking
      await new Promise(r => setTimeout(r, TTS_CONFIG.pauseBeforeMs));

      setIsSpeaking(true);

      Speech.speak(cleanText, {
        language,
        pitch: TTS_CONFIG.pitch,    // 1.1 - warmer, more emotional
        rate: rate,                  // 1.05-1.1 - slightly faster, more natural
        onDone: () => {
          console.log('✅ Speech done');
          setIsSpeaking(false);
          resolve();
        },
        onError: (error) => {
          console.error('TTS error:', error);
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
    setOrchestratorStatus('ready');
  };

  // ============================================
  // 🎤 Voice Button Handler
  // ============================================
  const handleVoicePress = () => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    
    if (isRecording || isListening) {
      setIsRecording(false);
      stopListening();
      setOrchestratorStatus('ready');
    } else {
      if (Platform.OS === 'web' && webSpeechSupported) {
        setIsRecording(true);
        setOrchestratorStatus('listening');
        setInputText('');
        startListening(userLanguage);
      } else {
        Alert.alert('Голосовий ввід', 'Використайте Chrome для голосового вводу');
      }
    }
  };

  // ============================================
  // 📝 Text Message Handler
  // ============================================
  const sendTextMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User not found');

      const response = await api.sendChatMessage(userId, text.trim(), sessionId || undefined);
      if (!sessionId) setSessionId(response.session_id);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося отримати відповідь');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 📷 Image Handler
  // ============================================
  const pickAndSendImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'user',
          text: '📷 Фото для аналізу',
          timestamp: new Date(),
        }]);
        setIsLoading(true);

        const userId = await AsyncStorage.getItem('userId');
        if (!userId) throw new Error('User not found');

        const response = await api.sendChatMessage(
          userId,
          'Проаналізуй фото і дай коротку рекомендацію як сомельє',
          sessionId || undefined,
          result.assets[0].base64
        );

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: response.response,
          timestamp: new Date(),
        }]);
        setIsLoading(false);

        // Auto-speak
        await speakNaturally(response.response);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getStatusText = () => {
    switch (orchestratorStatus) {
      case 'listening': return '🎤 Слухаю...';
      case 'thinking': return '🧠 Думаю...';
      case 'speaking': return '🔊 Говорю...';
      default: return '● Онлайн';
    }
  };

  const isVoiceActive = isRecording || isListening;
  const showSendButton = inputText.trim() && !isVoiceActive && !isProcessingAI;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[
            styles.avatarContainer,
            isSpeaking && styles.avatarSpeaking,
          ]}>
            <Text style={styles.avatarText}>C</Text>
          </Animated.View>
          <View>
            <Text style={styles.headerTitle}>CHEFLY</Text>
            <Text style={[
              styles.headerSubtitle,
              orchestratorStatus !== 'ready' && styles.headerSubtitleActive,
            ]}>
              {getStatusText()}
            </Text>
          </View>
        </View>
        {isSpeaking && (
          <TouchableOpacity style={styles.stopButton} onPress={stopSpeaking}>
            <Ionicons name="stop" size={18} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Recording Banner */}
      {isVoiceActive && (
        <View style={styles.recordingBanner}>
          <View style={styles.soundWave}>
            {[1,2,3,4,5].map((i) => (
              <Animated.View key={i} style={[styles.soundBar, { height: 6 + Math.random() * 18 }]} />
            ))}
          </View>
          <Text style={styles.recordingText}>Говоріть зараз...</Text>
        </View>
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
            <View style={[
              styles.messageBubble,
              message.role === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}>
              {message.isVoice && (
                <Ionicons name="mic" size={14} color={Colors.goldDark} style={styles.voiceIcon} />
              )}
              <Text style={[styles.messageText, message.role === 'user' && styles.userMessageText]}>
                {message.text}
              </Text>
            </View>
            {message.role === 'assistant' && (
              <TouchableOpacity style={styles.speakBtn} onPress={() => speakNaturally(message.text)}>
                <Ionicons name="volume-medium-outline" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {(isLoading || isProcessingAI) && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color={Colors.gold} />
            <Text style={styles.loadingText}>Сомельє готує відповідь...</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Prompts */}
      {messages.length <= 1 && !isVoiceActive && (
        <View style={styles.quickPrompts}>
          {['Вино до стейку', 'Що до сиру?', 'Коктейль'].map((label, i) => (
            <TouchableOpacity key={i} style={styles.quickPromptBtn} onPress={() => runAIOrchestrator(label)}>
              <Text style={styles.quickPromptText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.cameraBtn} onPress={pickAndSendImage} disabled={isVoiceActive || isProcessingAI}>
            <Ionicons name="camera" size={22} color={Colors.textMuted} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, isVoiceActive && styles.textInputListening]}
            placeholder={isVoiceActive ? "Слухаю..." : "Напишіть або 🎤"}
            placeholderTextColor={isVoiceActive ? Colors.gold : Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isVoiceActive && !isProcessingAI}
          />
          
          <VoiceButton
            isRecording={isVoiceActive}
            isProcessing={isProcessingAI}
            isSpeaking={isSpeaking}
            onPress={handleVoicePress}
            disabled={isLoading}
          />
          
          {showSendButton && (
            <TouchableOpacity style={styles.sendBtn} onPress={() => sendTextMessage(inputText)}>
              <Ionicons name="send" size={20} color={Colors.black} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================
// 🎨 Styles
// ============================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarSpeaking: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  avatarText: { color: Colors.black, fontSize: 20, fontWeight: '900', fontFamily: 'Georgia' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 1 },
  headerSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  headerSubtitleActive: { color: Colors.gold, fontWeight: '600' },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingVertical: 12,
    backgroundColor: Colors.goldTransparent,
    gap: 12,
  },
  soundWave: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  soundBar: { width: 3, backgroundColor: Colors.gold, borderRadius: 2 },
  recordingText: { fontSize: 13, color: Colors.gold, fontWeight: '500' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16 },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.gold, borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: Colors.surfaceElevated, borderBottomLeftRadius: 4 },
  voiceIcon: { marginRight: 6, marginTop: 3 },
  messageText: { fontSize: 15, lineHeight: 22, color: Colors.textPrimary, flex: 1 },
  userMessageText: { color: Colors.black },
  speakBtn: { alignSelf: 'flex-start', padding: 6, marginBottom: 10, marginLeft: 10 },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceElevated,
    padding: 14,
    borderRadius: 20,
    gap: 10,
  },
  loadingText: { fontSize: 14, color: Colors.gold, fontStyle: 'italic' },
  quickPrompts: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  quickPromptBtn: {
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.goldTransparent40,
  },
  quickPromptText: { fontSize: 13, color: Colors.gold, fontWeight: '500' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  cameraBtn: {
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  textInputListening: { borderWidth: 1, borderColor: Colors.gold, backgroundColor: Colors.goldTransparent },
  voiceButtonWrapper: { width: 58, height: 58, justifyContent: 'center', alignItems: 'center' },
  pulseRing: { position: 'absolute', width: 58, height: 58, borderRadius: 29, backgroundColor: Colors.gold },
  pulseRing2: { backgroundColor: Colors.goldLight },
  voiceButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  voiceButtonRecording: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  voiceButtonProcessing: { borderColor: Colors.gold, borderWidth: 2 },
  voiceButtonSpeaking: { backgroundColor: Colors.goldTransparent, borderColor: Colors.gold },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
