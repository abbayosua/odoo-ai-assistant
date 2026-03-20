# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

import logging
from datetime import datetime

from odoo import models, fields, api, _
from odoo.exceptions import UserError

_logger = logging.getLogger(__name__)


class AIConversation(models.Model):
    """AI Conversation History"""
    _name = 'ai.assistant.conversation'
    _description = 'AI Conversation'
    _order = 'create_date desc'
    _rec_name = 'title'

    title = fields.Char(
        string='Title',
        compute='_compute_title',
        store=True
    )
    
    user_id = fields.Many2one(
        'res.users',
        string='User',
        required=True,
        default=lambda self: self.env.user,
        ondelete='cascade'
    )
    
    message_ids = fields.One2many(
        'ai.assistant.message',
        'conversation_id',
        string='Messages'
    )
    
    message_count = fields.Integer(
        string='Message Count',
        compute='_compute_message_count'
    )
    
    context_model = fields.Char(
        string='Context Model',
        help='The Odoo model the conversation is related to'
    )
    
    context_res_id = fields.Integer(
        string='Context Record ID',
        help='The record ID the conversation is related to'
    )
    
    provider_id = fields.Many2one(
        'ai.assistant.provider',
        string='AI Provider Used'
    )
    
    is_archived = fields.Boolean(
        string='Archived',
        default=False
    )
    
    tags = fields.Char(
        string='Tags',
        help='Comma-separated tags for categorization'
    )
    
    @api.depends('message_ids')
    def _compute_title(self):
        for conversation in self:
            first_message = conversation.message_ids[:1]
            if first_message and first_message.content:
                # Use first 50 chars of first message as title
                conversation.title = first_message.content[:50] + ('...' if len(first_message.content) > 50 else '')
            else:
                conversation.title = _('New Conversation')
    
    def _compute_message_count(self):
        for conversation in self:
            conversation.message_count = len(conversation.message_ids)
    
    def action_archive(self):
        """Archive a conversation"""
        self.write({'is_archived': True})
    
    def action_unarchive(self):
        """Unarchive a conversation"""
        self.write({'is_archived': False})
    
    def action_clear_history(self):
        """Clear all messages in conversation"""
        self.message_ids.unlink()
    
    def send_message(self, content, context=None):
        """Send a message and get AI response"""
        self.ensure_one()
        
        # Create user message
        user_message = self.env['ai.assistant.message'].create({
            'conversation_id': self.id,
            'role': 'user',
            'content': content,
        })
        
        # Get AI provider
        provider = self.provider_id or self.env['ai.assistant.provider'].get_default_provider()
        
        if not provider:
            raise UserError(_('No AI provider configured. Please configure an AI provider in Settings.'))
        
        # Build context
        ai_context = {
            'system_prompt': self._build_system_prompt(),
        }
        
        # Get conversation history
        history = self.message_ids.filtered(lambda m: m.role in ['user', 'assistant'])
        history_text = '\n'.join([
            f"{'User' if m.role == 'user' else 'Assistant'}: {m.content}"
            for m in history[:-1]  # Exclude the message we just created
        ])
        
        # Generate response
        prompt = content
        if history_text:
            prompt = f"Previous conversation:\n{history_text}\n\nCurrent message: {content}"
        
        try:
            response = provider.generate_response(prompt, ai_context)
            
            # Create assistant message
            assistant_message = self.env['ai.assistant.message'].create({
                'conversation_id': self.id,
                'role': 'assistant',
                'content': response,
                'provider_id': provider.id,
            })
            
            return {
                'user_message': user_message.id,
                'assistant_message': assistant_message.id,
                'response': response,
            }
        except Exception as e:
            _logger.error('AI response generation failed: %s', str(e))
            raise UserError(_('Failed to generate AI response: %s') % str(e))
    
    def _build_system_prompt(self):
        """Build system prompt for the AI"""
        base_prompt = """You are an AI assistant integrated into Odoo ERP. Your role is to help users with:
- Answering questions about their business data
- Generating content (emails, descriptions, reports)
- Providing insights and suggestions
- Assisting with Odoo functionality

Be helpful, concise, and professional. When asked about Odoo data, explain what the user should look for or do.
Do not make up data - if you don't know something, say so.
"""
        
        # Add context if available
        if self.context_model:
            base_prompt += f"\n\nThe user is currently working with the {self.context_model} model."
            if self.context_res_id:
                try:
                    record = self.env[self.context_model].browse(self.context_res_id)
                    if record.exists():
                        base_prompt += f"\n\nRecord context: {record.display_name}"
                except Exception:
                    pass
        
        return base_prompt


class AIMessage(models.Model):
    """AI Message within a conversation"""
    _name = 'ai.assistant.message'
    _description = 'AI Message'
    _order = 'create_date asc'

    conversation_id = fields.Many2one(
        'ai.assistant.conversation',
        string='Conversation',
        required=True,
        ondelete='cascade'
    )
    
    role = fields.Selection([
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ], string='Role', required=True, default='user')
    
    content = fields.Text(
        string='Content',
        required=True
    )
    
    provider_id = fields.Many2one(
        'ai.assistant.provider',
        string='AI Provider'
    )
    
    tokens_used = fields.Integer(
        string='Tokens Used',
        help='Number of tokens in this message'
    )
    
    create_date = fields.Datetime(
        string='Created',
        default=fields.Datetime.now
    )
    
    # Related fields for easy access
    user_id = fields.Many2one(
        related='conversation_id.user_id',
        string='User',
        store=True
    )
