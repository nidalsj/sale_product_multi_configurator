from odoo import models, api, fields


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    allow_tally_mode = fields.Boolean(default=False)