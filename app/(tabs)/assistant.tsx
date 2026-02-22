import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../src/utils/theme';
import { streamChat } from '../../src/services/api';
import { useAppStore } from '../../src/store/useAppStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'How should I care for my c-section incision?',
  'What should I pack in my diaper bag?',
  'Is it normal to feel overwhelmed?',
  'What foods help with milk supply?',
];

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStreamedText, setCurrentStreamedText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const { createChatSession, addChatMessage, chatSessions } = useAppStore();
  const sessionIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    setCurrentStreamedText('');

    // Create a chat session in the store if this is the first message
    if (!sessionIdRef.current) {
      const sessionTitle = messageText.slice(0, 50);
      sessionIdRef.current = createChatSession(sessionTitle);
    }

    // Store the user message
    addChatMessage(sessionIdRef.current, {
      role: 'user',
      content: messageText,
    });

    scrollToBottom();

    try {
      const chatHistory = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      let streamedContent = '';

      await streamChat(chatHistory, (token: string) => {
        streamedContent += token;
        setCurrentStreamedText(streamedContent);
        scrollToBottom();
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: streamedContent,
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      setCurrentStreamedText('');

      // Store the assistant message
      if (sessionIdRef.current) {
        addChatMessage(sessionIdRef.current, {
          role: 'assistant',
          content: streamedContent,
        });
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [inputText, isLoading, messages, scrollToBottom, createChatSession, addChatMessage]);

  const handleSuggestionTap = useCallback((question: string) => {
    handleSend(question);
  }, [handleSend]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageBubbleContainer, isUser ? styles.userContainer : styles.assistantContainer]}>
        <Text style={[styles.messageLabel, isUser ? styles.userLabel : styles.assistantLabel]}>
          {isUser ? 'You' : 'Bloom'}
        </Text>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  }, []);

  const renderStreamingMessage = () => {
    if (!isLoading && !currentStreamedText) return null;

    return (
      <View style={[styles.messageBubbleContainer, styles.assistantContainer]}>
        <Text style={[styles.messageLabel, styles.assistantLabel]}>Bloom</Text>
        <View style={[styles.messageBubble, styles.assistantBubble]}>
          {currentStreamedText ? (
            <Text style={[styles.messageText, styles.assistantText]}>
              {currentStreamedText}
            </Text>
          ) : null}
          {isLoading && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.typingText}>
                {currentStreamedText ? '' : 'Bloom is thinking...'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderSuggestions = () => {
    if (messages.length > 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <View style={styles.welcomeContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.primary} />
          <Text style={styles.welcomeTitle}>Ask Bloom</Text>
          <Text style={styles.welcomeSubtitle}>
            Your AI-powered postpartum care assistant. Ask me anything about recovery, baby care, and wellbeing.
          </Text>
        </View>
        <Text style={styles.suggestionsTitle}>Suggested Questions</Text>
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionButton}
            onPress={() => handleSuggestionTap(question)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.primary} style={styles.suggestionIcon} />
            <Text style={styles.suggestionText}>{question}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ask Bloom</Text>
          <Text style={styles.headerSubtitle}>AI Postpartum Assistant</Text>
        </View>

        {messages.length === 0 ? (
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.suggestionsScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {renderSuggestions()}
          </ScrollView>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToBottom}
            ListFooterComponent={renderStreamingMessage}
          />
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask Bloom anything about postpartum care..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={1000}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.7}
            >
              <Ionicons
                name="send"
                size={20}
                color={!inputText.trim() || isLoading ? colors.textSecondary : colors.textOnPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  suggestionsScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  messageBubbleContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageLabel: {
    fontSize: fontSize.xs,
    marginBottom: 4,
    fontWeight: fontWeight.medium,
  },
  userLabel: {
    color: colors.primary,
  },
  assistantLabel: {
    color: colors.textSecondary,
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  assistantBubble: {
    backgroundColor: colors.surfaceSecondary,
    borderBottomLeftRadius: borderRadius.sm,
  },
  messageText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  userText: {
    color: colors.textOnPrimary,
  },
  assistantText: {
    color: colors.text,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    alignItems: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  suggestionsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  suggestionIcon: {
    marginRight: spacing.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? spacing.xs : 0,
  },
  textInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    maxHeight: 100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 2 : spacing.xs,
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderLight,
  },
});
