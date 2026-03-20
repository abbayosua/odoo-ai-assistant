# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _


class AITemplate(models.Model):
    """AI Prompt Templates"""
    _name = 'ai.assistant.template'
    _description = 'AI Prompt Template'
    _order = 'sequence, name'

    name = fields.Char(
        string='Name',
        required=True,
        translate=True
    )
    
    code = fields.Char(
        string='Code',
        required=True,
        help='Unique identifier for the template'
    )
    
    category = fields.Selection([
        ('email', 'Email'),
        ('description', 'Description'),
        ('translation', 'Translation'),
        ('analysis', 'Analysis'),
        ('summary', 'Summary'),
        ('custom', 'Custom'),
    ], string='Category', default='custom')
    
    prompt = fields.Text(
        string='Prompt Template',
        required=True,
        translate=True,
        help='Use {variable} for placeholders. Available: {context}, {model}, {record}'
    )
    
    system_prompt = fields.Text(
        string='System Prompt',
        translate=True,
        help='Optional system prompt to set AI behavior'
    )
    
    model_ids = fields.Many2many(
        'ir.model',
        string='Applicable Models',
        help='Models this template can be used with (empty = all models)'
    )
    
    sequence = fields.Integer(
        string='Sequence',
        default=10
    )
    
    active = fields.Boolean(
        string='Active',
        default=True
    )
    
    is_default = fields.Boolean(
        string='Default for Category',
        default=False
    )
    
    output_type = fields.Selection([
        ('text', 'Plain Text'),
        ('html', 'HTML'),
        ('json', 'JSON'),
    ], string='Output Type', default='text')
    
    max_tokens = fields.Integer(
        string='Max Tokens',
        default=500,
        help='Maximum tokens for generated output'
    )
    
    _sql_constraints = [
        ('unique_code', 'UNIQUE(code)', 'Template code must be unique!'),
    ]
    
    def render(self, context=None):
        """Render the template with context variables"""
        self.ensure_one()
        
        rendered = self.prompt
        
        if context:
            for key, value in context.items():
                rendered = rendered.replace(f'{{{key}}}', str(value) if value else '')
        
        return rendered
    
    @api.model
    def get_templates_for_model(self, model_name):
        """Get applicable templates for a model"""
        domain = [('active', '=', True)]
        
        templates = self.search(domain)
        
        # Filter by model if specified
        if model_name:
            model = self.env['ir.model'].search([('model', '=', model_name)], limit=1)
            if model:
                templates = templates.filtered(
                    lambda t: not t.model_ids or model in t.model_ids
                )
        
        return templates
    
    @api.model
    def get_default_template(self, category, model_name=None):
        """Get the default template for a category"""
        domain = [
            ('category', '=', category),
            ('active', '=', True),
        ]
        
        templates = self.search(domain, order='is_default desc, sequence')
        
        if model_name:
            model = self.env['ir.model'].search([('model', '=', model_name)], limit=1)
            if model:
                templates = templates.filtered(
                    lambda t: not t.model_ids or model in t.model_ids
                )
        
        return templates[:1]


# Pre-defined templates as data
class AITemplatePreset:
    """Preset templates that are created on module installation"""
    
    PRESETS = [
        {
            'name': 'Professional Email',
            'code': 'email_professional',
            'category': 'email',
            'prompt': """Write a professional email with the following details:
Topic: {topic}
Recipient: {recipient}
Key points: {key_points}
Tone: Professional and courteous

Please write a complete email with subject line and body.""",
            'system_prompt': 'You are a professional business communication assistant.',
            'is_default': True,
        },
        {
            'name': 'Product Description',
            'code': 'product_description',
            'category': 'description',
            'prompt': """Generate a compelling product description for:
Product Name: {name}
Category: {category}
Key Features: {features}
Target Audience: {audience}

Create a description that highlights benefits and features.""",
            'system_prompt': 'You are a marketing copywriter specializing in product descriptions.',
            'is_default': True,
        },
        {
            'name': 'Translate to English',
            'code': 'translate_en',
            'category': 'translation',
            'prompt': 'Translate the following text to English:\n\n{text}',
            'system_prompt': 'You are a professional translator. Translate accurately while preserving meaning and tone.',
            'is_default': True,
        },
        {
            'name': 'Summarize Text',
            'code': 'summarize',
            'category': 'summary',
            'prompt': 'Summarize the following text in a concise manner:\n\n{text}',
            'system_prompt': 'You are a summarization assistant. Create clear, concise summaries.',
            'is_default': True,
        },
        {
            'name': 'Analyze Sentiment',
            'code': 'sentiment_analysis',
            'category': 'analysis',
            'prompt': 'Analyze the sentiment of the following text. Respond with: Positive, Negative, or Neutral, followed by a brief explanation.\n\nText: {text}',
            'system_prompt': 'You are a sentiment analysis expert.',
            'output_type': 'json',
        },
    ]
