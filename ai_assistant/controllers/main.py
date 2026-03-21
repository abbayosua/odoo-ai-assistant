# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

import json
import logging

from odoo import http
from odoo.http import request, content_disposition
from odoo.exceptions import AccessError, UserError

_logger = logging.getLogger(__name__)


class AIAssistantController(http.Controller):
    """Main API endpoints for AI Assistant"""
    
    @http.route('/ai/chat/send', type='json', auth='user', methods=['POST'])
    def chat_send(self, message, conversation_id=None, context=None):
        """Send a message to the AI and get a response"""
        # Check if user has access
        if not request.env.user.has_group('ai_assistant.group_ai_user'):
            raise AccessError('You do not have access to AI Assistant')
        
        # Get or create conversation
        if conversation_id:
            conversation = request.env['ai.assistant.conversation'].browse(conversation_id)
            if not conversation.exists() or conversation.user_id != request.env.user:
                conversation = request.env['ai.assistant.conversation'].create_conversation()
        else:
            conversation = request.env['ai.assistant.conversation'].create_conversation()
        
        # Update context if provided
        if context:
            conversation.write({
                'context_model': context.get('model'),
                'context_res_id': context.get('res_id'),
            })
        
        # Send message and get response
        result = conversation.send_message(message, context)
        
        return {
            'conversation_id': conversation.id,
            'response': result['response'],
            'message_id': result['assistant_message'],
        }
    
    @http.route('/ai/chat/history', type='json', auth='user', methods=['POST'])
    def chat_history(self, conversation_id=None, limit=20):
        """Get conversation history"""
        return request.env['ai.assistant.conversation'].get_history(conversation_id, limit)
    
    @http.route('/ai/autocomplete', type='json', auth='user', methods=['POST'])
    def autocomplete(self, text, model=None, field=None, context=None):
        """Get AI-powered autocomplete suggestions"""
        if not request.env.user.has_group('ai_assistant.group_ai_user'):
            raise AccessError('You do not have access to AI Assistant')
        
        # Get provider
        provider = request.env['ai.assistant.provider'].get_default_provider()
        
        if not provider:
            return {'suggestions': []}
        
        # Build prompt
        prompt = f"Complete or suggest improvements for the following text. Keep it short and relevant.\n\nText: {text}"
        
        if model and field:
            prompt = f"Complete this {field} field for a {model} record:\n\n{text}"
        
        try:
            response = provider.generate_response(prompt, {'system_prompt': 'You are an autocomplete assistant. Provide short, relevant completions.'})
            return {
                'suggestions': [response],
                'provider': provider.name,
            }
        except Exception as e:
            _logger.error('Autocomplete failed: %s', str(e))
            return {'suggestions': [], 'error': str(e)}
    
    @http.route('/ai/generate', type='json', auth='user', methods=['POST'])
    def generate_content(self, prompt, template_code=None, context=None):
        """Generate content using a template or custom prompt"""
        if not request.env.user.has_group('ai_assistant.group_ai_user'):
            raise AccessError('You do not have access to AI Assistant')
        
        provider = request.env['ai.assistant.provider'].get_default_provider()
        
        if not provider:
            raise UserError('No AI provider configured')
        
        # Use template if specified
        if template_code:
            template = request.env['ai.assistant.template'].search([('code', '=', template_code)], limit=1)
            if template:
                prompt = template.render(context or {})
        
        try:
            response = provider.generate_response(prompt)
            return {
                'content': response,
                'provider': provider.name,
            }
        except Exception as e:
            _logger.error('Content generation failed: %s', str(e))
            raise UserError(f'Failed to generate content: {str(e)}')
    
    @http.route('/ai/document/process', type='json', auth='user', methods=['POST'])
    def process_document(self, document_id):
        """Process a document with AI"""
        if not request.env.user.has_group('ai_assistant.group_ai_document'):
            raise AccessError('You do not have access to document processing')
        
        document = request.env['ai.assistant.document'].browse(document_id)
        
        if not document.exists():
            raise UserError('Document not found')
        
        try:
            document.action_process()
            return {
                'success': True,
                'extracted_text': document.extracted_text,
                'extracted_data': document.extracted_data,
                'state': document.state,
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'state': document.state,
            }
    
    @http.route('/ai/email/draft', type='json', auth='user', methods=['POST'])
    def draft_email(self, topic, recipient=None, tone='professional', key_points=None):
        """Draft an email using AI"""
        if not request.env.user.has_group('ai_assistant.group_ai_user'):
            raise AccessError('You do not have access to AI Assistant')
        
        provider = request.env['ai.assistant.provider'].get_default_provider()
        
        if not provider:
            raise UserError('No AI provider configured')
        
        prompt = f"""Write a {tone} email with the following details:
Topic: {topic}
{f'Recipient: {recipient}' if recipient else ''}
{f'Key points to include: {key_points}' if key_points else ''}

Please provide a subject line and the email body."""
        
        try:
            response = provider.generate_response(
                prompt,
                {'system_prompt': 'You are a professional email composition assistant. Write clear, effective emails.'}
            )
            return {'draft': response}
        except Exception as e:
            _logger.error('Email drafting failed: %s', str(e))
            raise UserError(f'Failed to draft email: {str(e)}')
    
    @http.route('/ai/translate', type='json', auth='user', methods=['POST'])
    def translate(self, text, target_language='en'):
        """Translate text using AI"""
        if not request.env.user.has_group('ai_assistant.group_ai_user'):
            raise AccessError('You do not have access to AI Assistant')
        
        provider = request.env['ai.assistant.provider'].get_default_provider()
        
        if not provider:
            raise UserError('No AI provider configured')
        
        language_names = {
            'en': 'English',
            'fr': 'French',
            'es': 'Spanish',
            'de': 'German',
            'pt': 'Portuguese',
            'it': 'Italian',
            'nl': 'Dutch',
            'zh': 'Chinese',
            'ja': 'Japanese',
            'ar': 'Arabic',
            'id': 'Indonesian',
        }
        
        language_name = language_names.get(target_language, target_language)
        
        prompt = f'Translate the following text to {language_name}. Only provide the translation, no explanations.\n\nText:\n{text}'
        
        try:
            response = provider.generate_response(prompt)
            return {'translation': response}
        except Exception as e:
            _logger.error('Translation failed: %s', str(e))
            raise UserError(f'Failed to translate: {str(e)}')
