/** @odoo-module **/

/**
 * Autocomplete Dropdown - Organism Component
 * AI-powered autocomplete suggestions dropdown
 * 
 * Props:
 * - suggestions: Array of suggestion objects
 * - selectedIndex: number
 * - onSelect: Function
 * - onClose: Function
 */

import { Component, useState, useRef, onMounted, onWillUnmount } from "@odoo/owl";
import { SuggestionItem } from "../molecules/suggestion_item";

export class AutocompleteDropdown extends Component {
    static template = "ai_assistant.OrganismAutocompleteDropdown";
    static components = { SuggestionItem };
    static props = {
        suggestions: { type: Array, required: true },
        selectedIndex: { type: Number, optional: true, default: -1 },
        loading: { type: Boolean, optional: true, default: false },
        position: { type: Object, optional: true }, // { top, left }
        width: { type: Number, optional: true },
        onSelect: { type: Function, required: true },
        onClose: { type: Function, optional: true },
    };

    setup() {
        this.dropdownRef = useRef("dropdown");
        
        onMounted(() => {
            this.adjustPosition();
        });
    }

    get dropdownStyle() {
        if (!this.props.position) return '';
        
        const style = {
            top: `${this.props.position.top}px`,
            left: `${this.props.position.left}px`,
        };
        
        if (this.props.width) {
            style.width = `${this.props.width}px`;
        }
        
        return Object.entries(style)
            .map(([key, value]) => `${key}: ${value}`)
            .join('; ');
    }

    adjustPosition() {
        if (!this.dropdownRef.el || !this.props.position) return;
        
        const rect = this.dropdownRef.el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Adjust if dropdown goes off-screen
        if (rect.bottom > viewportHeight) {
            this.dropdownRef.el.style.maxHeight = `${viewportHeight - rect.top - 20}px`;
        }
        
        if (rect.right > viewportWidth) {
            this.dropdownRef.el.style.left = `${viewportWidth - rect.width - 20}px`;
        }
    }

    handleSelect(suggestion, index) {
        this.props.onSelect(suggestion, index);
    }
}

export default AutocompleteDropdown;
