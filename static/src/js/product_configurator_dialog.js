/** @odoo-module **/

import { ProductConfiguratorDialog } from "@sale_product_configurator/js/product_configurator_dialog/product_configurator_dialog";
import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { SaleOrderLineProductField } from "@sale/js/sale_product_field";
import { serializeDateTime } from "@web/core/l10n/dates";
import { useRef } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { Component, onWillStart, useState, useSubEnv, useEffect } from "@odoo/owl";

patch(ProductConfiguratorDialog.prototype, {

    setup() {
        super.setup(...arguments);

        this.state = useState({
            products: [],
            optionalProducts: [],
            extraProducts: [],
            quantityList: [],
            siNo: 0,
            tallyMode: false
        });
        this.orm = useService("orm");

        this.removeQuantity = this.removeQuantity.bind(this);
        this.handleTabOnLength = this.handleTabOnLength.bind(this);
        this.rootRef = useRef("root");

        onWillStart(async () => {
            const { products, optional_products } = await this._loadData(this.props.edit);
            this.state.products = products;
            this.state.optionalProducts = optional_products;
            this.state.quantityList = [];
            for (const customValue of this.props.customAttributeValues) {
                this._updatePTAVCustomValue(
                    this.env.mainProductTmplId,
                    customValue.ptavId,
                    customValue.value
                );
            }
            this._checkExclusions(this.state.products[0]);
            if (this.state.products.length > 0){
                let tallyMode = await this.orm.searchRead(
                    "product.template",
                    [["id", "=", this.state.products[0].product_tmpl_id]],
                    ["allow_tally_mode"]
                );
                this.state.tallyMode = tallyMode[0].allow_tally_mode
            }
        });

        useEffect(
            () => {
                if (this.state.tallyMode && this.state.quantityList.length > 0 && this.rootRef.el) {
                    const inputs = this.rootRef.el.querySelectorAll('input[name="extra_quantity"]');
                    const lastInput = inputs[inputs.length - 1];
                    if (lastInput) {
                        lastInput.focus();
                    }
                }
            },
            () => [this.state.quantityList.length]
        );
    },

    async onConfirm() {
        if (!this.isPossibleConfiguration()) return;
        // if (!this.isTallyMode()) return;
        // Create the products with dynamic attributes
        for (const product of this.state.products) {
            if (
                !product.id &&
                product.attribute_lines.some(ptal => ptal.create_variant === "dynamic")
            ) {
                const productId = await this._createProduct(product);
                product.id = parseInt(productId);
            }
        }
        this.state.quantityList.forEach(quantityItem => {
            let product = this.state.products.find(
                p => p.product_tmpl_id === this.env.mainProductTmplId
            )
            if (product) {
                const quantity = Number(quantityItem.quantity) || 0 // Extract quantity from quantityItem
                const length = Number(quantityItem.length) || 0 // Extract quantity from quantityItem
        
                // Update the product's quantity
                const updatedProduct = { 
                    ...product, 
                    quantity: quantity,
                    length: length
                };
        
                // Append the updated product to extraProducts
                this.state.extraProducts = [...this.state.extraProducts, updatedProduct];
            }
        });
        // Find the product
        const mainProduct = this.state.products.find(
            p => p.product_tmpl_id === this.env.mainProductTmplId
        );
        if (this.state.tallyMode && this.state.extraProducts.length > 0){
            // Update quantity if product exists
            if (mainProduct) {
                mainProduct.quantity = this.state.extraProducts[0].quantity; // Set desired quantity value
                mainProduct.length = this.state.extraProducts[0].length; // Set desired quantity value
            }
            // Remove the first item from ExtraProducts
            this.state.extraProducts.shift(); // Removes the first item
        }
        await this.props.save(
            mainProduct,
            this.state.products.filter(
                p => p.product_tmpl_id !== this.env.mainProductTmplId
            ),
            this.state.extraProducts
        );
        this.props.close();
    },

    onButtonClick() {
        this.state.siNo += 1;
        const newQuantityItem = {
            id: this.state.siNo,
            quantity: "",
            siNo: this.state.siNo,
            length: ""
        };
        this.state.quantityList.push(newQuantityItem);
        this.render();
    },

    removeQuantity(quantityId) {
        // Filter out the item with the specified id
        const updatedQuantityList = this.state.quantityList.filter(item => item.id !== quantityId);
    
        // Reorder the sequence numbers
        updatedQuantityList.forEach((item, index) => {
            item.siNo = index + 1;
        });
    
        // Update the state
        this.state.quantityList = updatedQuantityList;
        this.state.siNo = updatedQuantityList.length; // Update the siNo counter
        this.render();
    },

    isTallyMode() {
        return [...this.state.products].every(
            p => this.isTallyMode(p)
        );
    },

    _isTallyModeProduct(product) {
        this.state.tallyMode = true;
        return product.product_tmpl_id.allow_tally_mode === true;
    },

    handleTabOnLength(ev, quantity) {
        if (ev.key === "Tab") {
            const lastQuantityItem = this.state.quantityList[this.state.quantityList.length - 1];
            if (quantity.id === lastQuantityItem.id) {
                this.onButtonClick();
            }
        }
    },

});
