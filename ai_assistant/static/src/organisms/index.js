/** @odoo-module **/

/**
 * Organisms - Atomic Design Layer 3
 * Complex, composed UI components
 * 
 * These components are:
 * - Composed of molecules and atoms
 * - More complex functionality
 * - Self-contained but connected to services
 * - Typically represent major UI sections
 */

export { ChatWidget } from "./chat_widget";
export { FloatButton } from "./float_button";
export { AutocompleteDropdown } from "./autocomplete_dropdown";
import { AISidebar } from "./sidebar";

export default {
    ChatWidget,
    FloatButton,
    AutocompleteDropdown,
    AISidebar,
};
