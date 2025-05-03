/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { ProductList } from "@sale_product_configurator/js/product_list/product_list";

patch(ProductList, {
    props: {
        ...ProductList.props, // Keep existing props
        tallyMode: { type: Boolean, optional: true }, // Correctly define as an optional Boolean
    },
    defaultProps: {
        ...ProductList.defaultProps, // Keep existing default props
        tallyMode: false, // Set default value to false
    },
});