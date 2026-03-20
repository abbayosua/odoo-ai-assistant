# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

import base64
from odoo import models, fields, api, _


class AIImportWizard(models.TransientModel):
    """Wizard for AI-assisted document import"""
    _name = 'ai.assistant.import.wizard'
    _description = 'AI Import Wizard'

    file = fields.Binary(
        string='File',
        required=True
    )
    
    filename = fields.Char(
        string='Filename'
    )
    
    document_type = fields.Selection([
        ('invoice', 'Invoice'),
        ('business_card', 'Business Card'),
        ('contract', 'Contract'),
        ('receipt', 'Receipt'),
        ('other', 'Other'),
    ], string='Document Type', default='other', required=True)
    
    target_model = fields.Selection([
        ('res.partner', 'Contact'),
        ('account.move', 'Invoice/Bill'),
        ('product.product', 'Product'),
        ('hr.employee', 'Employee'),
    ], string='Create as', default='res.partner')
    
    extracted_text = fields.Text(
        string='Extracted Text',
        readonly=True
    )
    
    extracted_data = fields.Json(
        string='Extracted Data',
        readonly=True
    )
    
    preview_html = fields.Html(
        string='Preview',
        compute='_compute_preview'
    )
    
    state = fields.Selection([
        ('upload', 'Upload'),
        ('preview', 'Preview'),
        ('done', 'Done'),
    ], default='upload')
    
    created_record_id = fields.Integer(
        string='Created Record ID'
    )
    
    @api.depends('extracted_data', 'target_model')
    def _compute_preview(self):
        """Generate preview HTML"""
        for wizard in self:
            if not wizard.extracted_data:
                wizard.preview_html = '<p class="text-muted">No data extracted yet</p>'
                continue
            
            data = wizard.extracted_data if isinstance(wizard.extracted_data, dict) else {}
            
            html = '<table class="table table-striped"><tbody>'
            for key, value in data.items():
                if key not in ['raw_response', 'id']:
                    html += f'<tr><th>{key.replace("_", " ").title()}</th><td>{value or "-"}</td></tr>'
            html += '</tbody></table>'
            
            wizard.preview_html = html
    
    def action_process(self):
        """Process the uploaded document"""
        if not self.file:
            return
        
        # Create document record
        document = self.env['ai.assistant.document'].create({
            'filename': self.filename or 'document',
            'file': self.file,
            'document_type': self.document_type,
            'target_model': self.target_model,
        })
        
        # Process document
        document.action_process()
        
        # Update wizard
        self.write({
            'extracted_text': document.extracted_text,
            'extracted_data': document.extracted_data,
            'state': 'preview',
        })
        
        # Store document reference
        self._context = dict(self._context, active_document_id=document.id)
        
        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }
    
    def action_import(self):
        """Import the extracted data as a record"""
        document = self.env['ai.assistant.document'].search([
            ('filename', '=', self.filename),
            ('user_id', '=', self.env.user.id),
        ], limit=1, order='create_date desc')
        
        if document:
            result = document.action_import()
            
            self.write({
                'state': 'done',
                'created_record_id': document.created_record_id,
            })
            
            if result:
                return result
        
        return {'type': 'ir.actions.act_window_close'}
    
    def action_new_document(self):
        """Process another document"""
        self.write({
            'file': False,
            'filename': False,
            'extracted_text': False,
            'extracted_data': False,
            'state': 'upload',
        })
        
        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }
