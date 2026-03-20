/** @odoo-module **/

import { Component, useState, useRef, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

/**
 * AI Autocomplete Widget
 * Provides AI-powered suggestions for text fields
 */
export class AIAutocomplete extends Component {
    static template = "ai_assistant.Autocomplete";
    static props = {
        model: { type: String, optional: true },
        field: { type: String, optional: true },
        value: { type: String, optional: true },
        onSuggestionSelected: { type: Function, optional: true },
    };

    setup() {
        this.state = useState({
            suggestions: [],
            showDropdown: false,
            selectedIndex: -1,
            isLoading: false,
        });

        this.orm = useService("orm");
        this.debounceTimer = null;

        // Keyboard event handlers
        this.handleKeydown = this.handleKeydown.bind(this);
    }

    async fetchSuggestions(text) {
        if (!text || text.length < 3) {
            this.state.suggestions = [];
            this.state.showDropdown = false;
            return;
        }

        this.state.isLoading = true;

        try {
            const result = await this.orm.call(
                "ai.assistant.provider",
                "autocomplete",
                [],
                {
                    text: text,
                    model: this.props.model,
                    field: this.props.field,
                }
            );

            this.state.suggestions = result.suggestions || [];
            this.state.showDropdown = this.state.suggestions.length > 0;
            this.state.selectedIndex = -1;
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
            this.state.suggestions = [];
            this.state.showDropdown = false;
        } finally {
            this.state.isLoading = false;
        }
    }

    handleInput(event) {
        const text = event.target.value;

        // Debounce the API call
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.fetchSuggestions(text);
        }, 300);
    }

    handleKeydown(event) {
        if (!this.state.showDropdown) return;

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                this.state.selectedIndex = Math.min(
                    this.state.selectedIndex + 1,
                    this.state.suggestions.length - 1
                );
                break;
            case "ArrowUp":
                event.preventDefault();
                this.state.selectedIndex = Math.max(this.state.selectedIndex - 1, 0);
                break;
            case "Enter":
                event.preventDefault();
                if (this.state.selectedIndex >= 0) {
                    this.selectSuggestion(this.state.selectedIndex);
                }
                break;
            case "Escape":
                this.state.showDropdown = false;
                break;
            case "Tab":
                // Trigger autocomplete on Tab
                if (this.state.suggestions.length > 0) {
                    event.preventDefault();
                    this.selectSuggestion(0);
                }
                break;
        }
    }

    selectSuggestion(index) {
        const suggestion = this.state.suggestions[index];
        if (suggestion && this.props.onSuggestionSelected) {
            this.props.onSuggestionSelected(suggestion);
        }
        this.state.showDropdown = false;
        this.state.suggestions = [];
    }

    handleClickOutside(event) {
        this.state.showDropdown = false;
    }
}

/**
 * Field Extension for AI Autocomplete
 * Adds AI autocomplete to standard CharField and TextField
 */
export const aiAutocompleteField = {
    component: AIAutocomplete,
    displayName: "AI Autocomplete",
    supportedTypes: ["char", "text"],
    extractProps: ({ attrs, mode }) => ({
        model: attrs.model,
        field: attrs.name,
    }),
};

// Register the field widget
registry.category("fields").add("ai_autocomplete", aiAutocompleteField);

export default AIAutocomplete;
