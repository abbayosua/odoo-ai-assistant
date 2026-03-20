/** @odoo-module **/

/**
 * AI Service - API Communication Layer
 * Handles all API calls to the backend
 */

import { registry } from "@web/core/registry";

export class AIService {
    constructor(orm, user, notification) {
        this.orm = orm;
        this.user = user;
        this.notification = notification;
    }

    /**
     * Send a chat message and get AI response
     * @param {string} message - The message to send
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} - Response object
     */
    async sendChatMessage(message, options = {}) {
        try {
            const result = await this.orm.call(
                "ai.assistant.conversation",
                "send_message",
                [],
                {
                    message: message,
                    conversation_id: options.conversationId || null,
                    context: options.context || null,
                }
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get conversation history
     * @param {number} conversationId - Optional conversation ID
     * @param {number} limit - Number of conversations to fetch
     * @returns {Promise<Object>} - History data
     */
    async getChatHistory(conversationId = null, limit = 20) {
        try {
            const result = await this.orm.call(
                "ai.assistant.conversation",
                "get_history",
                [],
                {
                    conversation_id: conversationId,
                    limit: limit,
                }
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get autocomplete suggestions
     * @param {string} text - Input text
     * @param {string} model - Model name
     * @param {string} field - Field name
     * @returns {Promise<Object>} - Suggestions
     */
    async getAutocomplete(text, model = null, field = null) {
        try {
            const result = await this.orm.call(
                "ai.assistant.provider",
                "autocomplete",
                [],
                {
                    text: text,
                    model: model,
                    field: field,
                }
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate content using a template
     * @param {string} prompt - The prompt
     * @param {string} templateCode - Template code
     * @param {Object} context - Context data
     * @returns {Promise<Object>} - Generated content
     */
    async generateContent(prompt, templateCode = null, context = null) {
        try {
            const result = await this.orm.call(
                "ai.assistant.conversation",
                "generate_content",
                [],
                {
                    prompt: prompt,
                    template_code: templateCode,
                    context: context,
                }
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Process a document with AI
     * @param {number} documentId - Document ID
     * @returns {Promise<Object>} - Processing result
     */
    async processDocument(documentId) {
        try {
            const result = await this.orm.call(
                "ai.assistant.document",
                "process",
                [],
                {
                    document_id: documentId,
                }
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Draft an email
     * @param {Object} params - Email parameters
     * @returns {Promise<Object>} - Draft result
     */
    async draftEmail(params) {
        try {
            const result = await this.orm.call(
                "ai.assistant.conversation",
                "draft_email",
                [],
                {
                    topic: params.topic,
                    recipient: params.recipient || null,
                    tone: params.tone || 'professional',
                    key_points: params.keyPoints || null,
                }
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Translate text
     * @param {string} text - Text to translate
     * @param {string} targetLanguage - Target language code
     * @returns {Promise<Object>} - Translation result
     */
    async translate(text, targetLanguage = 'en') {
        try {
            const result = await this.orm.call(
                "ai.assistant.conversation",
                "translate",
                [],
                {
                    text: text,
                    target_language: targetLanguage,
                }
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get available templates
     * @param {string} category - Optional category filter
     * @returns {Promise<Object>} - Templates list
     */
    async getTemplates(category = null) {
        try {
            const domain = [['active', '=', true]];
            if (category) {
                domain.push(['category', '=', category]);
            }
            
            const result = await this.orm.searchRead(
                "ai.assistant.template",
                domain,
                ['name', 'code', 'category', 'description'],
                { limit: 50 }
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get default provider info
     * @returns {Promise<Object>} - Provider info
     */
    async getDefaultProvider() {
        try {
            const result = await this.orm.call(
                "ai.assistant.provider",
                "get_default_provider",
                []
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if AI is enabled for current user
     * @returns {Promise<boolean>} - Is enabled
     */
    async checkEnabled() {
        try {
            const result = await this.orm.call(
                "res.config.settings",
                "get_ai_settings",
                []
            );
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Register the service
export const aiService = {
    dependencies: ["orm", "user", "notification"],
    start(env, { orm, user, notification }) {
        return new AIService(orm, user, notification);
    },
};

registry.category("services").add("ai_service", aiService);

export default AIService;
