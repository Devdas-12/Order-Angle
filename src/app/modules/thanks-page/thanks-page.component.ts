import { PaymentService } from 'src/app/data/services/payment.service';
import { Helper } from './../../shared/helper';
import { Component } from '@angular/core';
import { CartService, DELIVERY_TYPE } from 'src/app/data/services/cart.service';
import { UserService } from 'src/app/data/services/user.service';
import { HomeService } from 'src/app/data/services/home.service';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/data/services/toastr.service';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';

declare var stripe: any;
declare var stripe: any;
declare var elements: any;

@Component({
    selector: 'app-thanks-page',
    templateUrl: './thanks-page.component.html',
    styleUrls: ['./thanks-page.component.scss']
})
export class ThanksPageComponent {
    cards: any = [];
    userDetails: any;
    order_payment: any;
    DELIVERY_TYPE = DELIVERY_TYPE;
    capture_amount!: number;
    token: string = '';
    pin_data: any;
    is_order_created: any;
    delivery_note: any;
    is_allow_contactless_delivery = false;
    is_bring_change: boolean = false
    store: any;
    is_provide_pickup_delivery: any;
    is_provide_delivery: any;
    is_taking_schedule_order: any;
    promo_codes: any;
    timezone: any;
    card: any;
    paymentGatewayData!: {
        is_cash_payment_mode: boolean; wallet: number; wallet_currency_code: string; payment_gateway: any[];
    };
    paymentMethod!: any[];
    payment_id: any;
    payment_name: any;
    is_ordered_once: any;
    order_id: any;
    today = new Date()
    date = this.today.getDate();
    time = this.today.getHours() + ':' + this.today.getMinutes();
    order_code: any;
    order_invoice: any;
    order_currency: any;

    constructor(private _helper: Helper, private _paymentService: PaymentService, public cartService: CartService, private _homeService: HomeService, private userService: UserService, private toastr: ToastService) { }

    ngOnInit(): void {
        if (localStorage.getItem('userDetails')) {
            this.userDetails = JSON.parse(localStorage.getItem('userDetails') || '')
        }
        this._initPromocodes();
        if (sessionStorage.getItem('table_no')) {
            this._helper.is_table_booking = true;
        } else {
            this._helper.is_table_booking = false;
        }
        if (localStorage.getItem('is_ordered') == 'true') {
            this.is_ordered_once = true;
        }

        if (localStorage.getItem('order_id')) {
            this.get_invoice();
            this.order_id = localStorage.getItem('order_id');
        }
    }

    ngAfterViewInit() {
        this.loadStripe().then(() => {
            if (elements._elements.length) {
                elements._elements = [];
            }
            this.card = elements.create('card');
        })
    }

    loadStripe(): Promise<boolean> {
        return new Promise((resolve, rejects) => {
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.innerHTML = "var stripe = Stripe('" + environment.STRIPE_KEY + "'); var elements = stripe.elements();";
            document.getElementsByTagName('head')[0].appendChild(script);
            resolve(true);
        })
    }


    backToCheckout() {
        this._helper._route.navigateByUrl('/checkout')
    }

    _initCards() {
        return new Promise((resolve, rejects) => {
            this._paymentService.get_card_list({ user_id: this.userDetails?.userData?._id, server_token: this.userDetails?.userData?.server_token, payment_gateway_id: this.payment_id }).then((cards: any) => {
                this.cards = cards.filter((x: any) => x.is_default);
            })
        })
    }

    _initPromocodes() {
        var store_id = localStorage.getItem('cartStoreId');
        if (store_id) {
            this.cartService.user_cart.cart_data.selectedStoreId = store_id;
            console.log(this.cartService.user_cart);

            this._homeService.get_store({ store_id: this.cartService.user_cart.cart_data.selectedStoreId, is_show_success_toast: false }).then((response: any) => {
                if (response.success) {

                    this.store = response.store_detail;
                    this.fetchPaymentGateway();
                    this.getCart();
                    this._initCards();
                    this.is_provide_delivery = this.store.is_provide_delivery
                    this.is_provide_pickup_delivery = this.store.is_provide_pickup_delivery
                    this.cartService.user_cart.is_tax_inclusive = this.store.is_tax_included
                    this.cartService.user_cart.is_use_item_tax = this.store.is_use_item_tax
                    this.is_taking_schedule_order = response.store_detail.is_taking_schedule_order;
                    this.promo_codes = response.promo_codes;
                    if (!this._helper.is_table_booking) {
                        if (!this.is_provide_delivery && this.is_provide_pickup_delivery) {
                            this.cartService.user_cart.is_user_pick_up_order = true
                        }
                    }
                    if (this.promo_codes?.length) {
                        this.promo_codes.forEach((offer: any) => {
                            offer.days = (offer && offer.days && offer.days.length) ? offer.days.toString().replaceAll(',', ', ') : "";
                        })
                    }
                    this.timezone = response.timezone;
                    // this.lang_change_month_day();
                }
            })
        }

    }

    async getCart() {

        // this._cartService.get_cart('').then((res) => {
        // 	this.cart_data = res.data.cart;
        // 	this.order_details = this.cart_data.order_details;
        // 	console.log(res);
        // })
        await this.cartService.update_local_cart('').then((res: any) => {
            if (!res.success) {
                this._helper._route.navigate(['/'], { queryParams: { _id: this._helper.store_id } });;
            }
        })
        await this.user_get_cart_invoice();
    }

    async fetchPaymentGateway() {
        this.paymentGatewayData = await this._paymentService.get_payment_gateway([], '', '', this._helper.cart_unique_token);
        this.paymentMethod = this.paymentGatewayData.payment_gateway
        // console.log(this.paymentMethod)
        const idx = this.paymentGatewayData.payment_gateway.findIndex((_p: any) => _p.name.toLowerCase())
        // console.log(this.paymentGatewayData.payment_gateway[0].name)
        if (idx !== -1) {
            this.payment_id = this.paymentGatewayData.payment_gateway[idx]._id;
            this.payment_name = this.paymentGatewayData.payment_gateway[idx].name;
        }

        // this.fetchCardList();
    }

    user_get_cart_invoice() {
        this.cartService.get_order_cart_invoice(0, 0, this._helper.tip_amount).then((res) => {
            if (res.success) {
                this.order_payment = res.order_payment;
                this.capture_amount = res.order_payment?.user_pay_payment;
            } else {
                this._helper._route.navigate(['/'], { queryParams: { _id: this._helper.store_id } });
            }
        })
    }

    pay_order_payment() {
        if (sessionStorage.getItem('is_schedule_order') == 'true' && sessionStorage.getItem('schedule_item')) {
            this.cartService.user_cart.is_schedule_order = true;
        }

        let order_details = {
            delivery_note: "",
            delivery_user_name: "",
            delivery_user_phone: "",
            is_allow_contactless_delivery: false,
            order_start_at2: 0,
            order_start_at: 0,
            delivery_type: 1,
            is_bring_change: false
        }

        if (this.cartService.user_cart.is_schedule_order) {
            order_details.order_start_at2 = this.cartService.user_cart.schedule_date1.getTime(),
                order_details.order_start_at = this.cartService.user_cart.schedule_date.getTime()
        }

        let payment_intent_id = null;
        this.cartService.pay_order_payment(false, this.order_payment._id, this.payment_id, DELIVERY_TYPE.DELIVERY, this.token, false, payment_intent_id, this.capture_amount, order_details).then((res_data) => {

            if (res_data.success) {
                var is_payment_paid = res_data.data.is_payment_paid;
                if (is_payment_paid) {
                    this.create_order_service();
                } else {
                    let client_secret = res_data.data.client_secret
                    let payment_method = res_data.data.payment_method;
                    let payment_intent_id = res_data.data.payment_intent_id
                    if (client_secret && payment_method) {
                        // var client_secret = res_data.data.client_secret;
                        stripe.confirmCardPayment(client_secret, { payment_method: payment_method }).then((result: any) => {
                            if (result.error) {
                            } else {
                                this.create_order_service();
                            }
                        });
                    } else if (payment_intent_id.includes('ch_')) {
                        this.create_order_service()
                    }
                }
            } else {
                // this.helper._loader.isLoading = false;
            }
            if (!res_data.success) {
                // this.paystack_status = res_data.data.data.data.status
                // setTimeout(() => {
                //     this.helper._loader.isLoading = false;
                //     this.helper.openModel('paystack_pin');
                // }, 1000);
                this.pin_data = res_data.data.data.data
            }
        })
    }

    create_order_service() {
        this.is_order_created = true;
        let selected_date = this.cartService.user_cart.schedule_date;
        let milisecond = 0;
        let milisecond1 = 0;
        var delivery_type = DELIVERY_TYPE.DELIVERY
        if (this._helper.is_table_booking) {
            delivery_type = DELIVERY_TYPE.TABLE
        } else {
            delivery_type = DELIVERY_TYPE.DELIVERY
        }
        if (this.cartService.user_cart.is_schedule_order) {
            milisecond = selected_date.getTime();
            if (this.cartService.user_cart.schedule_date1) {
                milisecond1 = this.cartService.user_cart.schedule_date1.getTime();
            }
        }
        this.cartService.create_order(this.order_payment._id, milisecond, milisecond1, [], delivery_type, this.delivery_note, this.is_allow_contactless_delivery, this.is_bring_change).then((is_created: any) => {
            if (is_created.success) {
                this.order_id = is_created.order_id;
                localStorage.setItem('order_id', this.order_id);
                this.get_invoice();
                if (!this.is_ordered_once) {
                    this.userUpdate();
                }
                sessionStorage.removeItem('table_no')
                this._helper.is_table_booking = false;
                this._helper.selected_table = '';
                localStorage.removeItem('tip_amount')
                localStorage.setItem('is_ordered', 'true');
                // this._helper._route.navigate(['/'], { queryParams: { _id: this._helper.store_id } });
                sessionStorage.removeItem('userform');
                sessionStorage.removeItem('schedule_item');
                sessionStorage.removeItem('is_schedule_order');
                sessionStorage.removeItem('tip_amount');
                sessionStorage.removeItem('filtered_tags');
            }
        })
    }

    get_invoice() {
        let json = {
            user_id: this.userDetails?.userData?._id,
            server_token: this.userDetails.userData.server_token,
            order_id: localStorage.getItem('order_id'),
            is_show_success_toast: false
        }

        this.cartService.get_invoice(json).then((res) => {
            this.order_invoice = res.order_payment;
            this.order_currency = res.currency;
        })
    }

    userUpdate() {
        let userForm = JSON.parse(sessionStorage.getItem('userform') || '')
        let json = {
            first_name: userForm.name,
            email: userForm.email,
            is_user_allow_data_sharing: userForm.is_marketing,
            server_token: this.userDetails.userData.server_token,
            user_id: this.userDetails.userData._id,
            is_show_success_toast: false
        }
        this.userService.user_update(json).then((res) => {
            if (res.success) {
                this.userDetails = { ...this.userDetails, userData: res.user }
                localStorage.setItem('userDetails', JSON.stringify(this.userDetails));
            }
        })
    }

    download_tax_invoice() {
        let json;
        if (this.order_id) {
            json = {
                user_id: this.userDetails?.userData?._id,
                store_id: this.store._id,
                order_payment_id: this.order_invoice._id,
                cart_id: this.order_invoice.cart_id,
                currency: this.order_currency,
                card: this.cards[0].last_four,
                is_show_success_toast: false
            }
            this.cartService.download_tax_invoice(json).then((res) => {
                if (res.success) {
                    let pdfUrl = environment.API_URL + res.pdf_url
                    this.downloadPdf(pdfUrl)

                }
            })
        } else {
            this.toastr.showToast('success', 'You need to place an order first to download invoice');
        }
    }

    downloadPdf(pdfUrl: string): void {
        this._helper.downloadtoPdf(pdfUrl).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'invoice.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    orderMore() {

        if (this.order_id) {
            sessionStorage.removeItem('table_no')
            this._helper.is_table_booking = false;
            this._helper.selected_table = '';
            localStorage.removeItem('tip_amount')
            localStorage.setItem('is_ordered', 'true');
            this._helper._route.navigate(['/'], { queryParams: { _id: this._helper.store_id } });
            sessionStorage.removeItem('userform');
            sessionStorage.removeItem('schedule_item');
            sessionStorage.removeItem('is_schedule_order');
            sessionStorage.removeItem('tip_amount');
            sessionStorage.removeItem('filtered_tags');
            location.reload();
        } else {
            this._helper._route.navigate(['/menu-home']);
        }
    }

}
