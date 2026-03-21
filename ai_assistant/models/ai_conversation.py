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
    
    @api.model
    def get_history(self, conversation_id=None, limit=20):
        """Get conversation history for the current user"""
        domain = [('user_id', '=', self.env.user.id), ('is_archived', '=', False)]
        
        if conversation_id:
            domain.append(('id', '=', conversation_id))
        
        conversations = self.search(domain, limit=limit, order='create_date desc')
        
        return [{
            'id': conv.id,
            'title': conv.title,
            'create_date': conv.create_date.isoformat() if conv.create_date else None,
            'context_model': conv.context_model,
            'context_res_id': conv.context_res_id,
            'message_count': conv.message_count,
            'messages': [{
                'id': msg.id,
                'role': msg.role,
                'content': msg.content,
                'create_date': msg.create_date.isoformat() if msg.create_date else None,
            } for msg in conv.message_ids],
        } for conv in conversations]
    
    @api.model
    def create_conversation(self, context_model=None, context_res_id=None, provider_id=None):
        """Create a new conversation"""
        values = {
            'user_id': self.env.user.id,
        }
        if context_model:
            values['context_model'] = context_model
        if context_res_id:
            values['context_res_id'] = context_res_id
        if provider_id:
            values['provider_id'] = provider_id
        
        return self.create(values)
    
    @api.model
    def get_or_create_for_context(self, model, res_id):
        """Get or create a conversation for a specific context"""
        domain = [
            ('user_id', '=', self.env.user.id),
            ('context_model', '=', model),
            ('context_res_id', '=', res_id),
            ('is_archived', '=', False),
        ]
        conversation = self.search(domain, limit=1)
        if not conversation:
            conversation = self.create_conversation(model, res_id)
        return conversation
    
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
        
        # Get conversation history for context
        history_messages = []
        previous_messages = self.message_ids.filtered(lambda m: m.role in ['user', 'assistant'])
        for msg in previous_messages:
            history_messages.append({
                'role': msg.role,
                'content': msg.content,
            })
        
        try:
            # Use history-aware generation if available
            if len(history_messages) > 1 and hasattr(provider, 'generate_response_with_history'):
                response = provider.generate_response_with_history(history_messages, ai_context)
            else:
                # Fallback to simple generation
                response = provider.generate_response(content, ai_context)
            
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
