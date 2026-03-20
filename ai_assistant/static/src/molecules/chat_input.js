/** @odoo-module **/

/**
 * Chat Input - Molecule Component
 * Text input with send button for chat
 */

import { Component, useState, useRef, onMounted } from "@odoo/owl";
import { AIIcon } from "../atoms/icon";
import { AIBadge } from "../atoms/badge";

export class ChatInput extends Component {
    static template = "ai_assistant.MoleculeChatInput";
    static components = { AIIcon, AIBadge };
    static props = {
        placeholder: { type: String, optional: true, default: 'Type a message...' },
        disabled: { type: Boolean, optional: true, default: false },
        loading: { type: Boolean, optional: true, default: false },
        maxLength: { type: Number, optional: true },
        onSend: { type: Function, required: true },
    };

    setup() {
        this.state = useState({
            value: '',
        });
        this.inputRef = useRef("input");
        
        onMounted(() => {
            if (this.inputRef.el) {
                this.inputRef.el.focus();
            }
        });
    }

    get canSend() {
        return this.state.value.trim().length > 0 && !this.props.disabled && !this.props.loading;
    }

    handleInput(event) {
        this.state.value = event.target.value;
    }

    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.send();
        }
    }

    send() {
        if (!this.canSend) return;
        
        const message = this.state.value.trim();
        this.props.onSend(message);
        this.state.value = '';
        
        if (this.inputRef.el) {
            this.inputRef.el.value = '';
        }
    }

    get charCount() {
        return this.state.value.length;
    }
}

export default ChatInput;
