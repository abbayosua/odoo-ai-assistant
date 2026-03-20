/** @odoo-module **/

/**
 * AI Assistant - Main Synergy Module
 * Wires all components together and registers with Odoo
 * 
 * This is the main entry point that:
 * 1. Registers all OWL components
 * 2. Sets up the service layer
 * 3. Creates the floating chat button
 * 4. Integrates with Odoo's UI
 */

import { Component, mount, useState, xml, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { browser } from "@web/core/browser/browser";

// Import all components
import { ChatWidget } from "./organisms/chat_widget";
import { FloatButton } from "./organisms/float_button";
import { AISidebar } from "./organisms/sidebar";
import { AutocompleteDropdown } from "./organisms/autocomplete_dropdown";

// Import services
import { AIService } from "./services/ai_service";

// Import utilities
import { storage, debounce, formatDate } from "./utils/helpers";

// Constants
const STORAGE_KEY = 'ai_assistant_state';
const DEFAULT_STATE = {
    isOpen: false,
    position: { x: 20, y: 20 },
    conversationId: null,
};

/**
 * AI Assistant Root Component
 * Manages the global state and renders the main components
 */
export class AIAssistantRoot extends Component {
    static template = xml`
        <div class="ai-assistant-root">
            <FloatButton 
                t-if="!state.isOpen"
                position="props.position"
                badge="state.unreadCount"
                onClick="toggleChat"/>
            
            <ChatWidget 
                t-if="state.isOpen"
                isOpen="state.isOpen"
                position="props.position"
                context="state.context"
                onClose="closeChat"/>
        </div>
    `;
    
    static components = { ChatWidget, FloatButton };
    static props = {
        position: { type: String, optional: true, default: 'bottom-right' },
    };

    setup() {
        this.state = useState({
            isOpen: false,
            unreadCount: 0,
            context: null,
            conversationId: null,
        });
        
        // Load persisted state
        onMounted(() => {
            this.loadState();
        });
        
        // Save state on changes
        onWillUnmount(() => {
            this.saveState();
        });
    }

    toggleChat() {
        this.state.isOpen = !this.state.isOpen;
        if (this.state.isOpen) {
            this.state.unreadCount = 0;
        }
        this.saveState();
    }

    openChat() {
        this.state.isOpen = true;
        this.state.unreadCount = 0;
        this.saveState();
    }

    closeChat() {
        this.state.isOpen = false;
        this.saveState();
    }

    setContext(context) {
        this.state.context = context;
    }

    loadState() {
        const saved = storage.get(STORAGE_KEY, DEFAULT_STATE);
        if (saved) {
            Object.assign(this.state, saved);
        }
    }

    saveState() {
        storage.set(STORAGE_KEY, {
            isOpen: this.state.isOpen,
            position: this.state.position,
            conversationId: this.state.conversationId,
        });
    }
}

/**
 * Register the AI Assistant as a main component
 */
registry.category("main_components").add("AIAssistantRoot", {
    Component: AIAssistantRoot,
    props: {
        position: "bottom-right",
    },
});

/**
 * Register the AI Service
 */
registry.category("services").add("ai_service", {
    dependencies: ["orm", "user", "notification"],
    start(env, { orm, user, notification }) {
        return new AIService(orm, user, notification);
    },
});

/**
 * Register keyboard shortcuts
 */
registry.category("command").add("ai_assistant.toggle", {
    name: "Toggle AI Assistant",
    action: () => {
        const root = document.querySelector('.ai-assistant-root');
        if (root) {
            root.dispatchEvent(new CustomEvent('ai-assistant-toggle'));
        }
    },
});

/**
 * Export everything
 */
export {
    AIAssistantRoot,
    ChatWidget,
    FloatButton,
    AISidebar,
    AutocompleteDropdown,
    AIService,
};

export default AIAssistantRoot;
