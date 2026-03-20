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
    
    # Data files
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'data/default_prompts.xml',
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
    
    # Assets
    'assets': {
        'web.assets_backend': [
            'ai_assistant/static/src/js/ai_chat.js',
            'ai_assistant/static/src/js/ai_autocomplete.js',
            'ai_assistant/static/src/js/ai_sidebar.js',
            'ai_assistant/static/src/css/ai_assistant.css',
        ],
        'web.assets_frontend': [
            'ai_assistant/static/src/js/ai_chat.js',
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
