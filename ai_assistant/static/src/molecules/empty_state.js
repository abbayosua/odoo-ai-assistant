/** @odoo-module **/

/**
 * Empty State - Molecule Component
 * Shows when there are no messages
 * 
 * Props:
 * - title: string
 * - description: string
 * - suggestions: Array of strings
 * - onSuggestionClick: Function
 */

import { Component } from "@odoo/owl";
import { AIIcon, ICONS } from "../atoms/icon";
import { AIButton } from "../atoms/button";

export class EmptyState extends Component {
    static template = "ai_assistant.MoleculeEmptyState";
    static components = { AIIcon, AIButton };
    static props = {
        title: { type: String, optional: true, default: 'Start a conversation' },
        description: { type: String, optional: true, default: 'Ask me anything or try one of these suggestions:' },
        suggestions: { type: Array, optional: true, default: () => [
            'How can I create a new invoice?',
            'Help me write an email',
            'Generate a product description',
        ]},
        onSuggestionClick: { type: Function, optional: true },
    };

    handleSuggestionClick(suggestion) {
        if (this.props.onSuggestionClick) {
            this.props.onSuggestionClick(suggestion);
        }
    }
}

export default EmptyState;
