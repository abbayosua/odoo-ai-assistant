/** @odoo-module **/

/**
 * AI Badge - Atomic Component
 * A small label component for status and counts
 * 
 * Props:
 * - variant: 'primary' | 'success' | 'warning' | 'danger' | 'info'
 * - size: 'sm' | 'md'
 * - pill: boolean (rounded pill shape)
 */

import { Component } from "@odoo/owl";

export class AIBadge extends Component {
    static template = "ai_assistant.AtomBadge";
    static props = {
        variant: { type: String, optional: true, default: 'primary' },
        size: { type: String, optional: true, default: 'md' },
        pill: { type: Boolean, optional: true, default: false },
        icon: { type: String, optional: true },
        class: { type: String, optional: true },
        slots: { type: Object, optional: true },
    };

    get badgeClass() {
        const classes = ['ai-badge'];
        classes.push(`ai-badge--${this.props.variant}`);
        classes.push(`ai-badge--${this.props.size}`);
        
        if (this.props.pill) {
            classes.push('ai-badge--pill');
        }
        
        if (this.props.class) {
            classes.push(this.props.class);
        }
        
        return classes.join(' ');
    }
}

export default AIBadge;
