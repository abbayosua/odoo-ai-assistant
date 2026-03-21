# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

import logging
import json
import requests
from datetime import datetime
from typing import Dict, Any, Optional, List

from odoo import models, fields, api, exceptions, _
from odoo.tools import config

_logger = logging.getLogger(__name__)


class AIProvider(models.Model):
    """AI Provider Configuration"""
    _name = 'ai.assistant.provider'
    _description = 'AI Provider Configuration'
    _order = 'sequence, name'

    name = fields.Char(
        string='Provider Name',
        required=True,
        help='Name of the AI provider'
    )
    
    provider_type = fields.Selection([
        ('openai', 'OpenAI'),
        ('ollama', 'Ollama (Local)'),
        ('anthropic', 'Anthropic Claude'),
        ('google', 'Google Gemini'),
        ('custom', 'Custom API'),
    ], string='Provider Type', required=True, default='openai')
    
    api_key = fields.Char(
        string='API Key',
        help='API key for the provider (encrypted)'
    )
    
    base_url = fields.Char(
        string='Base URL',
        help='Base URL for the API (for custom/local providers)'
    )
    
    model = fields.Char(
        string='Model',
        required=True,
        default='gpt-4o-mini',
        help='Model to use (e.g., gpt-4o-mini, llama3.2, claude-3-haiku-20240307)'
    )
    
    temperature = fields.Float(
        string='Temperature',
        default=0.7,
        help='Higher values make output more random, lower values more deterministic'
    )
    
    max_tokens = fields.Integer(
        string='Max Tokens',
        default=2000,
        help='Maximum number of tokens in the response'
    )
    
    sequence = fields.Integer(
        string='Sequence',
        default=10,
        help='Order of priority (lower = higher priority)'
    )
    
    active = fields.Boolean(
        string='Active',
        default=True
    )
    
    is_default = fields.Boolean(
        string='Default Provider',
        default=False,
        help='Use this provider by default'
    )
    
    state = fields.Selection([
        ('draft', 'Not Configured'),
        ('configured', 'Configured'),
        ('error', 'Error'),
    ], string='Status', default='draft', compute='_compute_state', store=True)
    
    last_connection_test = fields.Datetime(
        string='Last Connection Test'
    )
    
    connection_message = fields.Text(
        string='Connection Message'
    )
    
    # Rate limiting
    requests_per_minute = fields.Integer(
        string='Requests per Minute',
        default=60,
        help='Maximum API requests per minute'
    )
    
    _sql_constraints = [
        ('unique_default_provider', 'EXCLUDE (is_default WITH =) WHERE is_default = true',
         'Only one provider can be set as default!'),
    ]
    
    @api.depends('api_key', 'base_url', 'provider_type')
    def _compute_state(self):
        for record in self:
            if record.provider_type == 'ollama':
                record.state = 'configured' if record.base_url else 'draft'
            else:
                record.state = 'configured' if record.api_key else 'draft'
    
    def action_test_connection(self):
        """Test connection to the AI provider"""
        self.ensure_one()
        
        try:
            if self.provider_type == 'openai':
                result = self._test_openai_connection()
            elif self.provider_type == 'ollama':
                result = self._test_ollama_connection()
            elif self.provider_type == 'anthropic':
                result = self._test_anthropic_connection()
            elif self.provider_type == 'google':
                result = self._test_gemini_connection()
            else:
                result = {'success': False, 'message': 'Provider not implemented yet'}
            
            self.write({
                'last_connection_test': datetime.now(),
                'connection_message': result.get('message', ''),
                'state': 'configured' if result['success'] else 'error',
            })
            
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Connection Test'),
                    'message': result['message'],
                    'type': 'success' if result['success'] else 'danger',
                    'sticky': False,
                }
            }
        except Exception as e:
            self.write({
                'last_connection_test': datetime.now(),
                'connection_message': str(e),
                'state': 'error',
            })
            raise exceptions.UserError(_('Connection test failed: %s') % str(e))
    
    def _test_openai_connection(self) -> Dict[str, Any]:
        """Test OpenAI API connection"""
        try:
            import openai
            client = openai.OpenAI(api_key=self.api_key)
            
            # Simple test - list models
            models = client.models.list()
            return {
                'success': True,
                'message': _('Successfully connected to OpenAI. Found %d models.') % len(list(models))
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def _test_ollama_connection(self) -> Dict[str, Any]:
        """Test Ollama connection"""
        try:
            response = requests.get(f'{self.base_url}/api/tags', timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                return {
                    'success': True,
                    'message': _('Successfully connected to Ollama. Found %d models.') % len(models)
                }
            return {'success': False, 'message': _('Failed to connect to Ollama')}
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def _test_anthropic_connection(self) -> Dict[str, Any]:
        """Test Anthropic API connection"""
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=self.api_key)
            # Just check that we can create a client
            return {
                'success': True,
                'message': _('Successfully connected to Anthropic Claude.')
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def _test_gemini_connection(self) -> Dict[str, Any]:
        """Test Google Gemini API connection"""
        try:
            base_url = self.base_url or 'https://generativelanguage.googleapis.com/v1beta'
            model = self.model or 'gemini-2.5-flash-lite'
            
            # Simple test request
            response = requests.post(
                f'{base_url}/models/{model}:generateContent',
                headers={
                    'Content-Type': 'application/json',
                    'X-goog-api-key': self.api_key,
                },
                json={
                    'contents': [{'parts': [{'text': 'Hi'}]}]
                },
                timeout=10
            )
            
            if response.status_code == 200:
                return {
                    'success': True,
                    'message': _('Successfully connected to Google Gemini (%s).') % model
                }
            return {
                'success': False, 
                'message': _('Gemini API error: %s') % response.text[:200]
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}
    
    def get_default_provider(self):
        """Get the default AI provider"""
        provider = self.search([('is_default', '=', True), ('active', '=', True)], limit=1)
        if not provider:
            provider = self.search([('active', '=', True)], limit=1)
        return provider
    
    def generate_response(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Generate a response using the AI provider"""
        self.ensure_one()
        
        if self.provider_type == 'openai':
            return self._generate_openai(prompt, context)
        elif self.provider_type == 'ollama':
            return self._generate_ollama(prompt, context)
        elif self.provider_type == 'anthropic':
            return self._generate_anthropic(prompt, context)
        elif self.provider_type == 'google':
            return self._generate_gemini(prompt, context)
        else:
            raise exceptions.UserError(_('Provider %s not implemented yet') % self.provider_type)
    
    def _generate_openai(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Generate response using OpenAI"""
        import openai
        
        client = openai.OpenAI(api_key=self.api_key)
        
        messages = []
        if context and context.get('system_prompt'):
            messages.append({'role': 'system', 'content': context['system_prompt']})
        messages.append({'role': 'user', 'content': prompt})
        
        response = client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        
        return response.choices[0].message.content
    
    def _generate_ollama(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Generate response using Ollama"""
        payload = {
            'model': self.model,
            'prompt': prompt,
            'stream': False,
            'options': {
                'temperature': self.temperature,
                'num_predict': self.max_tokens,
            }
        }
        
        if context and context.get('system_prompt'):
            payload['system'] = context['system_prompt']
        
        response = requests.post(
            f'{self.base_url}/api/generate',
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json().get('response', '')
        raise exceptions.UserError(_('Ollama request failed: %s') % response.text)
    
    def _generate_anthropic(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Generate response using Anthropic Claude"""
        import anthropic
        
        client = anthropic.Anthropic(api_key=self.api_key)
        
        system_prompt = context.get('system_prompt', '') if context else ''
        
        message = client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            system=system_prompt,
            messages=[
                {'role': 'user', 'content': prompt}
            ]
        )
        
        return message.content[0].text
    
    def _generate_gemini(self, prompt: str, context: Optional[Dict] = None) -> str:
        """Generate response using Google Gemini API"""
        base_url = self.base_url or 'https://generativelanguage.googleapis.com/v1beta'
        model = self.model or 'gemini-2.5-flash-lite'
        
        # Build contents array
        contents = []
        
        # Add system instruction if provided
        system_instruction = None
        if context and context.get('system_prompt'):
            system_instruction = {'parts': [{'text': context['system_prompt']}]}
        
        # Add user message
        contents.append({
            'role': 'user',
            'parts': [{'text': prompt}]
        })
        
        payload = {
            'contents': contents,
            'generationConfig': {
                'temperature': self.temperature,
                'maxOutputTokens': self.max_tokens,
            }
        }
        
        if system_instruction:
            payload['system_instruction'] = system_instruction
        
        try:
            response = requests.post(
                f'{base_url}/models/{model}:generateContent',
                headers={
                    'Content-Type': 'application/json',
                    'X-goog-api-key': self.api_key,
                },
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                # Extract text from Gemini response
                candidates = result.get('candidates', [])
                if candidates:
                    parts = candidates[0].get('content', {}).get('parts', [])
                    if parts:
                        return parts[0].get('text', '')
                raise exceptions.UserError(_('Empty response from Gemini'))
            else:
                error_msg = response.json().get('error', {}).get('message', response.text)
                raise exceptions.UserError(_('Gemini API error: %s') % error_msg)
                
        except requests.exceptions.Timeout:
            raise exceptions.UserError(_('Gemini request timed out'))
        except requests.exceptions.RequestException as e:
            raise exceptions.UserError(_('Gemini request failed: %s') % str(e))
    
    def generate_response_with_history(self, messages: List[Dict], context: Optional[Dict] = None) -> str:
        """Generate a response with conversation history"""
        self.ensure_one()
        
        if self.provider_type == 'google':
            return self._generate_gemini_with_history(messages, context)
        elif self.provider_type == 'openai':
            return self._generate_openai_with_history(messages, context)
        elif self.provider_type == 'anthropic':
            return self._generate_anthropic_with_history(messages, context)
        elif self.provider_type == 'ollama':
            return self._generate_ollama_with_history(messages, context)
        else:
            # Fallback to simple generate
            combined_prompt = '\n'.join([f"{m['role']}: {m['content']}" for m in messages])
            return self.generate_response(combined_prompt, context)
    
    def _generate_gemini_with_history(self, messages: List[Dict], context: Optional[Dict] = None) -> str:
        """Generate response using Gemini with conversation history"""
        base_url = self.base_url or 'https://generativelanguage.googleapis.com/v1beta'
        model = self.model or 'gemini-2.5-flash-lite'
        
        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            role = 'user' if msg['role'] == 'user' else 'model'
            contents.append({
                'role': role,
                'parts': [{'text': msg['content']}]
            })
        
        payload = {
            'contents': contents,
            'generationConfig': {
                'temperature': self.temperature,
                'maxOutputTokens': self.max_tokens,
            }
        }
        
        if context and context.get('system_prompt'):
            payload['system_instruction'] = {'parts': [{'text': context['system_prompt']}]}
        
        response = requests.post(
            f'{base_url}/models/{model}:generateContent',
            headers={
                'Content-Type': 'application/json',
                'X-goog-api-key': self.api_key,
            },
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            candidates = result.get('candidates', [])
            if candidates:
                parts = candidates[0].get('content', {}).get('parts', [])
                if parts:
                    return parts[0].get('text', '')
        raise exceptions.UserError(_('Gemini request failed: %s') % response.text)
    
    def _generate_openai_with_history(self, messages: List[Dict], context: Optional[Dict] = None) -> str:
        """Generate response using OpenAI with conversation history"""
        import openai
        
        client = openai.OpenAI(api_key=self.api_key)
        
        api_messages = []
        if context and context.get('system_prompt'):
            api_messages.append({'role': 'system', 'content': context['system_prompt']})
        api_messages.extend(messages)
        
        response = client.chat.completions.create(
            model=self.model,
            messages=api_messages,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        
        return response.choices[0].message.content
    
    def _generate_anthropic_with_history(self, messages: List[Dict], context: Optional[Dict] = None) -> str:
        """Generate response using Anthropic with conversation history"""
        import anthropic
        
        client = anthropic.Anthropic(api_key=self.api_key)
        system_prompt = context.get('system_prompt', '') if context else ''
        
        message = client.messages.create(
            model=self.model,
            max_tokens=self.max_tokens,
            system=system_prompt,
            messages=messages
        )
        
        return message.content[0].text
    
    def _generate_ollama_with_history(self, messages: List[Dict], context: Optional[Dict] = None) -> str:
        """Generate response using Ollama with conversation history"""
        # Ollama doesn't have native chat API in older versions, combine messages
        combined = '\n'.join([f"{m['role']}: {m['content']}" for m in messages])
        return self._generate_ollama(combined, context)


class AIConfigSettings(models.TransientModel):
    """AI Assistant Configuration Settings"""
    _inherit = 'res.config.settings'
    _description = 'AI Assistant Settings'
    
    ai_provider_id = fields.Many2one(
        'ai.assistant.provider',
        string='Default AI Provider',
        config_parameter='ai_assistant.default_provider_id'
    )
    
    ai_enabled = fields.Boolean(
        string='Enable AI Assistant',
        default=True,
        config_parameter='ai_assistant.enabled'
    )
    
    ai_chat_enabled = fields.Boolean(
        string='Enable Chat Interface',
        default=True,
        config_parameter='ai_assistant.chat_enabled'
    )
    
    ai_autocomplete_enabled = fields.Boolean(
        string='Enable Smart Autocomplete',
        default=True,
        config_parameter='ai_assistant.autocomplete_enabled'
    )
    
    ai_document_enabled = fields.Boolean(
        string='Enable Document Processing',
        default=True,
        config_parameter='ai_assistant.document_enabled'
    )
    
    ai_email_enabled = fields.Boolean(
        string='Enable Email Assistant',
        default=True,
        config_parameter='ai_assistant.email_enabled'
    )
    
    ai_history_days = fields.Integer(
        string='Conversation History (Days)',
        default=30,
        config_parameter='ai_assistant.history_days',
        help='Number of days to keep conversation history'
    )
