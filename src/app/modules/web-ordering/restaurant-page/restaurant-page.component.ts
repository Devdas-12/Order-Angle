import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { DEFAULT_IMAGE } from 'src/app/core/constant/constant';
import { Cart, ItemModel, cartProductsModel } from 'src/app/core/models/cart.model';
import { CartService } from 'src/app/data/services/cart.service';
import { HomeService } from 'src/app/data/services/home.service';
import { UserService } from 'src/app/data/services/user.service';
import { Helper } from 'src/app/shared/helper';
import { environment } from 'src/environments/environment';

declare let $: any;
@Component({
    selector: 'app-restaurant-page',
    templateUrl: './restaurant-page.component.html',
    styleUrls: ['./restaurant-page.component.scss']
})
export class RestaurantPageComponent {

    addCartRef!: NgbModalRef;
    cartModalConfig: any = { centered: true, backdrop: 'static', windowClass: 'modal-web' };
    store_details: any;
    imageUrl: any = environment.IMAGE_URL;
    famous_products_tags: any;
    filter_items: any;
    image_url = environment.IMAGE_URL;
    DEFAULT_IMAGE = DEFAULT_IMAGE;
    product_data: any;
    products: any;
    product_items: any;
    details: any;
    selected_product_name: any;
    qty: any;
    selected_item: any;
    required_count!: number;
    total: any;
    required_temp_count!: number;
    currencySign: any;
    store_detail: any;
    note_for_item: any;
    clickTimeout: any = null;
    store_id: any = '62b99a84019b9f20b7aa99a8';
    item_price = 0;
    total_item_price = 0;
    selected_product: number = 0;
    product_unique_id: any;
    product_name: any;
    specificationLength!: number;
    store: any;
    current_main_item: any;
    private cartProductItems: ItemModel = new ItemModel();
    private cartProducts: cartProductsModel = new cartProductsModel();
    cardData!: Cart;
    filtered_tags: any = [];
    filter_name: any = [];
    search_value = '';

    total_items_in_user_cart: number = 0;
    items_in_user_cart: any = [];
    is_provide_pickup_delivery: any;
    is_provide_delivery: any;
    cartSubscription!: Subscription;
    selected_store_id: any;
    total_cart_items: any;
    isSubscribe: any = true;
    total_cart_price: any;
    invoice_faild: any;
    tip_amount: any;
    is_get_invoice: any;
    is_tax_included: any;
    order_payment_details: any;
    is_min_fare_applied: any;
    schedule_time_error: any;
    is_schedule_order: any;
    timezone: any;
    min_order_price: any;
    dietary_tags: any = [];
    itemForDelete: any;
    select_product_index: any;
    select_item_index: any;
    user_details: any;
    currentSection : any ;

    @ViewChild('addCartModel', { static: true }) addCartModel!: TemplateRef<any>;

    @HostListener("window:scroll", [])
    onWindowScroll() {

        var themeWhite: any = document.getElementById("filter-sticky");
        if (themeWhite.getBoundingClientRect().top == 0) {
            $('#filter-sticky').addClass('header-sticky');
        } else {
            $('#filter-sticky').removeClass('header-sticky');
        }
    }

    constructor(private helper: Helper, private _homeService: HomeService, public _cartService: CartService, private modalService: NgbModal, private _authService: UserService) { };

    ngOnInit() {
        this._homeService.get_store({ store_id: this.store_id, is_show_success_toast: false }).then((res) => {
            this.store = res.store_detail;
            this.is_provide_pickup_delivery = this.store.is_provide_pickup_delivery
            this.is_provide_delivery = this.store.is_provide_delivery
            this._cartService.user_cart.is_user_pick_up_order = false;
            this.getStore();
            // this.get_store_data();
            if (!this.helper.is_table_booking) {
                if (!this.is_provide_delivery && this.is_provide_pickup_delivery) {
                    this._cartService.user_cart.is_user_pick_up_order = true
                }
            }
            this._cartService.update_local_cart('');
            // this.getCart();

            this.cartSubscription = this._cartService.cartObservable.subscribe(
                (cart) => {
                    console.log(cart);

                    this.total_items_in_user_cart = 0;
                    this.items_in_user_cart = [];

                    if (cart) {
                        if (this._cartService?.user_cart?.cart_data?.cart.length || cart?.cart_data.cart.length) {
                            this.selected_store_id = this._cartService.user_cart.cart_data.selectedStoreId;
                            this.total_cart_items = this._cartService.user_cart.cart_data.total_item;
                            this._cartService.user_cart.cart_data.cart.forEach((element) => {
                                this.total_items_in_user_cart = this.total_items_in_user_cart + element.items.length;
                                this.items_in_user_cart.push(element);
                                console.log(this.items_in_user_cart);

                                if (this.isSubscribe) {
                                    this.isSubscribe = !this.isSubscribe
                                    setTimeout(() => {
                                        this.get_order_cart_invoice();
                                    }, 100);
                                }
                            });
                            this.items_in_user_cart.forEach((value: any) => {
                                this.total_cart_price = value.total_item_price;
                            });
                        }
                    } else {
                        this.total_items_in_user_cart = 0;
                        this.items_in_user_cart = [];
                        this.total_cart_items = 0;
                        this.total_cart_price = 0;
                    }
                }
            );
        });
    }

    getStore() {
        let json = {
            store_id: '63a530f656c6c52e2e6eb30d',
            is_show_success_toast: false
        }

        this._homeService.get_store_product_item_list(json).then((res) => {
            console.log(res);
            this.details = res;
            this.store_detail = res.store;
            this.store = res.store;
            this.products = res.products;
            this.filter_items = res.products;
            this.dietary_tags = res.dietary_tags || [];
            // setTimeout(() => {
            this.onItemClick(this.filter_items[0]._id, '');
            // }, 2000);
            this.famous_products_tags = res.store.famous_products_tags;
        })

        // $(function () {
        //   $(window).on("scroll", function () {
        //     if ($(window).scrollTop() > 50) {
        //       $(".header").addClass("active");
        //     } else {
        //       //remove the background property so it comes transparent again (defined in your css)
        //       $(".header").removeClass("active");
        //     }
        //   });
        // });
    }

    get_order_cart_invoice(total_distance = 0, total_time = 0) {
        if (this.store && this._cartService.user_cart.is_user_pick_up_order && !this.store.is_provide_pickup_delivery) {
            setTimeout(() => {
                this._cartService.user_cart.is_user_pick_up_order = false;
            }, 1000);
            return;
        }

        this._cartService.get_order_cart_invoice(total_distance, total_time, this.tip_amount)
            .then((res_data) => {
                if (res_data.success) {
                    this.invoice_faild = false;
                    this.is_get_invoice = true;
                    // this.helper.isCartShow = true;
                    this.is_tax_included = res_data.is_tax_included;
                    this._cartService.user_cart.cart_data.selectedStoreId =
                        res_data['store']._id;
                    this.order_payment_details = res_data.order_payment;
                    console.log(this.order_payment_details);

                    var delivery_price =
                        this.order_payment_details.total_service_price +
                        this.order_payment_details.total_admin_tax_price;
                    if (
                        this.order_payment_details.total_delivery_price > delivery_price
                    ) {
                        this.is_min_fare_applied = true;
                    } else {
                        this.is_min_fare_applied = false;
                    }
                    if (this._cartService.user_cart.is_schedule_order) {
                        this.check_valid_time();
                    } else {
                        let date: any = this._cartService.user_cart.server_time;
                        date = new Date(date).toLocaleString('en-US', {
                            timeZone: this.timezone,
                        });
                        date = new Date(date);
                        // this.check_open(date, true);
                    }
                } else {
                    var erro_code = parseInt(res_data.code);
                    this.invoice_faild = true;
                    if (erro_code == 968) {
                        // this.openModel('tax-miss-match-popup')
                    }
                    this.min_order_price = res_data.min_order_price;
                    if (
                        res_data.min_order_price >
                        this.order_payment_details?.user_pay_payment
                    ) {
                        // this.openModel('min-order-price-popup');
                    }
                }
            });
    }

    check_valid_time() {
        this.is_schedule_order = this._cartService.user_cart.is_schedule_order;

        let server_date: any = new Date(this._cartService.user_cart.server_time);
        server_date = new Date(server_date).toLocaleString('en-US', {
            timeZone: this.timezone,
        });
        server_date = new Date(server_date);

        let selected_date: any = this._cartService.user_cart.schedule_date;

        let day_diff = selected_date.getDay() - server_date.getDay();
        let timeDiff = Math.round(selected_date.getTime() - server_date.getTime());

        if (timeDiff / 60000 >= 30) {
            this.schedule_time_error = false;
            if (day_diff > 0) {
                // this.check_open(selected_date, false);
            } else {
                // this.check_open(selected_date, true);
            }
        } else {
            this.schedule_time_error = true;
        }
    }

    onItemClick(item: any, axis: any) {
        this.selected_product_name = item;
        let elmnt: any = document.getElementById(item._id);
        if (elmnt) {

            var options: any = {
                behavior: 'smooth'
            };

            if (axis === 'vertical') {
                options.block = 'start';
            } else if (axis === 'horizontal') {
                options.inline = 'start';
            }
            // Scroll to the target element
            setTimeout(() => {
                elmnt.scrollIntoView(options);
            }, 500);
        }
    }

    onSectionChange(sectionId: string) {
        this.currentSection = sectionId;
        let index = this.filter_items.findIndex((x: any) => x._id._id == sectionId)
        let elemnt: any = document.getElementById(this.filter_items[index]?._id?.unique_id);
        // let scrollElem: any = document.getElementById('tags-element')

        // let elementStyle: any = getComputedStyle(elemnt);
        // let elementWidth = elemnt.clientWidth - (parseFloat(elementStyle.paddingLeft) + parseFloat(elementStyle.paddingRight));
        // let elementPositions: any = elemnt.getBoundingClientRect()
        // // return properties;
        // const activeWidth = elementWidth / 2;
        // const pos = elementPositions.left + activeWidth;
        // const currentScroll = scrollElem.scrollLeft;
        // const divWidth = scrollElem.offsetWidth;
        // const newPos = pos + currentScroll - divWidth / 2;

        // scrollElem.scrollTo({
        //     left: newPos
        //     , behavior: 'smooth'
        // });
    }

    onProductClick(item: any) {
        // this.selected_item = item;
        // this.addCartRef = this.modalService.open(this.addCartModel , this.cartModalConfig);
        // this.qty = 1 ;

        this.qty = 1;
        this.selected_item = JSON.parse(JSON.stringify(item));
        if (
            this._cartService.user_cart.cart_data.cart.length > 0 &&
            item.specifications.length > 0
        ) {
            var index = this._cartService.user_cart.cart_data.cart[0].items.findIndex(
                (_x) => _x.item_id === item._id
            );
            this.onAddProduct(item);
        } else {
            this.onAddProduct(item);
        }
    }

    onAddProduct(item: any) {
        this.addCartRef = this.modalService.open(this.addCartModel, this.cartModalConfig);
        this.product_name = this.products[this.selected_product]._id.name;
        this.product_unique_id = this.products[this.selected_product]._id.unique_id;
        this.current_main_item = item;
        //console.log(item);
        this.selected_item = JSON.parse(JSON.stringify(item));
        //console.log(this.selected_item);

        this.selected_item.specifications.sort(function (a: any, b: any) {
            return a.sequence_number - b.sequence_number;
        });
        this.selected_item.specifications.forEach((element: any) => {
            element.list.sort(function (a: any, b: any) {
                return a.sequence_number - b.sequence_number;
            });
        });
        // this.imagesUrl = [];
        // this.selected_item.image_url.forEach((element) => {
        // 	this.imagesUrl.push({
        // 		path: this.IMAGE_URL + element,
        // 	});
        // 	//console.log(this.imagesUrl);
        // });
        this.selected_item.specifications =
            this.selected_item.specifications.filter(
                (s: any) => s.is_visible_in_store != false
            );
        this.selected_item.specifications.forEach((sp: any) => {
            sp.list = sp.list.filter((s: any) => s.is_visible_in_store != false);
        });
        //console.log(this.selected_item);
        //console.log(this.selected_item.specifications.length);
        this.specificationLength = this.selected_item.specifications.length;

        this.selected_item.specifications =
            this.selected_item.specifications.filter((sp: any) => sp.list.length > 0);
        this.selected_item.specifications.forEach((specification: any) => {
            var index = specification.list.findIndex(
                (x: any) => x.is_default_selected == true
            );
            if (index !== -1) {
                this.selected_item.specifications.forEach(
                    (associated_specification: any) => {
                        if (
                            associated_specification.modifier_group_id == specification._id &&
                            associated_specification.modifier_id ==
                            specification.list[index]._id
                        ) {
                            associated_specification.is_associated = false;
                            let common_modifier = this.selected_item.specifications.findIndex(
                                (i: any) =>
                                    i._id == associated_specification._id &&
                                    !i.modifier_group_id &&
                                    !i.modifier_id
                            );
                            if (common_modifier != -1) {
                                this.selected_item.specifications[
                                    common_modifier
                                ].is_associated = true;
                            }
                        }
                    }
                );
            }
            specification.list.forEach((spec: any) => {
                spec.is_default_selected ? (spec.quantity = 1) : (spec.quantity = 0);
            });
        });

        this.calculate_is_required();
        this.calculateTotalAmount(false);
    }

    changeradio(event: any, specification_group_index: any, specification_index: any) {
        let index = this.selected_item.specifications[
            specification_group_index
        ].list.findIndex((x: any) => x.is_default_selected === true);
        if (index !== -1) {
            this.selected_item.specifications[specification_group_index].list[
                index
            ].is_default_selected = false;
            this.selected_item.specifications[specification_group_index].list[
                index
            ].quantity = 0;

            this.selected_item.specifications.forEach((specification: any) => {
                if (
                    specification.modifier_group_id ==
                    this.selected_item.specifications[specification_group_index]._id &&
                    specification.modifier_id ==
                    this.selected_item.specifications[specification_group_index].list[
                        index
                    ]._id
                ) {
                    let common_modifier = this.selected_item.specifications.findIndex(
                        (i: any) =>
                            i._id == specification._id &&
                            !i.modifier_group_id &&
                            !i.modifier_id
                    );
                    if (common_modifier != -1) {
                        this.selected_item.specifications[common_modifier].is_associated =
                            false;
                    }
                    specification.is_associated = true;
                }
            });
        }
        this.selected_item.specifications[specification_group_index].list[
            specification_index
        ].is_default_selected = true;
        this.selected_item.specifications[specification_group_index].list[
            specification_index
        ].quantity = 1;

        this.selected_item.specifications.forEach((specification: any) => {
            if (
                specification.modifier_group_id ==
                this.selected_item.specifications[specification_group_index]._id &&
                specification.modifier_id ==
                this.selected_item.specifications[specification_group_index].list[
                    specification_index
                ]._id
            ) {
                specification.is_associated = false;
                let common_modifier = this.selected_item.specifications.findIndex(
                    (i: any) =>
                        i._id == specification._id && !i.modifier_group_id && !i.modifier_id
                );
                if (common_modifier != -1) {
                    this.selected_item.specifications[common_modifier].is_associated =
                        true;
                }
            }
        });

        this.calculate_is_required();
        this.calculateTotalAmount(true);
    }

    onItemDelete(product_index: any, item: any, item_index: any) {
        this.itemForDelete = item;
        this.select_product_index = product_index;
        // this.select_item_id = product_id;
        this.select_item_index = item_index;
        // this.modalRef = this.modalService.open(this.deleteItem, this.modalConfig)
        this._cartService.remove_from_cart(this.select_product_index, this.itemForDelete._id, this.select_item_index);
        this.get_order_cart_invoice();

    }

    changecheckbox(event: any, specification_group_index: any, specification_index: any) {
        this.selected_item.specifications[specification_group_index].list[
            specification_index
        ].is_default_selected = event.target.checked;
        event.target.checked
            ? (this.selected_item.specifications[specification_group_index].list[
                specification_index
            ].quantity = 1)
            : (this.selected_item.specifications[specification_group_index].list[
                specification_index
            ].quantity = 0);
        this.calculateTotalAmount(true);
    }

    onDecreaseQty(specification_group_index: any, specification_index: any) {
        if (
            this.selected_item.specifications[specification_group_index].list[
                specification_index
            ].quantity === 1
        ) {
            this.selected_item.specifications[specification_group_index].list[
                specification_index
            ].is_default_selected = false;
        } else {
            this.selected_item.specifications[specification_group_index].list[
                specification_index
            ].quantity--;
        }
        this.calculateTotalAmount(true);
    }

    get_store_tags(tag: any) {
        if (this.dietary_tags) {
            let index = this.dietary_tags.findIndex((x: any) => x._id == tag)
            if (index != -1) {
                return this.dietary_tags[index].short_name;
            }
        }
    }

    onIncreaseQty(specification_group_index: any, specification_index: any) {

        this.selected_item.specifications[specification_group_index].list[
            specification_index
        ].quantity++;
        this.calculateTotalAmount(true);
    }

    incerase_qty() {
        this.qty++;
        this.calculateTotalAmount(true);
    }


    decrease_qty() {
        if (this.qty > 1) {
            this.qty--;
            this.calculateTotalAmount(true);
        }
    }

    check_required_options() {

        if (this.required_count !== this.required_temp_count) {
            let index = this.selected_item.specifications.findIndex(
                (x: any) =>
                    (x.is_required && x.range && x.default_selected_count < x.range) ||
                    (x.is_required && x.default_selected_count < 1)
            );
            if (index !== -1) {
                let elmnt: any = document.getElementById(
                    'specification' + this.selected_item.specifications[index].unique_id
                );
                if (elmnt) {
                    elmnt.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                }
            }
        } else {
            this.handleClickOnAddToCart();
        }
    }

    async handleClickOnAddToCart() {
        if (
            this._cartService.user_cart.cart_data.cart.length > 0 &&
            this._cartService.user_cart.cart_data.selectedStoreId !== this.store_id
        ) {
            // this._helper.openModel('clear-cart-content');
            return;
        }
        if (this.selected_item.specifications.length == 0) {
            if (this._cartService.user_cart.cart_data.cart) {
                // let item_exists =
                // 	this._cartService.user_cart.cart_data.cart[0].items.findIndex(
                // 		(i: any) => i.item_id == this.selected_item._id
                // 	);

                let item_exists = this._cartService.user_cart.cart_data.cart.findIndex((i: any) => i.items[0].item_id == this.selected_item._id)

                if (item_exists != -1) {
                    this.onItemIncreaseQty(this.selected_item, this.qty, item_exists);
                    return;
                }
            }
        }

        // var location: LocationModel = this._locationService.current_location;
        let user_details = {
            name: '',
            country_phone_code: '',
            phone: '',
            email: '',
        };
        let all_taxes: any = [];

        if (this._authService.user) {
            user_details = {
                name: `${this._authService.user.first_name} ${this._authService.user.last_name}`,
                country_phone_code: `${this._authService.user.country_phone_code}`,
                phone: `${this._authService.user.phone}`,
                email: `${this._authService.user.email}`,
            };
        }
        if (this._cartService.user_cart.cart_main_item.length <= 0) {
            this._cartService.user_cart.cart_data.destination_addresses[0] = {
                address: '',
                address_type: 'destination',
                flat_no: '',
                street: '',
                landmark: '',
                city: '',
                delivery_status: 1,
                location: [],
                note: '',
                user_details: user_details,
                user_type: 1,
            };
        }

        let specificationPriceTotal = 0;
        let specificationPrice = 0;
        let specificationList: any = [];
        let y_name = '';

        this.selected_item.specifications.forEach(
            (specification_group: any, specification_group_index: any) => {
                let specificationItemCartList: any = [];
                if (!specification_group.is_associated) {
                    specification_group.list.forEach(
                        (specification: any, specification_index: any) => {
                            y_name = specification.name;
                            if (typeof specification.name == 'object') {
                                y_name = specification.name[0];
                                if (!y_name) {
                                    y_name = specification.name[0];
                                }
                            }
                            specification.name = y_name;
                            if (specification.is_default_selected) {
                                // //console.log(specification.price * specification.quantity)
                                specification.name = y_name;
                                specificationPrice = specificationPrice + specification.price;
                                specificationPriceTotal =
                                    specificationPriceTotal +
                                    specification.price * specification.quantity; // specification quantity calculation added
                                specificationItemCartList.push(specification);
                            }
                        }
                    );
                    // //console.log(specificationItemCartList)
                    // //console.log(specificationPriceTotal)
                    y_name = specification_group.name;
                    if (typeof specification_group.name == 'object') {
                        y_name = specification_group.name[0];
                        if (!y_name) {
                            y_name = specification_group.name[0];
                        }
                    }
                    specification_group.name = y_name;
                    if (specificationItemCartList.length > 0) {
                        let specificationsItem_json = {
                            list: specificationItemCartList,
                            unique_id: specification_group.unique_id,
                            name: y_name,
                            price: specificationPrice,
                            type: specification_group.type,
                            range: specification_group.range,
                            max_range: specification_group.max_range,
                            is_required: specification_group.is_required,
                            modifier_id: specification_group.modifier_id,
                            modifier_group_id: specification_group.modifier_group_id,
                            is_associated: specification_group.is_associated,
                            is_parent_associate: specification_group.is_parent_associate,
                        };

                        specificationList.push(specificationsItem_json);
                    }
                    specificationPrice = 0;
                }
            }
        );

        // this.selected_item?.tax_details.forEach((tax: any) => {
        // 	tax.tax_amount = 0;
        // });
        this.cartProductItems.item_id = this.selected_item._id;
        this.cartProductItems.unique_id = this.selected_item.unique_id;
        this.cartProductItems.item_name = this.selected_item.name;
        this.cartProductItems.tax_details = this.selected_item.tax_details;
        this.cartProductItems.quantity = this.qty;
        this.cartProductItems.image_url = this.selected_item.image_url;
        this.cartProductItems.details = this.selected_item.details;
        this.cartProductItems.specifications = specificationList;
        this.cartProductItems.dietary_tags = this.selected_item.dietary_tags;
        // if (this.is_table_booking) {
        this.cartProductItems.item_price = this.selected_item.is_delivery_price;
        // }
        // if (this.is_pickup) {
        //     this.cartProductItems.item_price = this.selected_item.is_pickup_price;
        // }
        this.item_price = this.cartProductItems.item_price;
        this.total_item_price = this.item_price + specificationPriceTotal;
        this.cartProductItems.total_specification_price = specificationPriceTotal;
        this.cartProductItems.total_item_price = this.total;
        console.log(this.store_detail);

        this._cartService.user_cart.is_tax_inclusive =
            this.store_detail.is_tax_included;
        this._cartService.user_cart.is_use_item_tax =
            this.store_detail.is_use_item_tax;

        if (this.store.is_use_item_tax === true) {
            this.selected_item.tax_details.forEach((tax: any) => {
                this.cartProductItems.tax = this.cartProductItems.tax + tax.tax;
                all_taxes.push(tax);
            });
            if (this.store_detail.is_tax_included) {
                this.cartProductItems.item_price =
                    (100 * this.cartProductItems.item_price) /
                    (100 + this.cartProductItems.tax);
            }
        } else {
            // this.store_detail.store_taxes.forEach((tax: any) => {
            // 	all_taxes.push(tax);
            // 	this.cartProductItems.tax = this.cartProductItems.tax + tax.tax;
            // });
            // if (this.store_detail.is_tax_included) {
            // 	this.cartProductItems.item_price =
            // 		(100 * this.cartProductItems.item_price) /
            // 		(100 + this.cartProductItems.tax);
            // }
        }

        if (this.store_detail.is_tax_included) {
            this.cartProductItems.total_specification_tax =
                specificationPriceTotal -
                (100 * specificationPriceTotal) /
                (100 + Number(this.cartProductItems.tax));
        } else {
            this.cartProductItems.total_specification_tax =
                specificationPriceTotal * Number(this.cartProductItems.tax) * 0.01;
        }

        this.cartProductItems.item_tax =
            Number(this.cartProductItems.tax) *
            Number(this.cartProductItems.item_price) *
            0.01;
        this.cartProductItems.total_tax =
            Number(this.cartProductItems.item_tax) +
            Number(this.cartProductItems.total_specification_tax);
        this.cartProductItems.total_item_tax =
            Number(this.cartProductItems.total_tax) *
            Number(this.cartProductItems.quantity);
        this.cartProductItems.note_for_item = this.note_for_item;

        all_taxes.forEach((tax: any) => {
            let total_price: any;
            // if (this.is_table_booking) {
            total_price = Number(this.selected_item.is_delivery_price) + specificationPriceTotal;
            // }
            // if (this.is_pickup) {
            //     total_price = Number(this.selected_item.is_pickup_price) + specificationPriceTotal;
            // }

            total_price = total_price * this.cartProductItems.quantity;

            if (this.store_detail.is_tax_included) {
                tax.tax_amount = total_price - (100 * total_price) / (100 + tax.tax);
            } else {
                tax.tax_amount = Number(
                    Number(tax.tax) * Number(total_price) * 0.01
                ).toFixed(2);
            }
        });

        this._cartService.user_cart.cart_main_item.push(this.current_main_item);
        this._cartService.user_cart.total_cart_amount =
            this._cartService.user_cart.total_cart_amount +
            this.cartProductItems.total_item_price;
        this._cartService.user_cart.total_item_tax =
            Number(this._cartService.user_cart.total_item_tax) +
            Number(this.cartProductItems.total_item_tax);

        if (this.isProductExistInLocalCart(this.cartProductItems)) {
            // console.log("product exist")
            let itemIndex =
                this._cartService.user_cart.cart_data.cart[0].items.findIndex(
                    (_x) => _x.item_id === this.cartProductItems.item_id
                );
            this._cartService.user_cart.cart_data.cart[0].items[itemIndex].quantity =
                this._cartService.user_cart.cart_data.cart[0].items[itemIndex]
                    .quantity + this.cartProductItems.quantity;
            this.addItemInServerCart();

        } else {
            // console.log("product not exist")

            let bool = false;
            this._cartService.user_cart.cart_data.cart.forEach((cart_item) => {
                if (cart_item.product_id == this.products[this.selected_product]._id._id) {
                    cart_item.items.push(this.cartProductItems);
                    cart_item.total_item_price = cart_item.total_item_price + this.total;
                    this.addItemInServerCart();
                    this._cartService.user_cart.cart_data.total_item++;
                    bool = true
                }
            })
            if (bool == false) {
                // console.log(this.cartProductItems)
                let cartProductItemsList = [];
                cartProductItemsList.push(this.cartProductItems);
                this.cartProducts.items = cartProductItemsList;
                this.cartProducts.product_id = this.selected_item.product_id;
                this.cartProducts.product_name = this.product_name;
                this.cartProducts.unique_id = this.product_unique_id;
                this.cartProducts.total_item_price = 0;
                this.cartProducts.total_item_tax = 0;
                this.cartProducts.items.forEach((item) => {
                    this.cartProducts.total_item_price += item.total_item_price;
                    this.cartProducts.total_item_tax += item.total_item_tax;
                });
                this._cartService.user_cart.cart_data.cart.push(this.cartProducts);
                localStorage.setItem('cartStoreId', this.store_id);
                this._cartService.user_cart.cart_data.selectedStoreId = this.store_id;
                console.log(this.store_id);

                this._cartService.user_cart.cart_data.max_item_quantity_add_by_user =
                    this.store.max_item_quantity_add_by_user;
                if (this.store.address) {
                    this._cartService.user_cart.cart_data.pickup_addresses[0].location =
                        this.store.location;
                    this._cartService.user_cart.cart_data.pickup_addresses[0].address =
                        this.store.address;
                    this._cartService.user_cart.cart_data.pickup_addresses[0].user_type =
                        this.store.user_type;
                    this._cartService.user_cart.cart_data.pickup_addresses[0].user_details =
                    {
                        name: this.store.name,
                        country_phone_code: this.store.country_phone_code,
                        phone: this.store.phone,
                        email: this.store.email,
                    };
                } else {
                    this._cartService.user_cart.cart_data.pickup_addresses[0].location = [
                        // location.latitude,
                        // location.longitude,
                    ];
                    this._cartService.user_cart.cart_data.pickup_addresses[0].address = '';
                    this._cartService.user_cart.cart_data.pickup_addresses[0].user_type = 1;
                    this._cartService.user_cart.cart_data.pickup_addresses[0].user_details =
                        user_details;
                }
                this._cartService.user_cart.cart_data.total_item++;
                this._cartService.user_cart.total_taxes = all_taxes;
                this.cartProductItems.item_price = this.item_price;
                // this.cartProductItems.total_item_price = this.total_item_price
                this.addItemInServerCart();
            }
        }
    }

    onItemIncreaseQty(item: any, update_qty = 1, index: any) {

        item.qty += update_qty;
        if (this.clickTimeout) {
            this.setClickTimeout(() => this.handleOnItemIncreaseQty(item, index));
        } else {
            this.setClickTimeout(() => this.handleOnItemIncreaseQty(item, index));
        }
    }

    setClickTimeout(callback: any) {
        clearTimeout(this.clickTimeout);
        this.clickTimeout = setTimeout(() => {
            this.clickTimeout = null;
            callback();
        }, 1000);
    }

    handleOnItemIncreaseQty(item: any, index: any) {
        const item_index = this._cartService.user_cart.cart_data.cart[index].items.findIndex((i) => i.item_id == item._id);
        const product_index = this._cartService.user_cart.cart_data.cart.findIndex((x) => x.items[0].item_id == item._id)
        const update_qty = item.qty - this._cartService.user_cart.cart_data.cart[index].items[item_index].quantity;

        this._cartService.increase_qty(product_index, item_index, update_qty);

        this.addCartRef.close()
        this.qty = 1;
    }


    calculate_is_required() {
        this.required_count = 0;

        this.selected_item.specifications.forEach((specification_group: any) => {
            if (!specification_group.is_associated) {
                if (specification_group.is_required) {
                    this.required_count++;
                }
                let list = specification_group.list.filter((x: any) => {
                    if (x.is_visible_in_store) {
                        return x;
                    }
                });
                if (list.length < specification_group.range) {
                    specification_group.range = list.length;
                }
                if (list.length < specification_group.max_range) {
                    specification_group.max_range = list.length;
                }
            }
        });
    }

    calculateTotalAmount(boolean: any) {
        // if (this.is_table_booking) {
        this.total = this.selected_item.is_delivery_price;
        console.log(this.total);

        // }
        // if (this.is_pickup) {
        //   this.total = this.selected_item.is_pickup_price;
        // }

        this.required_temp_count = 0;
        this.selected_item.specifications.forEach(
            (specification_group: any, specification_group_index: any) => {
                let default_selected_count = 0;
                if (!specification_group.is_associated) {
                    specification_group.list.forEach(
                        (specification: any, specification_index: any) => {
                            if (specification.is_default_selected) {
                                // specification.quantity = 1
                                this.total =
                                    this.total + specification.price * specification.quantity;
                                default_selected_count++;
                            }
                            specification_group.default_selected_count =
                                default_selected_count;
                        }
                    );
                    if (
                        specification_group.type == 1 &&
                        specification_group.is_required
                    ) {
                        if (specification_group.range) {
                            if (default_selected_count >= specification_group.range) {
                                this.required_temp_count++;
                            }
                        } else {
                            if (default_selected_count >= 1) {
                                this.required_temp_count++;
                            }
                        }
                    } else if (
                        specification_group.type == 2 &&
                        specification_group.is_required
                    ) {
                        if (specification_group.range) {
                            if (default_selected_count >= specification_group.range) {
                                this.required_temp_count++;
                            }
                        } else {
                            if (default_selected_count >= 1) {
                                this.required_temp_count++;
                            }
                        }
                    }
                }
            }
        );

        this.total = this.total * this.qty;
    }

    isProductExistInLocalCart(cartProductItems: any) {
        let bool = false;
        this._cartService.user_cart?.cart_data?.cart?.forEach((cart_item: any) => {
            // if (cart_item.product_id == this.products[this.selected_product].product_id && bool == false) {
            //   cart_item.items.push(cartProductItems);
            //   cart_item.total_item_price = cart_item.total_item_price + this.total;
            //   this.addItemInServerCart();
            //   this._cartService.user_cart.cart_data.total_item++;
            //   bool = true;
            // }
            let itemIndex = this._cartService.user_cart.cart_data.cart[0].items.findIndex((_x) => _x.item_id === this.cartProductItems.item_id);
            if (itemIndex !== -1) {
                if (
                    this._cartService.user_cart.cart_data.cart[0].items[itemIndex]
                        .specifications.length ===
                    this.cartProductItems.specifications.length
                ) {
                    if (this.cartProductItems.specifications.length > 0) {
                        this.cartProductItems.specifications.forEach((specification) => {
                            let specificationGroupIndex =
                                this._cartService.user_cart.cart_data.cart[0].items[
                                    itemIndex
                                ].specifications.findIndex(
                                    (_x) => _x.unique_id === specification.unique_id
                                );
                            if (specificationGroupIndex !== -1) {
                                if (
                                    this._cartService.user_cart.cart_data.cart[0].items[itemIndex]
                                        .specifications[specificationGroupIndex].list.length ===
                                    specification.list.length
                                ) {
                                    specification.list.forEach((spec: any) => {
                                        let specificationIndex =
                                            this._cartService.user_cart.cart_data.cart[0].items[
                                                itemIndex
                                            ].specifications[specificationGroupIndex].list.findIndex(
                                                (_x: any) => _x._id === spec._id
                                            );
                                        if (specificationIndex !== -1) {
                                            if (
                                                this._cartService.user_cart.cart_data.cart[0].items[
                                                    itemIndex
                                                ].specifications[specificationGroupIndex].list[
                                                    specificationIndex
                                                ].quantity === spec.quantity
                                            ) {
                                                return (bool = true);
                                            } else {
                                                return (bool = false);
                                            }
                                        } else {
                                            return (bool = false);
                                        }
                                    });
                                    return (bool = false);

                                } else {
                                    return (bool = false);
                                }
                            } else {
                                return (bool = false);
                            }
                        });
                        return (bool = false);
                    } else {
                        return (bool = false);
                    }
                } else {
                    return (bool = false);
                }
            }
            else {
                return (bool = false);
            }
        });
        return bool;
    }

    addItemInServerCart() {
        this.cartProducts = new cartProductsModel();
        this.cartProductItems = new ItemModel();
        this._cartService.cart_delivery_type = this.helper.delivery_type;
        this._cartService.add_to_cart(this._cartService.cart_delivery_type);
        this.note_for_item = '';
        this.qty = 1;
        this.addCartRef.close()
    }

    increaseValue(product_index: any, itemIdx: any): void {
        if (this.clickTimeout) {
            this.setClickTimeout(() =>
                this.handleIncreaseValue(product_index, itemIdx)
            );
        } else {
            this.setClickTimeout(() =>
                this.handleIncreaseValue(product_index, itemIdx)
            );
        }
    }


    async handleIncreaseValue(product_index: any, itemIdx: any) {
        await this._cartService.increase_qty(product_index, itemIdx);
        setTimeout(() => {
            this.get_order_cart_invoice();
        }, 1000);
    }

    decreaseValue(product_id: any, itemIdx: any): void {

        if (this.clickTimeout) {
            this.setClickTimeout(() =>
                this.handleDecreaseValue(product_id, itemIdx)
            );
        } else {
            this.setClickTimeout(() =>
                this.handleDecreaseValue(product_id, itemIdx)
            );
        }
    }

    async handleDecreaseValue(product_id: any, itemIdx: any) {
        await this._cartService.decrease_qty(product_id, itemIdx);
        setTimeout(() => {
            if (this._cartService._user_cart.cart_data.cart[product_id].items[itemIdx].quantity) {
                this.get_order_cart_invoice();
            }
        }, 1000);
    }

    async onCheckout() {
        if (this.invoice_faild) {
            console.log('cart invoice failed')
            return;
        }
        if (localStorage.getItem('userDetails')) {
            this.user_details = await JSON.parse(localStorage.getItem('userDetails') || '');
        }

        this.helper._route.navigateByUrl('/web-ordering/checkout')
        // if (this.user_details?.isVerify) {
        //     this.tipModalRef = this.modalService.open(this.tipModal, this.tipModalConfig)
        // } else {
        //     this.verificationModel.open()
        // }
    }

}

