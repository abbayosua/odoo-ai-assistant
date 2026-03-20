# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestAIProvider(TransactionCase):
    """Test AI Provider functionality"""

    def setUp(self):
        super().setUp()
        self.Provider = self.env['ai.assistant.provider']

    def test_create_provider_openai(self):
        """Test creating an OpenAI provider"""
        provider = self.Provider.create({
            'name': 'Test OpenAI',
            'provider_type': 'openai',
            'api_key': 'sk-test-key',
            'model': 'gpt-4o-mini',
        })
        
        self.assertEqual(provider.name, 'Test OpenAI')
        self.assertEqual(provider.provider_type, 'openai')
        self.assertEqual(provider.state, 'configured')

    def test_create_provider_ollama(self):
        """Test creating an Ollama provider"""
        provider = self.Provider.create({
            'name': 'Test Ollama',
            'provider_type': 'ollama',
            'base_url': 'http://localhost:11434',
            'model': 'llama3.2',
        })
        
        self.assertEqual(provider.name, 'Test Ollama')
        self.assertEqual(provider.provider_type, 'ollama')
        self.assertEqual(provider.state, 'configured')

    def test_default_provider(self):
        """Test getting the default provider"""
        # Create a provider and set as default
        provider = self.Provider.create({
            'name': 'Default Provider',
            'provider_type': 'openai',
            'api_key': 'sk-test-key',
            'model': 'gpt-4o-mini',
            'is_default': True,
        })
        
        default = self.Provider.get_default_provider()
        self.assertEqual(default, provider)

    def test_provider_uniqueness(self):
        """Test that only one provider can be default"""
        provider1 = self.Provider.create({
            'name': 'Provider 1',
            'provider_type': 'openai',
            'api_key': 'sk-test-key-1',
            'model': 'gpt-4o-mini',
            'is_default': True,
        })
        
        # Creating another default should work (old one loses default status)
        provider2 = self.Provider.create({
            'name': 'Provider 2',
            'provider_type': 'openai',
            'api_key': 'sk-test-key-2',
            'model': 'gpt-4o',
            'is_default': True,
        })
        
        # Refresh and check
        provider1.refresh()
        self.assertFalse(provider1.is_default)
        self.assertTrue(provider2.is_default)

    def test_provider_temperature_default(self):
        """Test default temperature value"""
        provider = self.Provider.create({
            'name': 'Test Provider',
            'provider_type': 'openai',
            'api_key': 'sk-test-key',
            'model': 'gpt-4o-mini',
        })
        
        self.assertEqual(provider.temperature, 0.7)

    def test_provider_max_tokens_default(self):
        """Test default max_tokens value"""
        provider = self.Provider.create({
            'name': 'Test Provider',
            'provider_type': 'openai',
            'api_key': 'sk-test-key',
            'model': 'gpt-4o-mini',
        })
        
        self.assertEqual(provider.max_tokens, 2000)
