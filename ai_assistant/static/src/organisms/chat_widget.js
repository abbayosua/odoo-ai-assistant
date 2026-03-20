/** @odoo-module **/

/**
 * Chat Widget - Organism Component
 * Full-featured AI chat interface
 * 
 * This is the main chat interface that combines:
 * - ConversationHeader
 * - ChatMessage list
 * - ChatInput
 * - EmptyState
 * - TypingIndicator
 */

import { Component, useState, useRef, onMounted, onWillUnmount, useEffect } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { useChat, useClickOutside, useKeyboardShortcut, useScrollToBottom } from "../utils/hooks";
import { storage, scrollIntoView } from "../utils/helpers";

// Atoms
import { AIIcon } from "../atoms/icon";
import { AISpinner } from "../atoms/spinner";

// Molecules
import { ConversationHeader } from "../molecules/conversation_header";
import { ChatMessage } from "../molecules/chat_message";
import { ChatInput } from "../molecules/chat_input";
import { EmptyState } from "../molecules/empty_state";
import { TypingIndicator } from "../molecules/typing_indicator";

export class ChatWidget extends Component {
    static template = "ai_assistant.OrganismChatWidget";
    static components = {
        AIIcon,
        AISpinner,
        ConversationHeader,
        ChatMessage,
        ChatInput,
        EmptyState,
        TypingIndicator,
    };
    static props = {
        isOpen: { type: Boolean, optional: true, default: false },
        position: { type: String, optional: true, default: 'bottom-right' },
        context: { type: Object, optional: true },
        onClose: { type: Function, optional: true },
    };

    setup() {
        // Services
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.aiService = useService("ai_service");
        
        // State
        this.state = useState({
            isOpen: this.props.isOpen,
            isMinimized: false,
            messages: [],
            isLoading: false,
            error: null,
            conversationId: null,
        });
        
        // Refs
        this.containerRef = useRef("container");
        this.messagesRef = useRef("messages");
        
        // Load persisted conversation
        onMounted(() => {
            this.loadPersistedConversation();
        });
        
        // Click outside to close (optional)
        this.containerRef = useClickOutside(() => {
            // Uncomment to close on outside click
            // this.close();
        });
        
        // Keyboard shortcuts
        useKeyboardShortcut('escape', this.close);
    }

    // Computed properties
    get hasMessages() {
        return this.state.messages.length > 0;
    }

    get isEmpty() {
        return !this.hasMessages && !this.state.isLoading;
    }

    get widgetClass() {
        const classes = ['ai-chat-widget'];
        classes.push(`ai-chat-widget--${this.props.position}`);
        
        if (this.state.isMinimized) {
            classes.push('ai-chat-widget--minimized');
        }
        
        if (this.state.isOpen) {
            classes.push('ai-chat-widget--open');
        }
        
        return classes.join(' ');
    }

    // Actions
    open() {
        this.state.isOpen = true;
        this.state.isMinimized = false;
    }

    close() {
        if (this.props.onClose) {
            this.props.onClose();
        } else {
            this.state.isOpen = false;
        }
    }

    toggle() {
        this.state.isOpen = !this.state.isOpen;
    }

    minimize() {
        this.state.isMinimized = true;
    }

    maximize() {
        this.state.isMinimized = false;
    }

    // Chat actions
    async sendMessage(content) {
        if (!content.trim() || this.state.isLoading) return;
        
        // Add user message
        const userMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: content.trim(),
            timestamp: new Date().toISOString(),
        };
        
        this.state.messages.push(userMessage);
        this.state.isLoading = true;
        this.state.error = null;
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Persist conversation
        this.persistConversation();
        
        try {
            const result = await this.aiService.sendChatMessage(content, {
                conversationId: this.state.conversationId,
                context: this.props.context,
            });
            
            if (result.success) {
                // Update conversation ID
                if (result.data.conversation_id && !this.state.conversationId) {
                    this.state.conversationId = result.data.conversation_id;
                }
                
                // Add assistant message
                this.state.messages.push({
                    id: result.data.message_id || `assistant_${Date.now()}`,
                    role: 'assistant',
                    content: result.data.response,
                    timestamp: new Date().toISOString(),
                });
            } else {
                this.state.error = result.error;
                this.notification.add(result.error, { type: 'danger' });
            }
        } catch (error) {
            this.state.error = error.message;
            this.notification.add(`Failed to send message: ${error.message}`, { type: 'danger' });
        } finally {
            this.state.isLoading = false;
            this.scrollToBottom();
            this.persistConversation();
        }
    }

    async regenerate(message) {
        // Find the previous user message
        const messageIndex = this.state.messages.findIndex(m => m.id === message.id);
        if (messageIndex <= 0) return;
        
        const userMessage = this.state.messages[messageIndex - 1];
        if (userMessage.role !== 'user') return;
        
        // Remove the assistant message and regenerate
        this.state.messages.pop();
        await this.sendMessage(userMessage.content);
    }

    handleCopy(message) {
        this.notification.add('Copied to clipboard!', { type: 'success' });
    }

    handleFeedback(message, type) {
        // Could send to backend for analytics
        console.log('Feedback:', type, message.id);
        this.notification.add('Thanks for your feedback!', { type: 'info' });
    }

    clearConversation() {
        this.state.messages = [];
        this.state.conversationId = null;
        this.state.error = null;
        this.persistConversation();
    }

    // Suggestion handlers
    handleSuggestionClick(suggestion) {
        this.sendMessage(suggestion);
    }

    // Persistence
    persistConversation() {
        storage.set('ai_chat_conversation', {
            messages: this.state.messages,
            conversationId: this.state.conversationId,
        });
    }

    loadPersistedConversation() {
        const saved = storage.get('ai_chat_conversation');
        if (saved) {
            this.state.messages = saved.messages || [];
            this.state.conversationId = saved.conversationId || null;
        }
    }

    // Scrolling
    scrollToBottom() {
        if (this.messagesRef.el) {
            this.messagesRef.el.scrollTop = this.messagesRef.el.scrollHeight;
        }
    }
}

export default ChatWidget;
