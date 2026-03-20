/** @odoo-module **/

/**
 * Chat Input - Molecule Component
 * Text input with send button and optional attachment
 * 
 * Props:
 * - placeholder: string
 * - disabled: boolean
 * - loading: boolean
 * - maxLength: number
 * - onSend: Function
 * - onAttach: Function
 */

import { Component, useState, useRef, onMounted } from "@odoo/owl";
import { AIButton } from "../atoms/button";
import { AIIcon, ICONS } from "../atoms/icon";
import { AIInput } from "../atoms/input";

export class ChatInput extends Component {
    static template = "ai_assistant.MoleculeChatInput";
    static components = { AIButton, AIIcon, AIInput };
    static props = {
        placeholder: { type: String, optional: true, default: 'Type a message...' },
        disabled: { type: Boolean, optional: true, default: false },
        loading: { type: Boolean, optional: true, default: false },
        maxLength: { type: Number, optional: true },
        showAttach: { type: Boolean, optional: true, default: false },
        showVoice: { type: Boolean, optional: true, default: false },
        onSend: { type: Function, required: true },
        onAttach: { type: Function, optional: true },
        onVoice: { type: Function, optional: true },
    };

    setup() {
        this.state = useState({
            value: '',
            isFocused: false,
        });
        
        this.inputRef = useRef("input");
        
        onMounted(() => {
            this.focus();
        });
    }

    get canSend() {
        return this.state.value.trim().length > 0 && !this.props.disabled && !this.props.loading;
    }

    get characterCount() {
        return this.state.value.length;
    }

    get isNearLimit() {
        if (!this.props.maxLength) return false;
        return this.characterCount > this.props.maxLength * 0.9;
    }

    handleInput(value) {
        this.state.value = value;
    }

    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.handleSend();
        }
    }

    handleSend() {
        if (!this.canSend) return;
        
        const message = this.state.value.trim();
        this.props.onSend(message);
        this.state.value = '';
    }

    handleAttach() {
        if (this.props.onAttach) {
            this.props.onAttach();
        }
    }

    handleVoice() {
        if (this.props.onVoice) {
            this.props.onVoice();
        }
    }

    focus() {
        if (this.inputRef.el) {
            this.inputRef.el.focus();
        }
    }

    clear() {
        this.state.value = '';
    }
}

export default ChatInput;
