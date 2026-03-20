# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

import base64
from odoo.tests import TransactionCase, tagged


@tagged('post_install', '-at_install')
class TestAIDocument(TransactionCase):
    """Test AI Document functionality"""

    def setUp(self):
        super().setUp()
        self.Document = self.env['ai.assistant.document']
        self.Provider = self.env['ai.assistant.provider']
        
        # Create a test provider
        self.provider = self.Provider.create({
            'name': 'Test Provider',
            'provider_type': 'ollama',
            'base_url': 'http://localhost:11434',
            'model': 'llama3.2',
        })

    def _create_test_file(self, content, filename):
        """Helper to create a test file"""
        return base64.b64encode(content.encode('utf-8'))

    def test_create_document(self):
        """Test creating a document"""
        file_data = self._create_test_file("Test content", "test.txt")
        
        document = self.Document.create({
            'filename': 'test.txt',
            'file': file_data,
            'document_type': 'other',
        })
        
        self.assertEqual(document.filename, 'test.txt')
        self.assertEqual(document.state, 'draft')

    def test_document_types(self):
        """Test different document types"""
        file_data = self._create_test_file("Test", "test.txt")
        
        for doc_type in ['invoice', 'business_card', 'contract', 'receipt', 'other']:
            document = self.Document.create({
                'filename': f'test_{doc_type}.txt',
                'file': file_data,
                'document_type': doc_type,
            })
            self.assertEqual(document.document_type, doc_type)

    def test_document_target_model(self):
        """Test setting target model"""
        file_data = self._create_test_file("Test", "test.txt")
        
        document = self.Document.create({
            'filename': 'test.txt',
            'file': file_data,
            'document_type': 'invoice',
            'target_model': 'account.move',
        })
        
        self.assertEqual(document.target_model, 'account.move')

    def test_extract_text_txt(self):
        """Test text extraction from TXT file"""
        content = "This is test content\nWith multiple lines"
        file_data = self._create_test_file(content, "test.txt")
        
        document = self.Document.create({
            'filename': 'test.txt',
            'file': file_data,
        })
        
        extracted = document._extract_text()
        self.assertEqual(extracted, content)

    def test_document_state_transitions(self):
        """Test document state transitions"""
        file_data = self._create_test_file("Test", "test.txt")
        
        document = self.Document.create({
            'filename': 'test.txt',
            'file': file_data,
        })
        
        self.assertEqual(document.state, 'draft')
        
        # Note: Processing requires a real AI provider connection
        # So we just test the state field exists and can be set
        document.write({'state': 'processing'})
        self.assertEqual(document.state, 'processing')
        
        document.write({'state': 'extracted'})
        self.assertEqual(document.state, 'extracted')

    def test_document_user_assignment(self):
        """Test document is assigned to current user"""
        file_data = self._create_test_file("Test", "test.txt")
        
        document = self.Document.create({
            'filename': 'test.txt',
            'file': file_data,
        })
        
        self.assertEqual(document.user_id, self.env.user)

    def test_extraction_prompt_building(self):
        """Test building extraction prompts"""
        file_data = self._create_test_file("Test", "test.txt")
        
        # Test invoice prompt
        document = self.Document.create({
            'filename': 'invoice.txt',
            'file': file_data,
            'document_type': 'invoice',
        })
        prompt = document._build_extraction_prompt("Test invoice content")
        self.assertIn('invoice', prompt.lower())
        self.assertIn('customer_name', prompt)
        self.assertIn('total_amount', prompt)
        
        # Test business card prompt
        document = self.Document.create({
            'filename': 'card.txt',
            'file': file_data,
            'document_type': 'business_card',
        })
        prompt = document._build_extraction_prompt("Test card content")
        self.assertIn('name', prompt)
        self.assertIn('email', prompt)
        self.assertIn('phone', prompt)
