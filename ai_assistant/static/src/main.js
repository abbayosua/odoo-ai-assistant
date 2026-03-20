/** @odoo-module **/

/**
 * AI Assistant Module Entry Point
 * Main exports and component registry
 * 
 * Architecture: Atomic Design
 * - Atoms: Smallest UI components
 * - Molecules: Combinations of atoms
 * - Organisms: Complex UI sections
 * - Templates: Page layouts
 */

// Import layers
import * as atoms from "./atoms";
import * as molecules from "./molecules";
import * as organisms from "./organisms";
import * as services from "./services";
import * as utils from "./utils";

// Export everything
export { atoms, molecules, organisms, services, utils };

// Export individual components for direct imports
export * from "./atoms";
export * from "./molecules";
export * from "./organisms";
export * from "./services";
export * from "./utils";

// Main component exports
export { ChatWidget } from "./organisms/chat_widget";
export { FloatButton } from "./organisms/float_button";
export { AISidebar } from "./organisms/sidebar";

// Service exports
export { AIService } from "./services/ai_service";

// Utility exports
export { 
    debounce, 
    throttle, 
    formatDate, 
    copyToClipboard,
    parseMarkdown,
} from "./utils/helpers";

export {
    useDebounce,
    useToggle,
    useChat,
    useClickOutside,
    useKeyboardShortcut,
} from "./utils/hooks";

/**
 * Module initialization
 * Called when the module is loaded
 */
export function initializeAIAssistant(env) {
    console.log("AI Assistant module initialized");
    
    // Check if AI is enabled
    // Set up any global state
    
    return {
        version: "1.0.0",
        enabled: true,
    };
}

// Default export
export default {
    atoms,
    molecules,
    organisms,
    services,
    utils,
    initialize: initializeAIAssistant,
};
