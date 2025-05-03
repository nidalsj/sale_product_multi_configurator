from odoo import fields, models


class SaleOrderLine(models.Model):
    _inherit = 'sale.order.line'
    
    length = fields.Float(string='Length')