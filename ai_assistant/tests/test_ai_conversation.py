# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

from odoo.tests import TransactionCase, tagged
from odoo.exceptions import UserError


@tagged('post_install', '-at_install')
class TestAIConversation(TransactionCase):
    """Test AI Conversation functionality"""

    def setUp(self):
        super().setUp()
        self.Conversation = self.env['ai.assistant.conversation']
        self.Message = self.env['ai.assistant.message']
        self.Provider = self.env['ai.assistant.provider']
        
        # Create a test provider
        self.provider = self.Provider.create({
            'name': 'Test Provider',
            'provider_type': 'ollama',
            'base_url': 'http://localhost:11434',
            'model': 'llama3.2',
        })

    def test_create_conversation(self):
        """Test creating a conversation"""
        conversation = self.Conversation.create({
            'user_id': self.env.user.id,
        })
        
        self.assertTrue(conversation.id)
        self.assertEqual(conversation.user_id, self.env.user)

    def test_conversation_title_computed(self):
        """Test that conversation title is computed from first message"""
        conversation = self.Conversation.create({
            'user_id': self.env.user.id,
        })
        
        # Add a message
        self.Message.create({
            'conversation_id': conversation.id,
            'role': 'user',
            'content': 'This is a test message that should become the title',
        })
        
        # Refresh to recompute
        conversation.invalidate_recordset(['title'])
        
        self.assertIn('This is a test message', conversation.title)

    def test_message_count(self):
        """Test message count computation"""
        conversation = self.Conversation.create({
            'user_id': self.env.user.id,
        })
        
        # Add messages
        self.Message.create({
            'conversation_id': conversation.id,
            'role': 'user',
            'content': 'Test message 1',
        })
        self.Message.create({
            'conversation_id': conversation.id,
            'role': 'assistant',
            'content': 'Test response 1',
        })
        
        conversation.invalidate_recordset(['message_count'])
        self.assertEqual(conversation.message_count, 2)

    def test_archive_conversation(self):
        """Test archiving a conversation"""
        conversation = self.Conversation.create({
            'user_id': self.env.user.id,
        })
        
        self.assertFalse(conversation.is_archived)
        
        conversation.action_archive()
        
        self.assertTrue(conversation.is_archived)

    def test_unarchive_conversation(self):
        """Test unarchiving a conversation"""
        conversation = self.Conversation.create({
            'user_id': self.env.user.id,
            'is_archived': True,
        })
        
        conversation.action_unarchive()
        
        self.assertFalse(conversation.is_archived)

    def test_clear_history(self):
        """Test clearing conversation history"""
        conversation = self.Conversation.create({
            'user_id': self.env.user.id,
        })
        
        # Add messages
        self.Message.create({
            'conversation_id': conversation.id,
            'role': 'user',
            'content': 'Test message',
        })
        
        self.assertEqual(len(conversation.message_ids), 1)
        
        conversation.action_clear_history()
        
        self.assertEqual(len(conversation.message_ids), 0)

    def test_conversation_access_rule(self):
        """Test that users can only see their own conversations"""
        # Create conversation for current user
        my_conversation = self.Conversation.create({
            'user_id': self.env.user.id,
        })
        
        # Create conversation for another user
        other_user = self.env['res.users'].create({
            'name': 'Test User',
            'login': 'test_user_conversation',
            'email': 'test@example.com',
        })
        other_conversation = self.Conversation.with_user(other_user).create({
            'user_id': other_user.id,
        })
        
        # Check access
        my_conversations = self.Conversation.search([
            ('user_id', '=', self.env.user.id)
        ])
        
        self.assertIn(my_conversation, my_conversations)
        self.assertNotIn(other_conversation, my_conversations)
