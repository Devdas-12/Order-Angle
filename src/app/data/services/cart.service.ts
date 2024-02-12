import { Injectable } from '@angular/core';
import { apiColletions } from 'src/app/core/constant/api-collection';
import { DELIVERY_TYPE_CONSTANT } from 'src/app/core/constant/constant';
import { Cart, CartData, ItemModel, cartProductsModel, cartSpecificationGroupsModel } from 'src/app/core/models/cart.model';
import { Helper } from 'src/app/shared/helper';
import { ApiService, ResponseModel } from './api.service';
import { BehaviorSubject, Observable } from 'rxjs';

export enum DELIVERY_TYPE {
    ZERO, DELIVERY, COURIER, TABLE, TAXI, SERVICE, APPOINMENT
}

@Injectable({
    providedIn: 'root',
})
export class CartService {

    public _user_cart: Cart = new Cart();
    public _edit_cart: Cart = new Cart();
    cart_delivery_type: number = 1;
    cart_unique_token = '';
    currency: any;
    store_taxes: any;
    public cartSubject = new BehaviorSubject<Cart>(new Cart());
    cartObservable: Observable<Cart> = this.cartSubject.asObservable();
    cart_id: any;
    store_details: any;
    userDetails: any;

    constructor(private _helper: Helper, private _api: ApiService) {
        if (localStorage.getItem('userDetails')) {
            this.userDetails = JSON.parse(localStorage.getItem('userDetails') || '')
        }

        if (localStorage.getItem('store_data')) {
            this.store_details = JSON.parse(localStorage.getItem('store_data') || '')
        }
    }

    get user_cart(): Cart {
        return this._user_cart;
    }

    set user_cart(cart: Cart) {
        this._user_cart = cart;
    }

    async get_cart(data: any): Promise<ResponseModel> {
        try {
            let json: any = {
                user_id: this.userDetails?.userData?._id || '',
                server_token: this.userDetails?.userData?.server_token || '',
                cart_unique_token: this.cart_unique_token,
                cart_id: this._user_cart.cart_data.cart_id,
                is_show_success_toast: false
            }
            if (data) {
                json.notification = data.notification

            }

            const response = await this._api.post({ url: apiColletions.get_cart, parameters: json })

            if (response.data.success) {
                this._user_cart.is_tax_inclusive = response.data.is_tax_included
                // this._user_cart.is_use_item_tax = response.data.is_use_item_tax
                this.store_taxes = response.data.tax_details
                response.data.cart.order_details.forEach((cart_data_res: any) => {
                    cart_data_res.items.forEach((item: any) => {
                        let specification_price = 0
                        let index: any;
                        item.specifications.forEach((spec: any, i: any) => {
                            index = item.item_details.specifications.findIndex((i: any) => i.unique_id == spec.unique_id);

                            if (index != -1) {
                                if (item.item_details.specifications[index].is_deleted != true) {
                                    let sp_index;
                                    spec.list.forEach((s: any, i1: any) => {
                                        sp_index = item.item_details.specifications[index].list.findIndex((i: any) => i._id == s._id)
                                        if (sp_index != -1) {
                                            if (item.item_details.specifications[index].list[sp_index].is_deleted == true) {
                                                spec.list.splice(i1, 1)
                                            }
                                        }
                                    })
                                    specification_price = specification_price + spec.price
                                }

                                else {
                                    item.specifications.splice(i, 1)
                                }
                            }
                        });

                        let total_item_price: any;
                        if (this._helper.is_table_booking) {
                            total_item_price = item.item_details.is_dine_in_price + specification_price
                        }
                        if (this._user_cart.is_user_pick_up_order) {
                            total_item_price = item.item_details.is_pickup_price + specification_price
                        }

                        if (this._user_cart.is_use_item_tax) {
                            let total_tax = 0
                            item.tax_details.forEach((tax: any) => {
                                let tax_index = this._user_cart.total_taxes.findIndex(x => x._id === tax._id)

                                if (this._user_cart.is_tax_inclusive) {
                                    total_tax = (total_item_price - (100 * total_item_price) / (100 + tax.tax))
                                } else {
                                    total_tax = total_item_price * tax.tax * 0.01
                                }

                                tax.tax_amount = total_tax
                                if (tax_index === -1) {
                                    this._user_cart.total_taxes.push(tax)
                                } else {
                                    this._user_cart.total_taxes[tax_index].tax_amount = this._user_cart.total_taxes[tax_index].tax_amount + total_tax
                                }
                            })
                        } else {
                            let total_tax = 0
                            // this.store_taxes.forEach((tax : any) => {

                            //     let tax_index = this._user_cart.total_taxes.findIndex(x => x._id === tax._id)

                            //     if (this._user_cart.is_tax_inclusive) {
                            //         total_tax = (total_item_price - (100 * total_item_price) / (100 + tax))
                            //     } else {
                            //         total_tax = total_item_price * tax.tax * 0.01
                            //     }
                            //     tax.tax_amount = total_tax
                            //     if (tax_index === -1) {
                            //         this._user_cart.total_taxes.push(tax)
                            //     } else {
                            //         this._user_cart.total_taxes[tax_index].tax_amount = this._user_cart.total_taxes[tax_index].tax_amount + total_tax
                            //     }
                            // });
                        }
                    });
                })

                return response;
            } else {
                return response;
            }
        } catch (err) {
            return { success: false, data: null, code: '' };
        }
    }

    private calculateTotalAmount() {
        let total = 0;
        let total_item_tax = 0;
        this._user_cart.cart_data.cart.forEach((product) => {
            product.items.forEach((item) => {
                total = total + item.total_item_price;
                total_item_tax = total_item_tax + item.total_item_tax;
            })
        });
        this._user_cart.total_cart_amount = total;
        this._user_cart.total_item_tax = total_item_tax;
        if (this._user_cart.cart_data.total_item == 0) {
            this.clear_cart();
        } else {
            setTimeout(() => {
                this.add_to_cart(this.cart_delivery_type);
            }, 1000)
        }
    }

    add_to_cart(delivery_type: DELIVERY_TYPE = DELIVERY_TYPE.DELIVERY): Promise<boolean> {
        if (this._helper.is_table_booking || this._helper.is_qr_code_scanned) {
            delivery_type = DELIVERY_TYPE.TABLE
        }
        var city_id = this._helper.city_id
        var country_id = this._helper.country_id
        let parameters = {
            user_id: this.userDetails?.userData?._id || '',
            server_token: this.userDetails?.userData?.server_token || '',
            user_type: null,
            cart_id: this._user_cart.cart_data.cart_id,
            store_id: this._user_cart.cart_data.selectedStoreId,
            city_id,
            country_id,
            cart_unique_token: this.cart_unique_token,
            order_details: this._user_cart.cart_data.cart,
            destination_addresses: this._user_cart.cart_data.destination_addresses,
            pickup_addresses: this._user_cart.cart_data.pickup_addresses,
            total_cart_price: this._user_cart.total_cart_amount,
            total_item_tax: this._user_cart.total_item_tax,
            tax_details: this._user_cart.total_taxes,
            is_use_item_tax: this._user_cart.is_use_item_tax,
            is_tax_included: this._user_cart.is_tax_inclusive,
            table_no: this._helper.selected_table,
            booking_type: this._user_cart.booking_type,
            delivery_type: delivery_type,
            is_table_booking: this._helper.is_table_booking,
            table_id: '',
            order_start_at: this._user_cart.schedule_date.getTime(),
            order_start_at2: this._user_cart.schedule_date1.getTime()
        }

        if (this.userDetails?.userData != '') {
            parameters.user_id = this.userDetails?.userData?._id || '';
            parameters.server_token = this.userDetails?.userData?.server_token || '';
            parameters.user_type = this.userDetails?.userData?.user_type || '';
        }

        if (delivery_type === DELIVERY_TYPE.TABLE) {
            parameters.table_id = this._user_cart.table_id;
            parameters.order_start_at = this._user_cart.schedule_date.getTime();
            parameters.order_start_at2 = this._user_cart.schedule_date1.getTime();
        }


        return new Promise((resolve, reject) => {
            try {
                this._api.post({ url: apiColletions.add_item_in_cart, parameters }).then((response) => {
                    if (response.success) {
                        this._user_cart.cart_data.cart_id = response.data.cart_id;
                        this._user_cart.cart_data.city_id = response.data.city_id;
                        if (delivery_type === DELIVERY_TYPE.DELIVERY || delivery_type === DELIVERY_TYPE.TABLE) {
                            this.update_local_cart('');
                        }
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                })
            } catch {
                resolve(false)
            }
        })

    }

    async update_local_cart(data: any): Promise<boolean> {
        try {
            let cartProductItems: ItemModel = new ItemModel();
            let cartProducts: cartProductsModel = new cartProductsModel();
            let cartSpecificationGroups: cartSpecificationGroupsModel = new cartSpecificationGroupsModel();

            const response = await this.get_cart(data)

            this._user_cart.total_item_tax = 0
            this._user_cart.cart_data.cart = [];
            this._user_cart.cart_data.total_item = 0;
            this._user_cart.total_cart_amount = 0;
            this._user_cart.cart_main_item = [];
            // this._user_cart.total_taxes = []

            if (response.data.success) {
                let res_data = response.data;
                this.currency = res_data.currency;
                this._user_cart.booking_type = res_data.booking_type
                if (this._user_cart.booking_type == 2) {
                    this.user_cart.is_with_table_order = true
                    this._helper.is_table_booking = true
                    this.user_cart.is_schedule_order = true
                    this.user_cart.no_of_persons = res_data.no_of_persons
                }


                // this._user_cart.store_location = res_data.location;
                this.user_cart.table_no = res_data.table_no
                this._helper.is_table_booking = res_data.is_table_booking;
                this._user_cart.is_table_booking = res_data.is_table_booking;
                this._user_cart.cart_data.is_admin_services = res_data.is_admin_services;
                this._user_cart.cart_data.cart_id = res_data.cart_id;
                this._user_cart.cart_data.city_id = res_data.city_id;
                this._user_cart.cart_data.destination_addresses = res_data.destination_addresses;
                this._user_cart.cart_data.pickup_addresses = res_data.pickup_addresses;
                this._user_cart.cart_data.selectedStoreId = res_data.store_id;
                let cart_data_res = res_data.cart.order_details;
                this.store_taxes = res_data.tax_details
                this.cart_delivery_type = res_data.delivery_type;
                cart_data_res.forEach((cart_product: any) => {

                    cartProducts = JSON.parse(JSON.stringify(cartProducts));
                    cartProducts.product_id = cart_product.product_detail._id;
                    cartProducts.product_name = cart_product.product_detail.name;
                    cartProducts.unique_id = cart_product.product_detail.unique_id;
                    cartProducts.total_item_tax = 0;
                    let item_array: any = [];
                    let itemPriceTotal = 0;
                    cart_product.items.forEach((cart_item: any) => {
                        this._user_cart.cart_main_item.push(cart_item.item_details);
                        cartProductItems = JSON.parse(JSON.stringify(cartProductItems));
                        cartProductItems.item_id = cart_item.item_details._id;
                        cartProductItems.unique_id = cart_item.item_details.unique_id;
                        cartProductItems.item_name = cart_item.item_details.name;
                        cartProductItems.quantity = cart_item.quantity;
                        cartProductItems.image_url = cart_item.item_details.image_url;
                        cartProductItems.details = cart_item.item_details.details;
                        if (this._helper.is_table_booking) {
                            cartProductItems.item_price = cart_item.item_details.is_dine_in_price;
                        }
                        if (this._user_cart.is_user_pick_up_order) {
                            cartProductItems.item_price = cart_item.item_details.is_pickup_price;
                        }

                        cartProductItems.tax = cart_item.tax;
                        cartProductItems.dietary_tags = cart_item.item_details.dietary_tags;

                        cartProductItems.note_for_item = cart_item.note_for_item;
                        let specificationPriceTotal = 0;
                        let specification_group_array: any = [];
                        cart_item.specifications.forEach((specification_group: any) => {
                            cartSpecificationGroups = JSON.parse(JSON.stringify(cartSpecificationGroups));
                            cartSpecificationGroups.name = specification_group.name;
                            cartSpecificationGroups.type = specification_group.type;
                            cartSpecificationGroups.unique_id = specification_group.unique_id;
                            cartSpecificationGroups.range = specification_group.range;
                            cartSpecificationGroups.max_range = specification_group.max_range;
                            cartSpecificationGroups.modifier_id = specification_group.modifier_id;
                            cartSpecificationGroups.modifier_group_id = specification_group.modifier_group_id;
                            cartSpecificationGroups.is_parent_associate = specification_group.is_parent_associate;
                            cartSpecificationGroups.is_associated = specification_group.is_associated;
                            let specification_array: any = [];
                            let specification_price = 0;
                            specification_group.list.forEach((specification: any) => {
                                cart_item.item_details.specifications.forEach((new_specification_group: any) => {
                                    if (specification_group.unique_id == new_specification_group.unique_id && specification_group.modifier_id === new_specification_group.modifier_id) {
                                        new_specification_group.list.forEach((new_specification: any) => {
                                            if (specification.unique_id == new_specification.unique_id) {
                                                specification.price = new_specification.price;
                                                specification_price = specification_price + new_specification.price * specification.quantity;
                                                specification_array.push(specification);
                                                specificationPriceTotal = specificationPriceTotal + (new_specification.price * specification.quantity);
                                            }
                                        })
                                    }
                                })

                            });
                            cartSpecificationGroups.price = specification_price;
                            cartSpecificationGroups.list = specification_array;
                            specification_group_array.push(cartSpecificationGroups);

                        });

                        cartProductItems.specifications = specification_group_array;
                        cartProductItems.total_specification_price = specificationPriceTotal;
                        if (this._helper.is_table_booking) {
                            cartProductItems.total_item_price = (specificationPriceTotal + cart_item.item_details.is_dine_in_price) * cart_item.quantity;
                        }
                        if (this._user_cart.is_user_pick_up_order) {
                            cartProductItems.total_item_price = (specificationPriceTotal + cart_item.item_details.is_pickup_price) * cart_item.quantity;
                        }

                        if (this._user_cart.is_use_item_tax) {

                            cart_item.tax_details.forEach((tax: any) => {
                                let index = this._user_cart.total_taxes.findIndex(x => x._id === tax._id)
                                let tax_amount: Number = 0
                                if (this._helper.is_tax_inclusive) {
                                    tax_amount = ((cartProductItems.total_item_price) - (100 * Number(cartProductItems.total_item_price)) / (100 + Number(tax.tax * cartProductItems.quantity)))
                                } else {
                                    tax_amount = parseInt((Number(tax.tax * cartProductItems.quantity) * Number(cartProductItems.total_item_price) * 0.01).toFixed(2))
                                }


                                if (index === -1) {
                                    tax.tax_amount = Number(tax_amount)
                                    this._user_cart.total_taxes.push(tax)
                                } else {
                                    tax.tax_amount = tax.tax_amount + tax_amount
                                }
                            })
                        }

                        if (this._user_cart.is_tax_inclusive) {
                            cartProductItems.total_specification_tax = (specificationPriceTotal - (100 * Number(specificationPriceTotal)) / (100 + Number(cartProductItems.tax)));
                            cartProductItems.item_tax = (cartProductItems.item_price - (100 * Number(cartProductItems.item_price)) / (100 + Number(cartProductItems.tax)));
                        } else {
                            cartProductItems.total_specification_tax = specificationPriceTotal * Number(cartProductItems.tax) * 0.01;
                            cartProductItems.item_tax = (Number(cartProductItems.tax) * Number(cartProductItems.item_price) * 0.01);
                        }

                        cartProductItems.total_tax = (Number(cartProductItems.item_tax) + Number(cartProductItems.total_specification_tax));
                        cartProductItems.total_item_tax = (Number(cartProductItems.total_tax) * Number(cartProductItems.quantity));
                        cartProducts.total_item_tax += Number(cartProductItems.total_item_tax);

                        item_array.push(cartProductItems)
                        if (this._helper.is_table_booking) {
                            itemPriceTotal = itemPriceTotal + (specificationPriceTotal + cart_item.item_details.is_dine_in_price) * cart_item.quantity;
                        }
                        if (this._user_cart.is_user_pick_up_order) {
                            itemPriceTotal = itemPriceTotal + (specificationPriceTotal + cart_item.item_details.is_pickup_price) * cart_item.quantity;
                            // cartProductItems.item_price = cart_item.item_details.is_pickup_price;
                        }

                        this._user_cart.cart_data.total_item++;
                    });
                    cartProducts.items = item_array;
                    cartProducts.total_item_price = itemPriceTotal;
                    this._user_cart.cart_data.cart.push(cartProducts);
                    this._user_cart.total_cart_amount = this._user_cart.total_cart_amount + itemPriceTotal;



                    this._user_cart.total_item_tax = this._user_cart.total_item_tax + cartProducts.total_item_tax;
                });
            }
            this.cartSubject.next(this._user_cart);
            return response.data;
        } catch {
            return false
        }
    }



    increase_qty(product_index: any, item_index: any, update_qty = 1) {
        this._user_cart.cart_data.cart[product_index].items[item_index].quantity += update_qty;
        let qty = this._user_cart.cart_data.cart[product_index].items[item_index].quantity;
        let item_price = this._user_cart.cart_data.cart[product_index].items[item_index].item_price;
        let total_specification_price = this._user_cart.cart_data.cart[product_index].items[item_index].total_specification_price;

        this._user_cart.cart_data.cart[product_index].items[item_index].total_item_price = ((item_price + total_specification_price) * qty);
        this.calculateTotalAmount();
    }


    decrease_qty(product_index: any, item_index: any) {
        if (this._user_cart.cart_data.cart[product_index].items[item_index].quantity > 1) {
            this._user_cart.cart_data.cart[product_index].items[item_index].quantity--;

            let qty = this._user_cart.cart_data.cart[product_index].items[item_index].quantity;
            let item_price = this._user_cart.cart_data.cart[product_index].items[item_index].item_price;
            let total_specification_price = this._user_cart.cart_data.cart[product_index].items[item_index].total_specification_price;

            this._user_cart.cart_data.cart[product_index].items[item_index].total_item_price = ((item_price + total_specification_price) * qty);
            this.calculateTotalAmount();
        }
    }

    remove_from_cart(product_index: any, item_id: any, item_index = -1) {
        // const product_index = this._user_cart.cart_data.cart.findIndex(_p => _p.product_id === product_id);


        if (product_index != -1) {
            // let item_index;
            // if (itemidx != -1) {
            //     item_index = itemidx;
            // } else {
            //     item_index = this._user_cart.cart_data.cart[product_index].items.findIndex(_i => _i.item_id === item_id);
            // }
            if (item_index != -1) {

                this._user_cart.cart_data.cart[product_index].items.splice(item_index, 1);

                if (this._user_cart.cart_data.cart[product_index].items.length <= 0) {
                    this._user_cart.cart_data.cart.splice(product_index, 1);
                }
                this._user_cart.cart_data.total_item--;
                this.calculateTotalAmount();
            }
        }
    }

    pay_order_payment(is_cash_mode = true, order_payment_id: any, payment_id: any, delivery_type: DELIVERY_TYPE = DELIVERY_TYPE.DELIVERY, token = '', is_paypal = false, payment_intent_id = null, capture_amount = 0, order_details: any): Promise<ResponseModel> {
        return new Promise((resolve, reject) => {
            try {
                var store_delivery_id = null
                var type_delivery = 1
                if (this._helper.is_table_booking) {
                    type_delivery = DELIVERY_TYPE.TABLE
                }
                var json = {
                    user_id: this.userDetails?.userData?._id || '',
                    server_token: this.userDetails?.userData?.server_token || '',
                    order_payment_id,
                    payment_id, is_payment_mode_cash: is_cash_mode,
                    store_delivery_id: store_delivery_id,
                    delivery_type: type_delivery,
                    order_details: order_details,
                    token,
                    is_table_booking: this._helper.is_table_booking,
                    table_no: this._user_cart.table_no,
                    is_paypal, capture_amount, payment_intent_id,
                    is_show_success_toast: false
                }
                this._api.post({ url: apiColletions.pay_order_payment, parameters: json }).then((response) => {
                    resolve(response);
                });
            } catch (err) {
                resolve({ code: '', data: null, success: false })
            }
        });
    }

    async create_order(order_payment_id: any, milisecond: number = 0, milisecond1: number = 0, images = [], delivery_type = DELIVERY_TYPE.DELIVERY, delivery_note: string = '', is_allow_contactless_delivery: boolean = false, is_bring_change: boolean = false, vehicle_id = null, payment_id = null, payment_mode_cash = false, service_id = null, promocode = '', promo_id = null, provider_id = null): Promise<boolean> {
        try {
            let parameters: any;
            if (delivery_type === DELIVERY_TYPE.COURIER || delivery_type === DELIVERY_TYPE.TAXI) {
                parameters = new FormData();
                if (images.length) {
                    images.forEach((image, index) => parameters.append('image' + index, image))
                }
                parameters.append('user_id', this.userDetails?.userData?._id || '')
                parameters.append('server_token', this.userDetails?.userData?.server_token || '')
                parameters.append('cart_id', '')
                // parameters.append('destination_addresses', this._user_cart.cart_data.destination_addresses.toString())
                parameters.append('order_payment_id', order_payment_id)
                parameters.append('delivery_note', this.user_cart.cart_data.destination_addresses[0].note)
                parameters.append('pickup_note', this.user_cart.cart_data.pickup_addresses[0].note)
                parameters.append('delivery_user_name', this.user_cart.cart_data.destination_addresses[0].user_details.name)
                parameters.append('delivery_user_phone', this.user_cart.cart_data.destination_addresses[0].user_details.phone)
                parameters.append('is_user_pick_up_order', this._user_cart.is_user_pick_up_order.toString())
                parameters.append('is_schedule_order', this._user_cart.is_schedule_order.toString())
                parameters.append('order_start_at2', milisecond1.toString())
                parameters.append('order_start_at', milisecond.toString())
                parameters.append('delivery_type', delivery_type)
                parameters.append('vehicle_id', vehicle_id)
                parameters.append('service_id', service_id)
                parameters.append('is_bring_change', is_bring_change)
                parameters.append('is_table_booking', this._helper.is_table_booking)
                parameters.append('table_no', this._user_cart.table_no)
                if (delivery_type === DELIVERY_TYPE.TAXI) {
                    parameters.append('payment_id', payment_id)
                    parameters.append('is_payment_mode_cash', payment_mode_cash)
                    parameters.append('promo_code_name', promocode)
                    if (promo_id) {
                        parameters.append('promo_id', promo_id)
                    }
                }
            } else {

                this._user_cart.cart_data.destination_addresses[0].note = delivery_note;

                parameters = {
                    user_id: this.userDetails?.userData?._id || '',
                    server_token: this.userDetails?.userData?.server_token || '',
                    cart_id: this._user_cart.cart_data.cart_id,
                    destination_addresses: this._user_cart.cart_data.destination_addresses,
                    order_payment_id,
                    delivery_note,
                    delivery_user_name: "",
                    delivery_user_phone: "",
                    is_user_pick_up_order: this._user_cart.is_user_pick_up_order,
                    is_schedule_order: this._user_cart.is_schedule_order,
                    is_allow_contactless_delivery,
                    order_start_at2: milisecond1,
                    order_start_at: milisecond,
                    delivery_type,
                    is_bring_change,
                    table_id: this._user_cart.table_id,
                    provider_id: provider_id,
                    is_table_booking: this._helper.is_table_booking,
                    table_no: this._user_cart.table_no,
                    // delivery_user_name: this._cartService.user_cart.delivery_user_name,
                    // delivery_user_phone: this._cartService.user_cart.delivery_user_phone,
                }
            }

            const response = await this._api.post({ url: apiColletions.create_order, parameters })
            if (response.success) {
                this.clear_cart(false);
                this._user_cart.cart_data = new CartData;
                this._user_cart = new Cart();
                let new_token = this._helper.generate_new_uuid;
                this.cart_unique_token = new_token;
                localStorage.setItem('cart_unique_token', new_token);
                this.cartSubject.next(this._user_cart);
                return response.data;
            } else {
                return false;
            }
        } catch (err) {
            return false
        }
    }

    async get_order_cart_invoice(total_distance: any, total_time: any, tip_amount: any = 0, delivery_type: DELIVERY_TYPE = DELIVERY_TYPE.DELIVERY, vehicle_id = null): Promise<any> {
        try {
            let city_id = ''
            let country_id = '';
            let taxes = []
            let total_cart_price = 0
            let total_cart_amout_without_tax = 0

            // if(delivery_type === DELIVERY_TYPE.COURIER){
            city_id = this._helper.city_id
            country_id = this._helper.country_id
            // }

            let totalItemsCount = 0;
            this._user_cart.cart_data.cart.forEach((cart_product) => {
                cart_product.items.forEach((cart_item) => {
                    totalItemsCount += cart_item.quantity;
                    // taxes.push(cart_item)
                });
            });

            total_cart_amout_without_tax = this._user_cart.total_cart_amount
            if (this._user_cart.is_tax_inclusive) {
                total_cart_price = this._user_cart.total_cart_amount - this._user_cart.total_item_tax
            } else {
                total_cart_price = this._user_cart.total_cart_amount
            }


            let parameters = {
                city_id: this.store_details?.city_id,
                country_id: this.store_details?.country_id,
                cart_id: this._user_cart.cart_data.cart_id,
                delivery_type: this.cart_delivery_type,
                user_id: this.userDetails?.userData?._id || '',
                server_token: this.userDetails?.userData?.server_token || '',
                store_id: this.store_details.store_id,
                cart_unique_token: this.cart_unique_token,
                order_type: 7,
                total_cart_price: total_cart_price,
                total_item_count: totalItemsCount,
                total_cart_amout_without_tax,
                is_user_pick_up_order: this._user_cart.is_user_pick_up_order,
                tax_details: this._user_cart.total_taxes,
                total_distance,
                total_time,
                tip_amount,
                vehicle_id: vehicle_id,
                is_use_item_tax: this._user_cart.is_use_item_tax,
                is_tax_included: this._user_cart.is_tax_inclusive,
                booking_fees: 0,
                is_show_success_toast: false,
                is_table_booking: this._helper.is_table_booking,
                table_no: this._user_cart.table_no
            }

            const response = await this._api.post({ url: apiColletions.get_order_cart_invoice, parameters })
            if (response.success) {
                this._user_cart.server_time = response.data.server_time
                return response.data
            } else {
                return response
            }
        } catch (err) {
            return err;
        }
    }

    clear_cart(is_show_success_toast = true): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                let json = {
                    user_id: this.userDetails?.userData?._id || '',
                    server_token: this.userDetails?.userData?.server_token || '',
                    cart_id: this.user_cart.cart_data.cart_id,
                    cart_unique_token: this.cart_unique_token,
                    is_show_success_toast: is_show_success_toast,
                    is_show_error_toast: false
                }
                this._api.post({ url: apiColletions.clear_cart, parameters: json }).then((response) => {
                    if (response.success) {
                        this._user_cart.cart_data = new CartData();
                        this._user_cart.total_taxes = []
                        this._user_cart.total_item_tax = 0
                        this._user_cart.total_cart_amount = 0
                        this.cartSubject.next(this._user_cart);
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                })
            } catch {
                resolve(false)
            }
        })
    }

    download_tax_invoice(parameters: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this._api.post({ url: apiColletions.download_tax_invoice, parameters: parameters }).then((response) => {
                    if (response.success) {
                        resolve(response.data)
                    }
                })
            } catch {
                resolve(false)
            }
        })
    }

    get_invoice(parameters: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                this._api.post({ url: apiColletions.get_invoice, parameters: parameters }).then((response) => {
                    if (response.success) {
                        resolve(response.data)
                    }
                })
            } catch {
                resolve(false)
            }
        })
    }



}
