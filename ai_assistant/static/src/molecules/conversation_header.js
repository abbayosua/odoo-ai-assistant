/** @odoo-module **/

/**
 * Conversation Header - Molecule Component
 * Header for the chat interface
 * 
 * Props:
 * - title: string
 * - subtitle: string
 * - onClose: Function
 * - onClear: Function
 * - onSettings: Function
 */

import { Component } from "@odoo/owl";
import { AIButton } from "../atoms/button";
import { AIIcon, ICONS } from "../atoms/icon";

export class ConversationHeader extends Component {
    static template = "ai_assistant.MoleculeConversationHeader";
    static components = { AIButton, AIIcon };
    static props = {
        title: { type: String, optional: true, default: 'AI Assistant' },
        subtitle: { type: String, optional: true },
        showClose: { type: Boolean, optional: true, default: true },
        showClear: { type: Boolean, optional: true, default: true },
        showSettings: { type: Boolean, optional: true, default: true },
        onClose: { type: Function, optional: true },
        onClear: { type: Function, optional: true },
        onSettings: { type: Function, optional: true },
    };

    handleClose() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    handleClear() {
        if (this.props.onClear) {
            this.props.onClear();
        }
    }

    handleSettings() {
        if (this.props.onSettings) {
            this.props.onSettings();
        }
    }
}

export default ConversationHeader;
