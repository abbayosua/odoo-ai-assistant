/** @odoo-module **/

/**
 * Suggestion Item - Molecule Component
 * A suggestion item for autocomplete
 * 
 * Props:
 * - suggestion: Object { text, description?, icon? }
 * - selected: boolean
 * - onSelect: Function
 */

import { Component } from "@odoo/owl";
import { AIIcon } from "../atoms/icon";
import { AIBadge } from "../atoms/badge";

export class SuggestionItem extends Component {
    static template = "ai_assistant.MoleculeSuggestionItem";
    static components = { AIIcon, AIBadge };
    static props = {
        suggestion: { type: Object, required: true },
        selected: { type: Boolean, optional: true, default: false },
        index: { type: Number, optional: true },
        onSelect: { type: Function, required: true },
    };

    get itemClass() {
        const classes = ['ai-suggestion-item'];
        
        if (this.props.selected) {
            classes.push('ai-suggestion-item--selected');
        }
        
        return classes.join(' ');
    }

    handleClick() {
        this.props.onSelect(this.props.suggestion, this.props.index);
    }
}

export default SuggestionItem;
