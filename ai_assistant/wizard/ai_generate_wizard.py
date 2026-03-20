# -*- coding: utf-8 -*-
# Part of Odoo AI Assistant. See LICENSE file for full copyright and licensing details.

from odoo import models, fields, api, _


class AIGenerateWizard(models.TransientModel):
    """Wizard for AI content generation"""
    _name = 'ai.assistant.generate.wizard'
    _description = 'AI Content Generation Wizard'

    model = fields.Char(
        string='Model',
        required=True
    )
    
    res_id = fields.Integer(
        string='Record ID'
    )
    
    field_name = fields.Char(
        string='Field Name'
    )
    
    template_id = fields.Many2one(
        'ai.assistant.template',
        string='Template'
    )
    
    prompt = fields.Text(
        string='Custom Prompt',
        help='Enter a custom prompt or select a template'
    )
    
    context = fields.Text(
        string='Context',
        help='Additional context for the AI'
    )
    
    generated_content = fields.Text(
        string='Generated Content',
        readonly=True
    )
    
    state = fields.Selection([
        ('input', 'Input'),
        ('output', 'Output'),
    ], default='input')
    
    @api.onchange('template_id')
    def _onchange_template_id(self):
        if self.template_id:
            self.prompt = self.template_id.prompt
    
    def action_generate(self):
        """Generate content using AI"""
        provider = self.env['ai.assistant.provider'].get_default_provider()
        
        if not provider:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Error'),
                    'message': _('No AI provider configured. Please configure an AI provider in Settings.'),
                    'type': 'danger',
                }
            }
        
        # Build prompt
        prompt = self.prompt
        
        if self.model and self.res_id:
            record = self.env[self.model].browse(self.res_id)
            if record.exists():
                prompt = prompt.replace('{record}', record.display_name)
                
                # Add context about the record
                if '{fields}' in prompt:
                    field_values = []
                    for field in record._fields.values():
                        if field.name not in ['id', 'create_date', 'write_date', '__last_update']:
                            try:
                                value = record[field.name]
                                if value:
                                    field_values.append(f"{field.string}: {value}")
                            except Exception:
                                pass
                    prompt = prompt.replace('{fields}', '\n'.join(field_values[:10]))  # Limit to 10 fields
        
        try:
            ai_context = {}
            if self.template_id and self.template_id.system_prompt:
                ai_context['system_prompt'] = self.template_id.system_prompt
            
            response = provider.generate_response(prompt, ai_context)
            
            self.write({
                'generated_content': response,
                'state': 'output',
            })
            
            return {
                'type': 'ir.actions.act_window',
                'res_model': self._name,
                'res_id': self.id,
                'view_mode': 'form',
                'target': 'new',
            }
        except Exception as e:
            return {
                'type': 'ir.actions.client',
                'tag': 'display_notification',
                'params': {
                    'title': _('Generation Failed'),
                    'message': str(e),
                    'type': 'danger',
                }
            }
    
    def action_apply(self):
        """Apply the generated content to the field"""
        if self.model and self.res_id and self.field_name:
            self.env[self.model].browse(self.res_id).write({
                self.field_name: self.generated_content,
            })
        
        return {'type': 'ir.actions.act_window_close'}
    
    def action_regenerate(self):
        """Regenerate content"""
        self.state = 'input'
        return {
            'type': 'ir.actions.act_window',
            'res_model': self._name,
            'res_id': self.id,
            'view_mode': 'form',
            'target': 'new',
        }
