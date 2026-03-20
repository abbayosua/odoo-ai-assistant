/** @odoo-module **/

/**
 * Atoms - Atomic Design Layer 1
 * Smallest, indivisible UI components
 * 
 * These components are the building blocks of the UI.
 * They should be:
 * - Simple and focused
 * - Highly reusable
 * - Self-contained
 * - Well-documented
 */

// Export all atomic components
export { AIButton } from "./button";
export { AIIcon, ICONS } from "./icon";
export { AIBadge } from "./badge";
export { AISpinner } from "./spinner";
export { AIInput } from "./input";
export { AIAvatar } from "./avatar";

// Re-export as default object for convenience
export default {
    AIButton,
    AIIcon,
    ICONS,
    AIBadge,
    AISpinner,
    AIInput,
    AIAvatar,
};
