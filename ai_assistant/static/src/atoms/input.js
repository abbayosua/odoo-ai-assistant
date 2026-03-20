/** @odoo-module **/

/**
 * AI Input - Atomic Component
 * A text input component with AI styling
 * 
 * Props:
 * - type: 'text' | 'textarea' | 'password'
 * - placeholder: string
 * - value: string
 * - disabled: boolean
 * - error: string (error message)
 * - icon: string (optional leading icon)
 * - autoFocus: boolean
 */

import { Component, useState, useRef, onMounted } from "@odoo/owl";

export class AIInput extends Component {
    static template = "ai_assistant.AtomInput";
    static props = {
        type: { type: String, optional: true, default: 'text' },
        placeholder: { type: String, optional: true },
        value: { type: String, optional: true, default: '' },
        disabled: { type: Boolean, optional: true, default: false },
        error: { type: String, optional: true },
        icon: { type: String, optional: true },
        autoFocus: { type: Boolean, optional: true, default: false },
        maxLength: { type: Number, optional: true },
        rows: { type: Number, optional: true, default: 3 },
        onInput: { type: Function, optional: true },
        onChange: { type: Function, optional: true },
        onKeyDown: { type: Function, optional: true },
        onFocus: { type: Function, optional: true },
        onBlur: { type: Function, optional: true },
        class: { type: String, optional: true },
    };

    setup() {
        this.state = useState({
            isFocused: false,
            internalValue: this.props.value,
        });
        
        this.inputRef = useRef("input");
        
        onMounted(() => {
            if (this.props.autoFocus && this.inputRef.el) {
                this.inputRef.el.focus();
            }
        });
    }

    get inputClass() {
        const classes = ['ai-input__field'];
        
        if (this.props.icon) {
            classes.push('ai-input__field--has-icon');
        }
        if (this.state.isFocused) {
            classes.push('ai-input__field--focused');
        }
        if (this.props.error) {
            classes.push('ai-input__field--error');
        }
        if (this.props.disabled) {
            classes.push('ai-input__field--disabled');
        }
        
        return classes.join(' ');
    }

    get wrapperClass() {
        const classes = ['ai-input'];
        
        if (this.props.type === 'textarea') {
            classes.push('ai-input--textarea');
        }
        if (this.props.class) {
            classes.push(this.props.class);
        }
        
        return classes.join(' ');
    }

    handleInput(event) {
        const value = event.target.value;
        this.state.internalValue = value;
        
        if (this.props.onInput) {
            this.props.onInput(value, event);
        }
    }

    handleChange(event) {
        if (this.props.onChange) {
            this.props.onChange(event.target.value, event);
        }
    }

    handleKeyDown(event) {
        if (this.props.onKeyDown) {
            this.props.onKeyDown(event);
        }
    }

    handleFocus(event) {
        this.state.isFocused = true;
        if (this.props.onFocus) {
            this.props.onFocus(event);
        }
    }

    handleBlur(event) {
        this.state.isFocused = false;
        if (this.props.onBlur) {
            this.props.onBlur(event);
        }
    }

    focus() {
        if (this.inputRef.el) {
            this.inputRef.el.focus();
        }
    }

    blur() {
        if (this.inputRef.el) {
            this.inputRef.el.blur();
        }
    }

    get value() {
        return this.state.internalValue;
    }

    set value(newValue) {
        this.state.internalValue = newValue;
    }
}

export default AIInput;
