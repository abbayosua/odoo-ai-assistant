/** @odoo-module **/

/**
 * Molecules - Atomic Design Layer 2
 * Combinations of atoms working together
 * 
 * These components are:
 * - Composed of multiple atoms
 * - More complex functionality
 * - Still focused and reusable
 */

export { ChatMessage } from "./chat_message";
export { ChatInput } from "./chat_input";
export { SuggestionItem } from "./suggestion_item";
export { TypingIndicator } from "./typing_indicator";
export { ConversationHeader } from "./conversation_header";
export { EmptyState } from "./empty_state";

export default {
    ChatMessage,
    ChatInput,
    SuggestionItem,
    TypingIndicator,
    ConversationHeader,
    EmptyState,
};
