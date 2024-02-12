import { DEFAULT_IMAGE } from './../../core/constant/constant';
import { Component, ElementRef, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Cart, ItemModel, cartProductsModel } from 'src/app/core/models/cart.model';
import { CartService } from 'src/app/data/services/cart.service';
import { HomeService } from 'src/app/data/services/home.service';
import { UserService } from 'src/app/data/services/user.service';
import { SidemenuModalComponent } from 'src/app/layout/modals/sidemenu-modal/sidemenu-modal.component';
import { Helper } from 'src/app/shared/helper';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-menu-home',
	templateUrl: './menu-home.component.html',
	styleUrls: ['./menu-home.component.scss']
})
export class MenuHomeComponent {
	@ViewChild('menuModel', { static: false }) menuModel!: SidemenuModalComponent;

	filterRef!: NgbModalRef;
	addCartRef!: NgbModalRef;
	cartSubscription!: Subscription;
	DEFAULT_IMAGE = DEFAULT_IMAGE;
	product_data: any;
	products: any;
	product_items: any;
	filter_items: any = [];
	famous_products_tags: any = [{ name: '', short_name: '', _id: '', checked: false }];
	image_url = environment.IMAGE_URL;
	modalConfig: any = { centered: true, ariaLabelledBy: 'modal-basic-title', windowClass: 'modal-bottom', backdrop: 'static' };
	cartModalConfig: any = { fullscreen: true, windowClass: 'modal-right', backdrop: 'static' };
	selected_item: any = '';
	required_count!: number;
	total: any;
	required_temp_count!: number;
	qty!: number;
	currencySign: any;
	store_detail: any;
	note_for_item: any;
	clickTimeout: any = null;
	store_id: any;
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
	selected_product_name: any;
	search_value = '';
	is_readonly = true;


	@ViewChild('filtermenumodel', { static: true }) filtermenumodel!: TemplateRef<any>;
	@ViewChild('addCartModel', { static: true }) addCartModel!: TemplateRef<any>;
	delivery_note!: string;
	selectedAddress!: string;
	total_items_in_user_cart!: number;
	items_in_user_cart: any;
	tax_list!: { tax_name: any; tax_amount: any; }[];
	is_order_created!: boolean;
	is_table_booking!: boolean;
	is_pickup!: boolean;
	private isMobile!: boolean;

	mainItems!: NodeListOf<HTMLElement>;
	currentSection!: string;

	constructor(private _homeService: HomeService, private modalService: NgbModal, private helper: Helper, private _cartService: CartService, private _authService: UserService, private elementRef: ElementRef, private location: Location, private locationStrategy: LocationStrategy) { }

	ngOnInit() {
		// this.helper.loadScript('/assets/js/custom.js');
		if (sessionStorage.getItem('filtered_tags')) {
			this.filter_name = this.filtered_tags = JSON.parse(sessionStorage.getItem('filtered_tags') || '')
		}
		this._cartService.update_local_cart('');
		this.helper.storeObservable.subscribe((res: any) => {
			if (res) {
				this.store_detail = res;
				this.store_id = res?._id;
			}
		});

		this.cartSubscription = this._cartService.cartObservable.subscribe(async (cart) => {
			this._initCartItemQty();
			this.cardData = cart;
			if (cart) {
				this.delivery_note = cart.cart_data.destination_addresses[0].note;
				this.selectedAddress = cart.cart_data.destination_addresses[0].address;
				if (sessionStorage.getItem('table_no')) {
					this.helper.delivery_type = 3;
					this.helper.is_table_booking = true;
					this._cartService.user_cart.table_no = Number(sessionStorage.getItem('table_no') || '');
					this.is_table_booking = true;
				}
				if (sessionStorage.getItem('is_schedule_order')) {
					this._cartService.user_cart.is_user_pick_up_order = true;
					this.is_pickup = true;
					if (sessionStorage.getItem('schedule_item')) {
						this._cartService.user_cart.schedule_date = new Date(JSON.parse(sessionStorage.getItem('schedule_item') || '')?.date);
						this._cartService.user_cart.schedule_date1 = new Date(JSON.parse(sessionStorage.getItem('schedule_item') || '')?.date1);
						this._cartService.user_cart.is_schedule_order = true;
					} else {
						this._cartService.user_cart.is_schedule_order = false;
					}
				}
				this.total_items_in_user_cart = 0;
				this.items_in_user_cart = [];
				cart.cart_data.cart.forEach((element) => {
					this.total_items_in_user_cart =
						this.total_items_in_user_cart + element.items.length;
					this.items_in_user_cart.push(element);
				});

				// let item_taxes = [];

				// for (let item of this.items_in_user_cart) {
				// 	for (let sub_item of item.items) {
				// 		let tax_index = item_taxes.findIndex(
				// 			(e) => e.tax_name === sub_item.tax
				// 		);
				// 		if (tax_index === -1) {
				// 			item_taxes.push({
				// 				tax_name: sub_item.tax,
				// 				tax_amount: sub_item.total_item_tax,
				// 			});
				// 		} else {
				// 			item_taxes[tax_index].tax_amount =
				// 				item_taxes[tax_index].tax_amount + sub_item.total_item_tax;
				// 		}
				// 	}
				// }

				// this.tax_list = item_taxes;

				if (
					this.total_items_in_user_cart === 0 &&
					this.is_order_created === false &&
					this._cartService.user_cart.table_no === 0
				) {
					// this._helper.isCartShow = false;
					// this._helper._route.navigate(['/']);
				}
			} else {
				// this.helper._route.navigate(['/']);
			}
		}
		);
		setTimeout(() => {
			this.get_product_item_list();
		}, 200);
	}

	@HostListener('window:popstate', ['$event'])
	onPopState(event: any) {
		// Prevent default behavior only on mobile devices
		event.preventDefault();

		// Close the modal if it's open
		if (this.modalService.hasOpenModals()) {
			this.closeModal();
		}
	}

	closeModal() {
		// Close the ng-bootstrap modal
		this.modalService.dismissAll();
	}

	get_product_item_list() {
		let store_detail = JSON.parse(this.helper.store_details);
		let json = {
			store_id: store_detail?.store_id,
			is_show_success_toast: false
		};
		this._homeService.get_store_product_item_list(json).then((response) => {
			if (response.success) {
				this.helper.tagObservable.subscribe(async (tags: any) => {
					this.product_data = response;
					this.currencySign = response.currency;
					this.store = response.store;
					this.products = response.products;
					this.filter_items = await [...this.products];
					this.filterItems();

					this.onItemClick(this.filter_items[0]._id, '');
					this.famous_products_tags = response.dietary_tags;
					if (tags) {
						if (tags.short_name !== '') {
							this.filtered_tags = [tags.short_name]
							this.famous_products_tags.forEach((element: any) => {
								if (element._id == tags._id) {
									element.checked = true;
								}
							});
						} else {
							this.filtered_tags = [tags.name];
							this.famous_products_tags.forEach((element: any) => {
								if (element._id == tags._id) {
									element.checked = true;
								}
							});
						}
					} else {
						this.product_data = response;
						this.products = response.products;
						this.store = response.store;
						this.famous_products_tags = response.dietary_tags;
					}
					this.filter_items = this.filterProduct(this.products);
					setTimeout(() => {
						this._initCartItemQty();
					}, 200);
				});
			}
		});
	}

	filterItems() {
		// this.filter_items.forEach((products: any) => {
		// 	products.items = products.items.filter((item: any) =>
		// 		(this.is_table_booking && item.is_dine_in_type_order) || (this.is_pickup && item.is_pickup_type_order)
		// 	);
		// });
	}

	onSectionChange(sectionId: string) {
		this.currentSection = sectionId;
		let index = this.filter_items.findIndex((x: any) => x._id._id == sectionId)
		let elemnt: any = document.getElementById(this.filter_items[index]._id.unique_id);
		let scrollElem: any = document.getElementById('tags')

		let elementStyle: any = getComputedStyle(elemnt);
		let elementWidth = elemnt.clientWidth - (parseFloat(elementStyle.paddingLeft) + parseFloat(elementStyle.paddingRight));
		let elementPositions: any = elemnt.getBoundingClientRect()
		// return properties;
		const activeWidth = elementWidth / 2;
		const pos = elementPositions.left + activeWidth;
		const currentScroll = scrollElem.scrollLeft;
		const divWidth = scrollElem.offsetWidth;
		const newPos = pos + currentScroll - divWidth / 2;

		scrollElem.scrollTo({
			left: newPos
			, behavior: 'smooth'
		});
	}

	// filterItemsByTag(productsArray: any, tagName: any) {
	// 	// Iterate through each product object in the array
	// 	const filteredProductsArray = productsArray.map((productObj: any) => {
	// 		// Extract the 'items' array from the nested structure
	// 		const products = productObj.items;
	// 		// Filter products based on the specified tag in dietary_tags or filter_tags
	// 		const filteredProducts = products.filter((product: any) =>
	// 			product.dietary_tags.includes(tagName) || product.filter_tags.includes(tagName)
	// 		);
	// 		// Update the original object with the filtered products
	// 		productObj.items = filteredProducts;

	// 		return productObj;
	// 	});

	// 	return filteredProductsArray;
	// }

	doesItemContainTags(item: any, tags: any) {
		if (item) {
			const hasMatchingTags = tags.some((tag: any) => item.dietary_tags?.includes(tag) || item.filter_tags?.includes(tag))
			return hasMatchingTags;
		}
	}

	filterProduct(products: any) {
		if (this.filtered_tags.length > 0) {
			return products.map((product: any) => {
				return {
					...product,
					items: product.items.filter((item: any) => {
						const hasDietaryTags = this.filtered_tags.some((tag: any) => item.dietary_tags.includes(tag));
						const hasFilterTags = this.filtered_tags.some((tag: any) => item.filter_tags.includes(tag));

						return hasDietaryTags || hasFilterTags;
					}),
				};
			});
		} else {
			return products;
		}
	}



	menuOpen() {
		this.menuModel.open();
	}

	onFilter() {
		this.filterRef = this.modalService.open(this.filtermenumodel, this.modalConfig)
	}

	onTagFilter(value: any) {
		if (value) {
			value.checked = !value.checked;
		}

		const filteredItems = this.famous_products_tags.filter((item: any) => item.checked === true).map((item: any) => (item.short_name ? item.short_name : item.name));
		this.filter_name = filteredItems;
	}

	confirmFilter() {
		const filteredItems = this.famous_products_tags.filter((item: any) => item.checked === true).map((item: any) => (item.short_name ? item.short_name : item.name));
		this.filtered_tags = filteredItems;
		this.filterRef.close();
		sessionStorage.setItem('filtered_tags', JSON.stringify(this.filtered_tags))
		this.filter_items = this.filterProduct(this.products)
		// this.doesProductsItems()
	}

	onItemClick(item: any, axis: any) {
		this.selected_product_name = item;
		this.currentSection = item._id;
		let elmnt: any = document.getElementById(item._id);
		if (elmnt) {
			window.scrollTo({
				top: elmnt.offsetTop - 100,
				behavior: "smooth",
			});
		}
	}

	scrollOn(axis: any) {
		window.scrollBy(40, 0);
	}

	_initCartItemQty() {
		this.filter_items.forEach((product: any) => {
			product.items.forEach((item: any) => {
				item.qty = 0;
				item.is_qty_mismatch = null;
			});
		});

		this.filter_items.forEach((product: any) => {
			product.items.forEach((item: any) => {
				if (this._cartService.user_cart.cart_data.cart) {
					this._cartService.user_cart.cart_data.cart.forEach((product: any) => {
						if (product.items[0].item_id == item._id) {
							if (item.qty != 0) {
								item.is_qty_mismatch = true;
							}
							item.qty = item.qty + product.items[0].quantity;
						}

					})
				}
			});
		});

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

		// const inputField = this.elementRef.nativeElement.querySelector('#inputField');
		// if (inputField) {
		// 	inputField.blur();
		// }
		// }
	}

	onAddProduct(item: any) {
		if (this.isMobile) {
			window.history.pushState({ modalOpen: true }, '');
		}
		setTimeout(() => {
			this.addCartRef = this.modalService.open(this.addCartModel, this.cartModalConfig);
		}, 200);
		this.product_name = this.products[this.selected_product]._id.name;
		this.product_unique_id = this.products[this.selected_product]._id.unique_id;
		this.current_main_item = item;
		this.selected_item = JSON.parse(JSON.stringify(item));

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
		// });
		this.selected_item.specifications =
			this.selected_item.specifications.filter(
				(s: any) => s.is_visible_in_store != false
			);
		this.selected_item.specifications.forEach((sp: any) => {
			sp.list = sp.list.filter((s: any) => s.is_visible_in_store != false);
		});
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

	openRepeatModal(item: any) {

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
		if (this.is_table_booking) {
			this.total = this.selected_item.is_dine_in_price;
		}
		if (this.is_pickup) {
			this.total = this.selected_item.is_pickup_price;
		}

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
		if (this.is_table_booking) {
			this.cartProductItems.item_price = this.selected_item.is_dine_in_price;
		}
		if (this.is_pickup) {
			this.cartProductItems.item_price = this.selected_item.is_pickup_price;
		}
		this.item_price = this.cartProductItems.item_price;
		this.total_item_price = this.item_price + specificationPriceTotal;
		this.cartProductItems.total_specification_price = specificationPriceTotal;
		this.cartProductItems.total_item_price = this.total;
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
			if (this.is_table_booking) {
				total_price = Number(this.selected_item.is_dine_in_price) + specificationPriceTotal;
			}
			if (this.is_pickup) {
				total_price = Number(this.selected_item.is_pickup_price) + specificationPriceTotal;
			}

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

		this.addCartRef.close();
		this.is_readonly = true
		this.qty = 1;
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
		this.addCartRef.close();
		this.is_readonly = true
	}

}
