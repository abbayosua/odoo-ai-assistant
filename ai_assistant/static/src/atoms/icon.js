/** @odoo-module **/

/**
 * AI Icon - Atomic Component
 * A simple icon component with consistent styling
 * 
 * Props:
 * - name: string (icon name without 'fa-' prefix)
 * - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * - color: string (optional color class)
 * - spin: boolean (for loading icons)
 */

import { Component } from "@odoo/owl";

export class AIIcon extends Component {
    static template = "ai_assistant.AtomIcon";
    static props = {
        name: { type: String, required: true },
        size: { type: String, optional: true, default: 'md' },
        color: { type: String, optional: true },
        spin: { type: Boolean, optional: true, default: false },
        class: { type: String, optional: true },
    };

    get iconClass() {
        const classes = ['fa', `fa-${this.props.name}`];
        
        // Size classes
        const sizeMap = {
            xs: 'fa-xs',
            sm: 'fa-sm',
            md: '',
            lg: 'fa-lg',
            xl: 'fa-2x',
        };
        if (sizeMap[this.props.size]) {
            classes.push(sizeMap[this.props.size]);
        }
        
        // Spin animation
        if (this.props.spin) {
            classes.push('fa-spin');
        }
        
        // Custom color
        if (this.props.color) {
            classes.push(`ai-icon--${this.props.color}`);
        }
        
        // Additional classes
        if (this.props.class) {
            classes.push(this.props.class);
        }
        
        return classes.join(' ');
    }
}

// Predefined icon constants for consistency
export const ICONS = {
    SEND: 'paper-plane',
    SPINNER: 'spinner',
    CLOSE: 'times',
    CHAT: 'comments',
    ROBOT: 'robot',
    COPY: 'copy',
    CHECK: 'check',
    REGENERATE: 'sync',
    THUMBS_UP: 'thumbs-up',
    THUMBS_DOWN: 'thumbs-down',
    MICROPHONE: 'microphone',
    ATTACHMENT: 'paperclip',
    ELLIPSIS: 'ellipsis-h',
    ARROW_UP: 'arrow-up',
    ARROW_DOWN: 'arrow-down',
    WAND: 'magic',
    DOCUMENT: 'file-alt',
    EMAIL: 'envelope',
    SETTINGS: 'cog',
    USER: 'user',
    LIGHTBULB: 'lightbulb',
    SEARCH: 'search',
    EXPAND: 'expand',
    COMPRESS: 'compress',
};

export default AIIcon;
