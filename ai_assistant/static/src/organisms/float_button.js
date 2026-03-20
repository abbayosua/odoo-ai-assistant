/** @odoo-module **/

/**
 * Float Button - Organism Component
 * Floating action button that opens the chat widget
 * 
 * Props:
 * - position: 'bottom-right' | 'bottom-left'
 * - badge: number (optional unread count)
 * - onClick: Function
 */

import { Component, useState } from "@odoo/owl";
import { AIIcon, ICONS } from "../atoms/icon";
import { AIBadge } from "../atoms/badge";

export class FloatButton extends Component {
    static template = "ai_assistant.OrganismFloatButton";
    static components = { AIIcon, AIBadge };
    static props = {
        position: { type: String, optional: true, default: 'bottom-right' },
        badge: { type: Number, optional: true },
        icon: { type: String, optional: true, default: 'comments' },
        tooltip: { type: String, optional: true, default: 'AI Assistant' },
        onClick: { type: Function, required: true },
    };

    setup() {
        this.state = useState({
            isHovered: false,
            isPressed: false,
        });
    }

    get buttonClass() {
        const classes = ['ai-float-button'];
        classes.push(`ai-float-button--${this.props.position}`);
        
        if (this.state.isHovered) {
            classes.push('ai-float-button--hovered');
        }
        
        if (this.state.isPressed) {
            classes.push('ai-float-button--pressed');
        }
        
        return classes.join(' ');
    }

    handleClick() {
        this.props.onClick();
    }

    handleMouseEnter() {
        this.state.isHovered = true;
    }

    handleMouseLeave() {
        this.state.isHovered = false;
        this.state.isPressed = false;
    }

    handleMouseDown() {
        this.state.isPressed = true;
    }

    handleMouseUp() {
        this.state.isPressed = false;
    }
}

export default FloatButton;
