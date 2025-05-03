/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { Product } from "@sale_product_configurator/js/product/product";

patch(Product, {
    props: {
        ...Product.props, 
        length: { type: Number, optional: true },
        tallyMode: { type: Boolean, optional: true }
    },
    defaultProps: {
        ...Product.defaultProps,
        tallyMode: false,
    },
});
