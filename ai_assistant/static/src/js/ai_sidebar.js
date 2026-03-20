/** @odoo-module **/

import { Component, useState, useRef } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

/**
 * AI Sidebar Component
 * Provides a sidebar panel for AI features within forms
 */
export class AISidebar extends Component {
    static template = "ai_assistant.Sidebar";
    static props = {
        model: { type: String, optional: true },
        resId: { type: Number, optional: true },
    };

    setup() {
        this.state = useState({
            expanded: false,
            activeTab: "chat",
            messages: [],
            inputText: "",
            isLoading: false,
            templates: [],
        });

        this.orm = useService("orm");
        this.notification = useService("notification");
        this.inputRef = useRef("input");
    }

    async loadTemplates() {
        try {
            const templates = await this.orm.call(
                "ai.assistant.template",
                "search_read",
                [],
                {
                    domain: [["active", "=", true]],
                    fields: ["name", "code", "category"],
                }
            );
            this.state.templates = templates;
        } catch (error) {
            console.error("Failed to load templates:", error);
        }
    }

    toggleSidebar() {
        this.state.expanded = !this.state.expanded;
        if (this.state.expanded) {
            this.loadTemplates();
        }
    }

    setActiveTab(tab) {
        this.state.activeTab = tab;
    }

    async sendMessage() {
        const message = this.state.inputText.trim();
        if (!message || this.state.isLoading) return;

        this.state.messages.push({
            role: "user",
            content: message,
            time: new Date().toLocaleTimeString(),
        });

        this.state.inputText = "";
        this.state.isLoading = true;

        try {
            const result = await this.orm.call(
                "ai.assistant.conversation",
                "send_message",
                [],
                {
                    message: message,
                    context: {
                        model: this.props.model,
                        res_id: this.props.resId,
                    },
                }
            );

            this.state.messages.push({
                role: "assistant",
                content: result.response,
                time: new Date().toLocaleTimeString(),
            });
        } catch (error) {
            this.notification.add(
                `Failed to get AI response: ${error.message}`,
                { type: "danger" }
            );
        } finally {
            this.state.isLoading = false;
        }
    }

    async useTemplate(templateCode) {
        const template = this.state.templates.find(t => t.code === templateCode);
        if (template) {
            this.state.inputText = `Use template: ${template.name}`;
            await this.sendMessage();
        }
    }

    async generateContent(type) {
        this.state.isLoading = true;
        try {
            const result = await this.orm.call(
                "ai.assistant.conversation",
                "generate_content",
                [],
                {
                    prompt: `Generate ${type} for this ${this.props.model}`,
                    context: {
                        model: this.props.model,
                        res_id: this.props.resId,
                    },
                }
            );

            this.notification.add("Content generated!", { type: "success" });
            return result.content;
        } catch (error) {
            this.notification.add(
                `Failed to generate content: ${error.message}`,
                { type: "danger" }
            );
        } finally {
            this.state.isLoading = false;
        }
    }
}

// Register as a main component
registry.category("main_components").add("AISidebar", {
    Component: AISidebar,
});

export default AISidebar;
