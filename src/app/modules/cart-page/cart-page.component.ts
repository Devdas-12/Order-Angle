import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/data/services/cart.service';
import { HomeService } from 'src/app/data/services/home.service';
import { ToastService } from 'src/app/data/services/toastr.service';
import { SidemenuModalComponent } from 'src/app/layout/modals/sidemenu-modal/sidemenu-modal.component';
import { Helper } from 'src/app/shared/helper';

@Component({
	selector: 'app-cart-page',
	templateUrl: './cart-page.component.html',
	styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent {
	modalRef!: NgbModalRef;
	tipModalRef!: NgbModalRef;
	cart_data: any;
	order_details: any;
	modalConfig: any = { centered: true, backdrop: 'static', windowClass: 'modal-regular' }
	tipModalConfig: any = { centered: true, ariaLabelledBy: 'modal-basic-title', windowClass: 'modal-bottom', backdrop: 'static' };
	itemForDelete: any;
	total_items_in_user_cart: number = 0;
	items_in_user_cart: any = [];
	cartSubscription!: Subscription
	selected_store_id: any;
	total_cart_items: any;
	total_cart_price: any;
	store: any;
	tip_amount: any;

	@ViewChild('deleteItem', { static: true }) deleteItem!: TemplateRef<any>;
	@ViewChild('tipModal', { static: true }) tipModal!: TemplateRef<any>;
	@ViewChild('verificationModel', { static: true }) verificationModel!: SidemenuModalComponent;

	clickTimeout: any;
	is_tax_included: any;
	order_payment_details: any;
	is_min_fare_applied!: boolean;
	timezone: string | undefined;
	min_order_price: any;
	is_schedule_order!: boolean;
	schedule_time_error!: boolean;
	is_provide_pickup_delivery: any;
	is_provide_delivery: any;
	isSubscribe: boolean = true;

	select_product_id: any;
	select_item_id: any;
	select_item_index: any;
	select_product_index: any;
	is_get_invoice: any;

	user_details: any;
	invoice_faild: boolean = true;
	dietary_tags: any;
	invoice_error_code: any;

	// tip_array = [];

	constructor(public _cartService: CartService, public helper: Helper, private modalService: NgbModal, private homeService: HomeService, private toastr: ToastService) { }

	ngOnInit(): void {
		this.is_get_invoice = false;
		if (sessionStorage.getItem('table_no')) {
			this.helper.is_table_booking = true;
		} else {
			this.helper.is_table_booking = false;
		}
		let store_detail = JSON.parse(this.helper.store_details)
		this.homeService.get_store({ store_id: store_detail.store_id, is_show_success_toast: false }).then((res) => {
			this.store = res.store_detail;
			this.is_provide_pickup_delivery = this.store.is_provide_pickup_delivery
			this.is_provide_delivery = this.store.is_provide_delivery
			this._cartService.user_cart.is_user_pick_up_order = false;
			this.get_store_data();
			if (!this.helper.is_table_booking) {
				if (!this.is_provide_delivery && this.is_provide_pickup_delivery) {
					this._cartService.user_cart.is_user_pick_up_order = true
				}
			}
			this._cartService.update_local_cart('');
			// this.getCart();

			this.cartSubscription = this._cartService.cartObservable.subscribe(
				(cart) => {
					this.total_items_in_user_cart = 0;
					this.items_in_user_cart = [];

					if (cart) {
						if (this._cartService?.user_cart?.cart_data?.cart.length || cart?.cart_data.cart.length) {
							this.selected_store_id = this._cartService.user_cart.cart_data.selectedStoreId;
							this.total_cart_items = this._cartService.user_cart.cart_data.total_item;
							this._cartService.user_cart.cart_data.cart.forEach((element) => {
								this.total_items_in_user_cart = this.total_items_in_user_cart + element.items.length;
								this.items_in_user_cart.push(element);
								if (this.isSubscribe) {
									this.isSubscribe = !this.isSubscribe
									// setTimeout(() => {
									this.get_order_cart_invoice();
									// }, 100);
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

	@HostListener('window:popstate', ['$event'])
	dismissModal() {
		if (this.modalRef) {
			this.modalRef.dismiss();
		}
		if (this.tipModalRef) {
			this.tipModalRef.dismiss();
		}
	}

	async getCart() {



	}

	get_store_data() {
		let json = { store_id: this.store._id, is_show_success_toast: false }
		this.homeService.get_store_product_item_list(json).then((res) => {
			this.dietary_tags = res.dietary_tags || [];
		})
	}

	get_store_tags(tag: any) {
		if (this.dietary_tags) {
			let index = this.dietary_tags.findIndex((x: any) => x._id == tag)
			if (index != -1) {
				return this.dietary_tags[index].short_name;
			}
		}
	}

	onBack() {
		this.helper._route.navigateByUrl('/menu-home')
	}

	onItemDelete(product_index: any, item: any, item_index: any) {
		this.itemForDelete = item;
		this.select_product_index = product_index;
		// this.select_item_id = product_id;
		this.select_item_index = item_index;
		this.modalRef = this.modalService.open(this.deleteItem, this.modalConfig)

	}

	remove() {
		this._cartService.remove_from_cart(this.select_product_index, this.itemForDelete._id, this.select_item_index);
		this.get_order_cart_invoice();
		this.modalRef.close();
	}

	async onCheckout() {
		if (this.invoice_faild) {
			if (this.invoice_error_code) {
				this.toastr.showToast('success', this.helper._translate.instant(`error-code.${this.invoice_error_code}`))
			}
			return;
		}

		if (this.store.min_order_price > this.order_payment_details.total_order_price) {
			this.toastr.showToast('success', 'Your order value needs to be a minimum of ' + this._cartService.currency + this.store.min_order_price + ' for delivery from this Restuarant.')
			return;
		}

		if (localStorage.getItem('userDetails')) {
			this.user_details = await JSON.parse(localStorage.getItem('userDetails') || '');
		}

		if (this.user_details?.isVerify) {
			this.tipModalRef = this.modalService.open(this.tipModal, this.tipModalConfig)
		} else {
			this.verificationModel.open()
		}
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

	setClickTimeout(callback: any) {
		clearTimeout(this.clickTimeout);
		this.clickTimeout = setTimeout(() => {
			this.clickTimeout = null;
			callback();
		}, 1000);
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
					this.invoice_error_code = res_data.error_code;
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

	get_spec(spec: any) {

	}

	addTip(tipAmount: any) {
		this.helper.tip_amount = tipAmount;
		sessionStorage.setItem('tip_amount', tipAmount);
	}

	tip_and_pay() {
		if (this.helper.tip_amount != '') {
			this.helper._route.navigateByUrl('/checkout');
			this.tipModalRef.close();
		}
	}

	noThanks() {
		sessionStorage.removeItem('tip_amount');
		this.helper.tip_amount = '';
		this.helper._route.navigateByUrl('/checkout');
	}

}
