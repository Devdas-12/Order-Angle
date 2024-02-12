import { ModalsModule } from './../../layout/modals/modals.module';
import { Component, HostListener, NgModuleRef, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CartService } from 'src/app/data/services/cart.service';
import { HomeService } from 'src/app/data/services/home.service';
import { PaymentService } from 'src/app/data/services/payment.service';
import { ToastService } from 'src/app/data/services/toastr.service';
import { UserService } from 'src/app/data/services/user.service';
import { Helper } from 'src/app/shared/helper';
import { environment } from 'src/environments/environment';

declare var stripe: any;
declare var elements: any;

@Component({
	selector: 'app-checkout',
	templateUrl: './checkout.component.html',
	styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {

	addCardModalRef!: NgbModalRef;
	feesModelRef!: NgbModalRef
	cart_data: any;
	order_details: any;
	modalConfig: any = { centered: true, backdrop: 'static', windowClass: 'modal-regular' }
	feesModalConfig: any = { centered: true, ariaLabelledBy: 'modal-basic-title', windowClass: 'modal-bottom', backdrop: 'static' };
	itemForDelete: any;
	userInfo = false;
	order_payment: any;
	store_details: any;

	@ViewChild('feesModel', { static: true }) feesModel!: TemplateRef<any>;
	@ViewChild('addCardModel', { static: true }) addCardModel!: TemplateRef<any>;
	store: any;
	is_provide_delivery: any;
	is_provide_pickup_delivery: any;
	is_taking_schedule_order: any;
	promo_codes: any;
	timezone: any;
	cardNumber: any;
	cardExpiry: any;
	cardCvc: any;
	card_image: any;
	cardHolder: any;
	paymentGatewayData: any;
	paymentMethod: any;
	payment_id: any;
	payment_name: any;
	cards!: any[];
	selectedcard: any;

	checkOutForm!: FormGroup;
	user_details: any;
	is_ordered_once: any;
	invoice_failed: boolean = true;
	dietary_tags: any;

	constructor(public _cartService: CartService, public helper: Helper, private modalService: NgbModal, private _userService: HomeService, private _paymentService: PaymentService, private _fb: FormBuilder, private toastrService: ToastService) { }

	ngOnInit(): void {
		if (sessionStorage.getItem('table_no')) {
			this.helper.is_table_booking = true;
		}
		if (localStorage.getItem('is_ordered') == 'true') {
			this.is_ordered_once = true;
		}
		this._initPromocodes();
		this._initForm();
		if (localStorage.getItem('userDetails')) {
			this.user_details = JSON.parse(localStorage.getItem('userDetails') || '');
			this._patchValue();
		}
	}

	@HostListener('window:popstate', ['$event'])
	dismissModal() {
		if (this.addCardModalRef) {
			this.addCardModalRef.dismiss();
		}
		if (this.feesModelRef) {
			this.feesModelRef.dismiss();
		}
	}

	_initPromocodes() {
		var store_id = localStorage.getItem('cartStoreId');
		if (store_id) {
			this._cartService.user_cart.cart_data.selectedStoreId = store_id;
			this._userService.get_store({ store_id: this._cartService.user_cart.cart_data.selectedStoreId, is_show_success_toast: false }).then((response: any) => {
				if (response.success) {

					this.store = response.store_detail;
					// this.get_table_details()
					this.getCart();
					this.fetchPaymentGateway();
					this.is_provide_delivery = this.store.is_provide_delivery
					this.is_provide_pickup_delivery = this.store.is_provide_pickup_delivery
					this._cartService.user_cart.is_tax_inclusive = this.store.is_tax_included
					this._cartService.user_cart.is_use_item_tax = this.store.is_use_item_tax
					this.is_taking_schedule_order = response.store_detail.is_taking_schedule_order;
					this.promo_codes = response.promo_codes;

					if (!this.helper.is_table_booking) {
						if (!this.is_provide_delivery && this.is_provide_pickup_delivery) {
							this._cartService.user_cart.is_user_pick_up_order = true
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
		// sessionStorage.getItem('')
	}

	_initForm() {
		this.checkOutForm = this._fb.group({
			name: new FormControl('', [Validators.required]),
			email: new FormControl('', [Validators.email]),
			is_eligable: new FormControl('', [Validators.required]),
			is_marketing: new FormControl('')
		})
	}

	_patchValue() {
		if (this.user_details?.userData?.is_recognized) {
			this.checkOutForm.patchValue({
				name: this.user_details?.userData?.first_name,
				email: this.user_details?.userData?.email,
			})
		}
	}

	async getCart() {
		await this._cartService.update_local_cart('')
		await this.user_get_cart_invoice();
	}

	user_get_cart_invoice() {
		this._cartService.get_order_cart_invoice(0, 0, this.helper.tip_amount).then((res) => {
			if (res.success) {
				this.order_payment = res.order_payment;
				this.invoice_failed = false;
			} else {
				this.invoice_failed = true;
			}
		})
	}

	onBack() {
		this.helper._route.navigateByUrl('/cart')
	}

	onFees() {
		this.feesModelRef = this.modalService.open(this.feesModel, this.feesModalConfig)
	}

	_initCards() {
		return new Promise((resolve, rejects) => {
			this._paymentService.get_card_list({ user_id: this.user_details?.userData?._id, server_token: this.user_details?.userData?.server_token, payment_gateway_id: this.payment_id }).then(cards => {
				// this.helper.ngZone.run(() => {
				this.cards = cards || [];

				if (this.cards?.length) {
					const idx = this.cards.findIndex(_c => _c.is_default);
					this.selectedcard = cards[idx];
				}
				// })
			})
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

	addCard() {
		setTimeout(() => {
			this.loadStripe().then(() => {
				if (elements || elements._elements.length) {
					elements._elements = [];
				}

				var style = {
					base: {
						border: '1px solid #E8E8E8',
						':-webkit-autofill': {
							color: '#fce883',
						},
						'::placeholder': {
							color: '#7e7e7e8c',
						},
					},
				};

				this.cardNumber = elements.create('cardNumber', {
					style: style,
					placeholder: '',
					classes: {
						base: 'form-control w-full',
					},
				});

				this.cardExpiry = elements.create('cardExpiry', {
					style: style,
					placeholder: '',
					classes: {
						base: 'form-control w-full',
					},
				});

				this.cardCvc = elements.create('cardCvc', {
					style: style,
					placeholder: '',
					classes: {
						base: 'form-control w-full',
					},
				});

				// this.cardNumber.on('change', (event: any) => {
				// 	// this.card_image = this.getCardImage(event.brand);
				// });

				// this.cardHolder.mount('#cc-holder');
				this.cardNumber.mount('#cc-number');
				this.cardExpiry.mount('#cc-expiry');
				this.cardCvc.mount('#cc-cvc');
				this.googlePay();
			});
		}, 200);
		this.addCardModalRef = this.modalService.open(this.addCardModel, this.feesModalConfig)
	}

	googlePay() {
		const paymentRequest = stripe.paymentRequest({
			country: this.store.country_details.country_code,
			currency: this.store.country_details.currency_code.toLowerCase(),
			total: {
				label: 'Total',
				amount: this.order_payment?.user_pay_payment * 100, // Amount in cents
			},
			requestPayerName: true,
			requestPayerEmail: true,
		});

		// Create the Payment Request button Element
		const paymentRequestButton = elements.create('paymentRequestButton', {
			paymentRequest: paymentRequest,
			style: {
				paymentRequestButton: {
					type: 'default',
					theme: 'dark',
				},
			}
		});

		const canMakePayment = paymentRequest.canMakePayment();
		canMakePayment.then((result: any) => {
			if (result?.googlePay || result?.applePay) {
				paymentRequestButton.mount('#google-pay-button');
			} else {
				let button: any = document.getElementById('google-pay-button');
				button.style.display = 'none';
			}
		});

		// Handle the payment request

		paymentRequest.on('paymentmethod', async (ev: any) => {
			await this._paymentService.get_stripe_payment_intent({ payment_id: this.payment_id }).then(async (client_secret: any) => {

				const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
					client_secret,
					{ payment_method: ev.paymentMethod.id },
					{ handleActions: false }
				);

				if (confirmError) {
					ev.complete('fail');
				} else {
					ev.complete('success');
					if (paymentIntent.status === "requires_action") {
						// Let Stripe.js handle the rest of the payment flow.
						const { error } = await stripe.confirmCardPayment(client_secret);
						if (error) {
							// The payment failed -- ask your customer for a new payment method.
							this.toastrService.showToast('success', 'Payment is failed')
						} else {
							// The payment has succeeded -- show a success message to your customer.
							this.toastrService.showToast('success', 'Payment is Success')
						}
					} else {
						this.toastrService.showToast('success', 'Payment is Success')
						// The payment has succeeded -- show a success message to your customer.
					}
				}
			})
		})
	}

	async fetchPaymentGateway() {
		this.paymentGatewayData = await this._paymentService.get_payment_gateway([], '', '', this.helper.cart_unique_token);
		this.paymentMethod = this.paymentGatewayData.payment_gateway
		const idx = this.paymentGatewayData.payment_gateway.findIndex((_p: any) => _p.name.toLowerCase())
		if (idx !== -1) {
			this.payment_id = this.paymentGatewayData.payment_gateway[idx]._id;
			this.payment_name = this.paymentGatewayData.payment_gateway[idx].name;
		}

		this._initCards();

		// this.fetchCardList();
	}

	async saveCard() {
		const { token, error } = await stripe.createToken(this.cardNumber);
		if (error) {
			this.toastrService.showToast('success', error.message);
			this.addCardModalRef.close();
			this.cardNumber.clear();
		} else {
			// this.isLoading = true;
			var expiry_month = token.card.exp_month;
			var expiry_year = token.card.exp_year;

			if (this.payment_id) {
				this._paymentService.get_stripe_add_card_intent({ payment_id: this.payment_id }).then((client_secret: any) => {
					if (client_secret) {
						stripe.handleCardSetup(client_secret, this.cardNumber, {
							payment_method_data: {
								billing_details: {}
							}
						}).then((result: any) => {
							if (result.error) {
								this.cardNumber.clear();
								// this.cardNumber.removeEventListener('change', this.cardHandler);
								// this.card_error = result.error.message;
								// this._notifierService.showNotification('error', this.card_error);
								// this.isLoading = false;
							} else {
								this._paymentService.add_card({
									payment_id: this.payment_id,
									payment_method: result.setupIntent.payment_method,
									user_id: this.user_details?.userData?._id,
									server_token: this.user_details?.userData?.server_token,
									expiry_month: expiry_month,
									expiry_year: expiry_year
								}).then(is_card_added => {
									if (is_card_added) {
										this.addCardModalRef.close();
										this.cardNumber.clear();
										this._initCards();
										// this.cardNumber.removeEventListener('change', this.cardHandler);
										// this.isLoading = false;
										// this.fetchCardList()
									} else {
										this.addCardModalRef.close();
										// this.isLoading = false;
									}
								})
							}
						});
					}
				})
			} else {
			}
		}
	}

	selectDefault(card_id: any) {
		this.payment_id = card_id.payment_id
		var card_id = card_id._id
		this._paymentService.select_card({ card_id, user_id: this.user_details?.userData?._id, server_token: this.user_details?.userData?.server_token }).then(is_selected => {
			if (is_selected) {
				this._initCards();
			}
		})
	}

	onPay() {
		if (!this.is_ordered_once && this.checkOutForm.invalid) {
			this.checkOutForm.markAllAsTouched();
			return;
		}

		if (this.invoice_failed) {
			console.log('cart invoice failed');
			return;
		}
		let index = this.cards?.findIndex((x: any) => x.is_default == true);
		sessionStorage.setItem('userform', JSON.stringify(this.checkOutForm.value));
		this._cartService.user_cart.cart_data.destination_addresses[0].user_details.name = this.checkOutForm.value.name;
		this._cartService.user_cart.cart_data.destination_addresses[0].user_details.email = this.checkOutForm.value.email;
		this._cartService.user_cart.cart_data.destination_addresses[0].user_details.phone = this.user_details.userData.phone;
		if (index !== -1 && this.cards?.length > 0) {
			this.helper._route.navigateByUrl('/thanks-page');
		} else {
			this.addCard()
		}
	}


}
