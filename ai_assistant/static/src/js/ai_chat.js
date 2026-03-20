/** @odoo-module **/

import { Component, useState, useRef, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

/**
 * AI Chat Widget Component
 * Provides a floating chat interface for AI interactions
 */
export class AIChatWidget extends Component {
    static template = "ai_assistant.ChatWidget";
    static props = {};

    setup() {
        this.state = useState({
            isOpen: false,
            messages: [],
            inputText: "",
            isLoading: false,
            conversationId: null,
        });

        this.orm = useService("orm");
        this.notification = useService("notification");
        this.inputRef = useRef("input");
        this.messagesRef = useRef("messages");

        // Load recent conversations on mount
        onMounted(() => {
            this.loadHistory();
        });

        // Handle click outside to close
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    async loadHistory() {
        try {
            const history = await this.orm.call(
                "ai.assistant.conversation",
                "search_read",
                [],
                {
                    domain: [["user_id", "=", this.env.services.user.userId]],
                    limit: 1,
                    order: "create_date desc",
                }
            );

            if (history && history.length > 0) {
                this.state.conversationId = history[0].id;
                // Load messages would go here
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    }

    toggleChat() {
        this.state.isOpen = !this.state.isOpen;
        if (this.state.isOpen && this.inputRef.el) {
            this.inputRef.el.focus();
        }
    }

    async sendMessage() {
        const message = this.state.inputText.trim();
        if (!message || this.state.isLoading) return;

        // Add user message to UI
        this.state.messages.push({
            role: "user",
            content: message,
            time: new Date().toLocaleTimeString(),
        });

        this.state.inputText = "";
        this.state.isLoading = true;

        try {
            // Call the backend
            const result = await this.orm.call(
                "ai.assistant.conversation",
                "send_message",
                [],
                {
                    message: message,
                    conversation_id: this.state.conversationId,
                }
            );

            // Update conversation ID if new
            if (result.conversation_id && !this.state.conversationId) {
                this.state.conversationId = result.conversation_id;
            }

            // Add assistant response
            this.state.messages.push({
                role: "assistant",
                content: result.response,
                time: new Date().toLocaleTimeString(),
            });

            // Scroll to bottom
            this.scrollToBottom();
        } catch (error) {
            this.notification.add(
                `Failed to get AI response: ${error.message}`,
                { type: "danger" }
            );
        } finally {
            this.state.isLoading = false;
        }
    }

    handleKeydown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    scrollToBottom() {
        if (this.messagesRef.el) {
            this.messagesRef.el.scrollTop = this.messagesRef.el.scrollHeight;
        }
    }

    handleClickOutside(event) {
        // Close chat when clicking outside (optional)
    }
}

// Register the component
registry.category("main_components").add("AIChatWidget", {
    Component: AIChatWidget,
});

/**
 * AI Float Button
 * Button that opens the chat widget
 */
export class AIFloatButton extends Component {
    static template = "ai_assistant.FloatButton";
    static props = {};

    setup() {
        this.state = useState({
            showChat: false,
        });
    }

    toggleChat() {
        this.state.showChat = !this.state.showChat;
    }
}

registry.category("main_components").add("AIFloatButton", {
    Component: AIFloatButton,
});

export default { AIChatWidget, AIFloatButton };
