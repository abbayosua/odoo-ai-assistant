# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

{
    'name': 'AI Assistant',
    'version': '1.0.0',
    'category': 'Productivity/Tools',
    'summary': 'AI-Powered Assistant for Odoo Community Edition',
    'description': """
Odoo AI Assistant - Bring Enterprise AI to Community Edition
============================================================

This module provides AI-powered features for Odoo Community Edition,
bringing capabilities previously only available in Enterprise.

Features:
- AI Chat Interface accessible anywhere in Odoo
- Smart Field Autocomplete with AI suggestions
- Document Intelligence (OCR, data extraction)
- Email Composition Assistant
- Multiple AI Provider Support (OpenAI, Ollama, Anthropic)
- Context-aware responses
- Workflow automation with AI

Architecture: Atomic Design Pattern
- Atoms: Smallest UI components (buttons, icons, inputs)
- Molecules: Combinations of atoms (chat messages, suggestions)
- Organisms: Complex UI sections (chat widget, sidebar)
- Templates: Page layouts

Supported Odoo Versions: 16, 17, 18, 19
    """,
    'author': 'Abb Yosua',
    'website': 'https://github.com/abbayosua/odoo-ai-assistant',
    'license': 'LGPL-3',
    'maintainer': 'Abb Yosua',
    'email': 'abbasiagian@gmail.com',
    
    # Dependencies
    'depends': [
        'base',
        'web',
        'mail',
    ],
    
    # External dependencies
    'external_dependencies': {
        'python': [
            'openai',
            'requests',
            'Pillow',
        ],
    },
    
    # Data files (loaded in order)
    'data': [
        # Security
        'security/security.xml',
        'security/ir.model.access.csv',
        
        # Default data
        'data/default_prompts.xml',
        
        # Views
        'views/menu_views.xml',
        'views/ai_config_views.xml',
        'views/ai_chat_views.xml',
        'views/ai_document_views.xml',
        'views/res_config_settings.xml',
    ],
    
    # Demo data
    'demo': [
        'data/demo_data.xml',
    ],
    
    # Assets - Atomic Design Structure
    'assets': {
        'web.assets_backend': [
            # Utils
            'ai_assistant/static/src/utils/helpers.js',
            'ai_assistant/static/src/utils/hooks.js',
            
            # Services
            'ai_assistant/static/src/services/ai_service.js',
            
            # Atoms - Layer 1
            'ai_assistant/static/src/atoms/button.js',
            'ai_assistant/static/src/atoms/icon.js',
            'ai_assistant/static/src/atoms/badge.js',
            'ai_assistant/static/src/atoms/spinner.js',
            'ai_assistant/static/src/atoms/input.js',
            'ai_assistant/static/src/atoms/avatar.js',
            'ai_assistant/static/src/atoms/templates.xml',
            'ai_assistant/static/src/atoms/atoms.css',
            
            # Molecules - Layer 2
            'ai_assistant/static/src/molecules/chat_message.js',
            'ai_assistant/static/src/molecules/chat_input.js',
            'ai_assistant/static/src/molecules/suggestion_item.js',
            'ai_assistant/static/src/molecules/typing_indicator.js',
            'ai_assistant/static/src/molecules/conversation_header.js',
            'ai_assistant/static/src/molecules/empty_state.js',
            'ai_assistant/static/src/molecules/templates.xml',
            'ai_assistant/static/src/molecules/molecules.css',
            
            # Organisms - Layer 3
            'ai_assistant/static/src/organisms/chat_widget.js',
            'ai_assistant/static/src/organisms/float_button.js',
            'ai_assistant/static/src/organisms/autocomplete_dropdown.js',
            'ai_assistant/static/src/organisms/sidebar.js',
            'ai_assistant/static/src/organisms/templates.xml',
            'ai_assistant/static/src/organisms/organisms.css',
            
            # Main entry point
            'ai_assistant/static/src/main.js',
            
            # Legacy CSS (for backward compatibility)
            'ai_assistant/static/src/css/ai_assistant.css',
        ],
        'web.assets_frontend': [
            # Atoms
            'ai_assistant/static/src/atoms/atoms.css',
            
            # Molecules
            'ai_assistant/static/src/molecules/molecules.css',
            
            # Organisms
            'ai_assistant/static/src/organisms/organisms.css',
            
            # Main
            'ai_assistant/static/src/css/ai_assistant.css',
        ],
    },
    
    # Installation
    'installable': True,
    'application': True,
    'auto_install': False,
    
    # Version compatibility
    'odoo_version': [
        '16.0',
        '17.0', 
        '18.0',
        '19.0',
    ],
    
    # Price (for App Store)
    'price': 99.0,
    'currency': 'USD',
}
