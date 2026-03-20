/** @odoo-module **/

/**
 * AI Spinner - Atomic Component
 * Loading spinner with AI branding
 * 
 * Props:
 * - size: 'sm' | 'md' | 'lg'
 * - color: string (optional color class)
 */

import { Component } from "@odoo/owl";

export class AISpinner extends Component {
    static template = "ai_assistant.AtomSpinner";
    static props = {
        size: { type: String, optional: true, default: 'md' },
        color: { type: String, optional: true, default: 'primary' },
        class: { type: String, optional: true },
    };

    get spinnerClass() {
        const classes = ['ai-spinner'];
        classes.push(`ai-spinner--${this.props.size}`);
        classes.push(`ai-spinner--${this.props.color}`);
        
        if (this.props.class) {
            classes.push(this.props.class);
        }
        
        return classes.join(' ');
    }
}

export default AISpinner;
