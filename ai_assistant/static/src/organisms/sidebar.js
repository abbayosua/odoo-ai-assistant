/** @odoo-module **/

/**
 * AI Sidebar - Organism Component
 * Side panel for AI features within Odoo forms
 * 
 * Props:
 * - model: string (current model)
 * - resId: number (current record ID)
 * - isOpen: boolean
 * - onToggle: Function
 */

import { Component, useState, onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { useAsync, useToggle } from "../utils/hooks";

// Atoms
import { AIIcon, ICONS } from "../atoms/icon";
import { AIButton } from "../atoms/button";
import { AISpinner } from "../atoms/spinner";

// Molecules
import { ChatMessage } from "../molecules/chat_message";
import { ChatInput } from "../molecules/chat_input";
import { EmptyState } from "../molecules/empty_state";
import { TypingIndicator } from "../molecules/typing_indicator";

export class AISidebar extends Component {
    static template = "ai_assistant.OrganismSidebar";
    static components = {
        AIIcon,
        AIButton,
        AISpinner,
        ChatMessage,
        ChatInput,
        EmptyState,
        TypingIndicator,
    };
    static props = {
        model: { type: String, optional: true },
        resId: { type: Number, optional: true },
        recordName: { type: String, optional: true },
        isOpen: { type: Boolean, optional: true, default: false },
        onToggle: { type: Function, optional: true },
    };

    setup() {
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.aiService = useService("ai_service");
        
        this.state = useState({
            activeTab: 'chat',
            messages: [],
            isLoading: false,
            templates: [],
        });
        
        onMounted(() => {
            this.loadTemplates();
        });
    }

    get sidebarClass() {
        const classes = ['ai-sidebar'];
        
        if (this.props.isOpen) {
            classes.push('ai-sidebar--open');
        }
        
        return classes.join(' ');
    }

    get contextInfo() {
        return {
            model: this.props.model,
            res_id: this.props.resId,
            record_name: this.props.recordName,
        };
    }

    get modelSuggestions() {
        // Generate contextual suggestions based on model
        const suggestions = {
            'product.template': [
                'Generate product description',
                'Create SEO title',
                'Suggest product features',
            ],
            'res.partner': [
                'Draft introduction email',
                'Summarize contact history',
                'Suggest follow-up actions',
            ],
            'sale.order': [
                'Write cover letter',
                'Suggest upsell products',
                'Generate order summary',
            ],
            'crm.lead': [
                'Qualify this lead',
                'Draft follow-up email',
                'Suggest next actions',
            ],
        };
        
        return suggestions[this.props.model] || [
            'How can I help you?',
            'Generate content',
            'Answer questions',
        ];
    }

    async loadTemplates() {
        const result = await this.aiService.getTemplates();
        if (result.success) {
            this.state.templates = result.data;
        }
    }

    async sendMessage(content) {
        if (!content.trim() || this.state.isLoading) return;
        
        this.state.messages.push({
            id: `user_${Date.now()}`,
            role: 'user',
            content: content,
            timestamp: new Date().toISOString(),
        });
        
        this.state.isLoading = true;
        
        try {
            const result = await this.aiService.sendChatMessage(content, {
                context: this.contextInfo,
            });
            
            if (result.success) {
                this.state.messages.push({
                    id: `assistant_${Date.now()}`,
                    role: 'assistant',
                    content: result.data.response,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (error) {
            this.notification.add(error.message, { type: 'danger' });
        } finally {
            this.state.isLoading = false;
        }
    }

    setActiveTab(tab) {
        this.state.activeTab = tab;
    }

    handleToggle() {
        if (this.props.onToggle) {
            this.props.onToggle();
        }
    }

    async useTemplate(templateCode) {
        const template = this.state.templates.find(t => t.code === templateCode);
        if (template) {
            await this.sendMessage(`Use template: ${template.name}`);
        }
    }
}

export default AISidebar;
