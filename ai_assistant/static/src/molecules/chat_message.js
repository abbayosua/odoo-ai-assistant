/** @odoo-module **/

/**
 * Chat Message - Molecule Component
 * A message bubble with avatar, content, and actions
 * 
 * Props:
 * - message: Object { id, role, content, timestamp }
 * - showAvatar: boolean
 * - onCopy: Function
 * - onRegenerate: Function
 */

import { Component, useState } from "@odoo/owl";
import { AIAvatar } from "../atoms/avatar";
import { AIIcon, ICONS } from "../atoms/icon";
import { AIBadge } from "../atoms/badge";
import { formatDate, parseMarkdown, copyToClipboard } from "../utils/helpers";

export class ChatMessage extends Component {
    static template = "ai_assistant.MoleculeChatMessage";
    static components = { AIAvatar, AIIcon, AIBadge };
    static props = {
        message: { type: Object, required: true },
        showAvatar: { type: Boolean, optional: true, default: true },
        showTimestamp: { type: Boolean, optional: true, default: true },
        onCopy: { type: Function, optional: true },
        onRegenerate: { type: Function, optional: true },
        onFeedback: { type: Function, optional: true },
    };

    setup() {
        this.state = useState({
            copied: false,
            showActions: false,
        });
    }

    get isUser() {
        return this.props.message.role === 'user';
    }

    get isAssistant() {
        return this.props.message.role === 'assistant';
    }

    get messageClass() {
        const classes = ['ai-chat-message'];
        classes.push(`ai-chat-message--${this.props.message.role}`);
        
        return classes.join(' ');
    }

    get formattedTime() {
        return formatDate(this.props.message.timestamp, 'short');
    }

    get renderedContent() {
        return parseMarkdown(this.props.message.content);
    }

    get avatarName() {
        return this.isUser ? 'You' : 'AI';
    }

    get avatarVariant() {
        return this.isUser ? 'user' : 'assistant';
    }

    async handleCopy() {
        const success = await copyToClipboard(this.props.message.content);
        
        if (success) {
            this.state.copied = true;
            setTimeout(() => {
                this.state.copied = false;
            }, 2000);
        }
        
        if (this.props.onCopy) {
            this.props.onCopy(this.props.message);
        }
    }

    handleRegenerate() {
        if (this.props.onRegenerate) {
            this.props.onRegenerate(this.props.message);
        }
    }

    handleFeedback(type) {
        if (this.props.onFeedback) {
            this.props.onFeedback(this.props.message, type);
        }
    }

    showActions() {
        this.state.showActions = true;
    }

    hideActions() {
        this.state.showActions = false;
    }
}

export default ChatMessage;
