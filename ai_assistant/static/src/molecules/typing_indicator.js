/** @odoo-module **/

/**
 * Typing Indicator - Molecule Component
 * Shows when AI is generating a response
 * 
 * Props:
 * - text: string (optional custom text)
 */

import { Component } from "@odoo/owl";
import { AIAvatar } from "../atoms/avatar";
import { AISpinner } from "../atoms/spinner";

export class TypingIndicator extends Component {
    static template = "ai_assistant.MoleculeTypingIndicator";
    static components = { AIAvatar, AISpinner };
    static props = {
        text: { type: String, optional: true, default: 'AI is thinking...' },
    };
}

export default TypingIndicator;
