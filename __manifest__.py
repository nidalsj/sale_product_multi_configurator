{
    'name': "Sale Multi Product Configurator",
    'version': '1.0',
    'license': 'LGPL-3',
    'summary': "Configure your products",
    'description': """
        Technical module:
        The main purpose is to override the sale_order view to allow configuring products in the SO form.

        It also enables the "optional products" feature.
    """,
    "author": "Nidal SJ",
    "website": "https://github.com/nidalsj",
    'depends': ['sale', 'sale_product_configurator'],
    'data': [
        'views/sale_order.xml',
        'views/product.xml'
    ],
    'assets': {
        'web.assets_backend': [
            'sale_product_multi_configurator/static/src/**/*',
        ],
    },
    "images": [
        "static/description/icon.png",
    ],
    'auto_install': False,
}