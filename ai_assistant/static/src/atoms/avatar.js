/** @odoo-module **/

/**
 * AI Avatar - Atomic Component
 * Avatar component for user and AI representation
 * 
 * Props:
 * - src: string (image URL)
 * - name: string (for initials fallback)
 * - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * - variant: 'user' | 'assistant' | 'system'
 */

import { Component } from "@odoo/owl";

export class AIAvatar extends Component {
    static template = "ai_assistant.AtomAvatar";
    static props = {
        src: { type: String, optional: true },
        name: { type: String, optional: true },
        size: { type: String, optional: true, default: 'md' },
        variant: { type: String, optional: true, default: 'user' },
        class: { type: String, optional: true },
    };

    get avatarClass() {
        const classes = ['ai-avatar'];
        classes.push(`ai-avatar--${this.props.size}`);
        classes.push(`ai-avatar--${this.props.variant}`);
        
        if (this.props.class) {
            classes.push(this.props.class);
        }
        
        return classes.join(' ');
    }

    get initials() {
        if (!this.props.name) return '?';
        
        const names = this.props.name.trim().split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
        return names[0].substring(0, 2).toUpperCase();
    }

    get backgroundColor() {
        // Generate consistent color based on name
        if (!this.props.name) return '#7c3aed';
        
        const colors = [
            '#7c3aed', // Primary purple
            '#3b82f6', // Blue
            '#10b981', // Green
            '#f59e0b', // Orange
            '#ef4444', // Red
            '#ec4899', // Pink
        ];
        
        let hash = 0;
        for (let i = 0; i < this.props.name.length; i++) {
            hash = this.props.name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }
}

export default AIAvatar;
