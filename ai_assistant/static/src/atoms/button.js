/** @odoo-module **/

/**
 * AI Button - Atomic Component
 * A reusable button component with AI branding
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'ghost' | 'icon'
 * - size: 'sm' | 'md' | 'lg'
 * - disabled: boolean
 * - loading: boolean
 * - icon: string (font-awesome icon class)
 */

import { Component, useState } from "@odoo/owl";

export class AIButton extends Component {
    static template = "ai_assistant.AtomButton";
    static props = {
        variant: { type: String, optional: true, default: 'primary' },
        size: { type: String, optional: true, default: 'md' },
        disabled: { type: Boolean, optional: true, default: false },
        loading: { type: Boolean, optional: true, default: false },
        icon: { type: String, optional: true },
        onClick: { type: Function, optional: true },
        class: { type: String, optional: true },
        slots: { type: Object, optional: true },
    };

    setup() {
        this.state = useState({
            isPressed: false,
        });
    }

    get buttonClass() {
        const classes = ['ai-btn'];
        classes.push(`ai-btn--${this.props.variant}`);
        classes.push(`ai-btn--${this.props.size}`);
        
        if (this.props.disabled || this.props.loading) {
            classes.push('ai-btn--disabled');
        }
        if (this.state.isPressed) {
            classes.push('ai-btn--pressed');
        }
        if (this.props.class) {
            classes.push(this.props.class);
        }
        
        return classes.join(' ');
    }

    handleClick(event) {
        if (this.props.disabled || this.props.loading) {
            return;
        }
        if (this.props.onClick) {
            this.props.onClick(event);
        }
    }

    handleMouseDown() {
        this.state.isPressed = true;
    }

    handleMouseUp() {
        this.state.isPressed = false;
    }
}

export default AIButton;
