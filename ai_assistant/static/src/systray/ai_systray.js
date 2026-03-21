/** @odoo-module **/

/**
 * AI Assistant Systray Item
 * Adds AI icon to the system tray for quick access
 */

import { Component, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { ChatWidget } from "../organisms/chat_widget";

export class AISystrayItem extends Component {
    static template = "ai_assistant.SystrayItem";
    static components = { ChatWidget };
    static props = {};

    setup() {
        this.state = useState({
            isChatOpen: false,
        });
        
        this.notification = useService("notification");
    }

    toggleChat() {
        this.state.isChatOpen = !this.state.isChatOpen;
    }

    closeChat() {
        this.state.isChatOpen = false;
    }
}

// Register the systray item
const systrayItem = {
    Component: AISystrayItem,
};

registry.category("systray").add("ai_assistant", systrayItem, { sequence: 10 });

export default AISystrayItem;
