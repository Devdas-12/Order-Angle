import { DEFAULT_IMAGE } from './../../core/constant/constant';
import { environment } from 'src/environments/environment';
import { Component, ElementRef, HostListener, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Helper } from 'src/app/shared/helper';
import { MbscScrollerOptions, setOptions } from '@mobiscroll/angular';
import { NgbCarousel, NgbCarouselConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import { SidemenuModalComponent } from 'src/app/layout/modals/sidemenu-modal/sidemenu-modal.component';
import { CartService } from 'src/app/data/services/cart.service';
import { SwiperContainer } from 'swiper/element';
import { SwiperOptions } from 'swiper/types';
import { HomeService } from 'src/app/data/services/home.service';
import { ActivatedRoute } from '@angular/router';

setOptions({
	theme: 'ios',
	themeVariant: 'light'
});


export var WEEK_DAY: any = {
	0: "Sunday",
	1: "Monday",
	2: "Tuesday",
	3: "Wednesday",
	4: "Thursday",
	5: "Friday",
	6: "Saturday"
};

@Component({
	selector: 'app-home-page',
	templateUrl: './home-page.component.html',
	styleUrls: ['./home-page.component.scss'],
	providers: [NgbCarouselConfig],
})
export class HomePageComponent {

	// @ViewChild('authModel' , {static : false}) authModel! : AuthComponent ;
	@ViewChild('carousel', { static: true }) carousel!: NgbCarousel;
	toValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
	tableNoRef!: NgbModalRef;
	pickupRef!: NgbModalRef;
	imageUrl = environment.IMAGE_URL;
	DEFAULT_IMAGE = DEFAULT_IMAGE;
	subscriptionList: any;
	store_details: any;
	modalConfig: any = { centered: true, ariaLabelledBy: 'modal-basic-title', windowClass: 'modal-bottom', backdrop: 'static' };
	tableNoValue: any = '';
	tableNo: any = this._helper.selected_table || '';
	selectedValue: any;
	date_array: any[] = [];
	dateIndex: number = 0;
	is_schedule_order: Boolean = false;
	store_open_day: string = '';
	is_book_table = true;
	// scrollerOptions: MbscScrollerOptions = {
	// 	display: 'inline',
	// 	rows: 6,
	// 	wheels: [
	// 		[{
	// 			circular: false,
	// 			data: toValues
	// 		}]
	// 	],
	// 	getValue: (event: any) => {
	// 		this.tableNoValue = event[0]
	// 	},
	// };

	diff1!: string;
	timezone: any = "Asia/Kolkata";
	total_minute!: number;
	date_with_Delivery_time!: Date;
	time_array: any[] = [];
	slot1: any = false;
	slot2: any = false;
	slot3: any = false;
	slot4: any = false;
	clicked_date: any = null;
	selected_time: any = null;
	schedule_time: string = '';
	schedule_date: any = '';
	ASAP: any;
	dietary_tags: any = [];
	today_date: any = new Date();
	availableTable: any;
	// imageUrl = environment.IMAGE_URL ;
	store_delivery_close: boolean = false

	@ViewChild('tablemodel', { static: true }) tablemodel!: TemplateRef<any>;
	@ViewChild('pickupmodel', { static: true }) pickupmodel!: TemplateRef<any>;
	@ViewChild('menuModel', { static: false }) menuModel!: SidemenuModalComponent;

	@HostListener('window:popstate', ['$event'])
	dismissModal() {
		if (this.tableNoRef) {
			this.tableNoRef.dismiss();
		}
		if (this.pickupRef) {
			this.pickupRef.dismiss();
		}
	}

	time_index: any;
	schedule_time_error!: boolean;
	index = 0;
	store_id: any = null;

	constructor(public _helper: Helper, private _homeService: HomeService, private modalService: NgbModal, config: NgbCarouselConfig, public _cartService: CartService, private route: ActivatedRoute) {
		config.showNavigationArrows = true;
		config.interval = 100000000;
		config.showNavigationIndicators = false;
	}

	// // Swiper
	// swiperConfig: SwiperOptions = {
	// 	spaceBetween: 10,
	// 	navigation: true,
	// }

	// swiperThumbsConfig: SwiperOptions = {
	// 	spaceBetween: 10,
	// 	slidesPerView: 4,
	// 	freeMode: true,
	// 	watchSlidesProgress: true,
	// }

	// ngAfterViewInit() {
	// 	this.swiper.nativeElement.swiper.activeIndex = this.index;
	// 	this.swiperThumbs.nativeElement.swiper.activeIndex = this.index;
	// }

	slideChange(swiper: any) {
		this.index = swiper.detail[0].activeIndex;
	}

	ngOnInit() {
		this.timezone = moment.tz.zone(moment.tz.guess())?.name;
		localStorage.removeItem('order_id');
		this._helper.dietary_tag_data.next(false)
		this.route.queryParams.subscribe(params => {
			this.store_id = params._id;
			if (this.store_id) {
				this._helper.store_id = this.store_id;
				localStorage.setItem('cartStoreId', this.store_id)
			}
		});
		this.tableNo = this._helper.selected_table || '';
		if (!this.store_id) {
			if (localStorage.getItem('cartStoreId')) {
				this._helper._route.navigate(['/'], { queryParams: { _id: localStorage.getItem('cartStoreId') } });
			}
		}
		this.get_store_data();
		let days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'];
		let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		let day = days[this.today_date.getDay()];
		let month = months[this.today_date.getMonth()];
		let date_format = day + ' ' + this.today_date.getDate() + ' ' + month;
		this.ASAP = date_format;
	}

	get_store_data() {
		let json = { store_id: this.store_id, is_show_success_toast: false }
		this._homeService.get_store_product_item_list(json).then((res) => {
			this.store_details = res.store;
			this.dietary_tags = res.dietary_tags || [];
			this.lang_change_month_day();
			this.tableList();
			this.set_date(this.date_array[this.dateIndex]);
		})
	}

	dayToMonth(day: any) {
		const months = Math.floor(day / 30); // Assuming 30 days per month
		const remainingDays = day % 30;
		return months + remainingDays / 30;
	}

	tableList() {
		this._homeService.get_table_list({ store_id: this.store_details._id, is_show_success_toast: false }).then((res) => {
			this.availableTable = res.table_list;
			this.availableTable = this.availableTable.sort((a: any, b: any) => a.table_no - b.table_no)
			if (this.tableNo == '') {
				this.onSelectTable();
			}
		})
	}

	onSelectTable() {
		this.tableNoRef = this.modalService.open(this.tablemodel, this.modalConfig);
		if (this.availableTable) {
			if (this.availableTable[0].is_bussiness) {
				this.tableNoValue = this.availableTable[0].table_no;
			}
		}

	}

	onSelect() {
		if (this.tableNoValue === '') {
			return;
		}
		console.log(this.tableNoValue);
		
		this.tableNo = this.tableNoValue;
		this._helper.selected_table = this.tableNoValue;
		sessionStorage.setItem('table_no', this.tableNoValue);
		sessionStorage.removeItem('is_schedule_order');
		sessionStorage.removeItem('schedule_item');
		this.selectedValue = this.tableNoValue;
		this.tableNoRef.close();
		// this._helper._route.navigateByUrl('/menu-home');
		this._cartService.clear_cart(false);
	}

	onSwitch() {
		this.tableNoRef.close();
		this.pickupRef = this.modalService.open(this.pickupmodel, this.modalConfig)
	}

	onTagsClick(tag: any) {
		if (this.tableNo == '') {
			sessionStorage.setItem('is_schedule_order', 'true');
			this._cartService.clear_cart(false);
		}
		this._helper.dietary_tag_data.next(tag);
		this._helper._route.navigateByUrl('/menu-home');
	}

	close() {
		this.tableNoRef.close();
	}

	menuOpen() {
		this.menuModel.open();
	}

	lang_change_month_day() {
		let days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'];
		let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		let time_date = new Date();
		time_date.setHours(0, 0, 0, 0);
		this.diff1 = String(parseInt(moment().tz(this.timezone).format("ZZ")) - parseInt(moment(new Date()).format("ZZ")));

		let hour = "0";
		let minute = "0";
		if (this.diff1[0] == "-") {
			if (this.diff1.length == 4) {
				hour = this.diff1[1];
				minute = this.diff1[2] + this.diff1[3];
			} else if (this.diff1.length == 5) {
				hour = this.diff1[1] + this.diff1[2];
				minute = this.diff1[3] + this.diff1[4];
			}
		} else {
			if (this.diff1.length == 3) {
				hour = this.diff1[0];
				minute = this.diff1[1] + this.diff1[2];
			} else if (this.diff1.length == 4) {
				hour = this.diff1[0] + this.diff1[1];
				minute = this.diff1[2] + this.diff1[3];
			}
		}
		this.total_minute = ((Number(hour) * 60) + Number(minute)) * 60000;
		if (this.diff1[0] == "-") {
			this.total_minute = this.total_minute * -1;
		}

		this.date_with_Delivery_time = new Date(new Date(Number(new Date()) + this.total_minute).getTime() + (5 * 60000))
		this.date_with_Delivery_time = new Date(this.date_with_Delivery_time.setSeconds(0, 0))
		for (let i = 0; i < 7; i++) {
			let date = new Date(this.date_with_Delivery_time);
			date.setDate(date.getDate() + i);
			date = new Date(date);
			let day = days[date.getDay()];
			let month = months[date.getMonth()];
			// let date_format = day + ', ' + month + ' ' + date.getDate();
			let date_format = day + ' ' + date.getDate() + ' ' + month;
			this.date_array[i] = { day: date.getDay(), date_format: date_format, isActive: false, date: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() };

		}
		if (this.date_array.length > 0) {
			this.set_date(this.date_array[0]);
		}
	}


	// set_date(date: any) {
	// 	this.slot1 = false;
	// 	this.slot2 = false;
	// 	this.slot3 = false;
	// 	this.slot4 = false;

	// 	if (date == this.date_array[0]) {
	// 		this.schedule_date = date.date;
	// 	}
	// 	this.clicked_date = date.date_format;
	// 	this.date_array.forEach((date_detail) => {
	// 		date_detail.isActive = false;
	// 		if (date_detail.date == date.date) {
	// 			date_detail.isActive = true;
	// 		}
	// 	});

	// 	let checkSelectedDate = new Date(date.date);
	// 	checkSelectedDate.setHours(23, 59, 59, 0);
	// 	let diff = (checkSelectedDate.getTime() - new Date(Number(new Date()) + this.total_minute).getTime()) / 1000;
	// 	diff /= 60;
	// 	diff = Math.abs(Math.round(diff));

	// 	let time_date = new Date(date.date);
	// 	let time_date_close = new Date(date.date);
	// 	let date1 = new Date(date.date);
	// 	this.time_array = [];
	// 	let i = 0;

	// 	let x = date1.setHours(0, 0, 0, 0);
	// 	let x1 = new Date(x);

	// 	time_date_close.setHours(0, 0, 0, 0);
	// 	time_date_close = new Date(time_date_close.setMinutes(time_date_close.getMinutes() + 15)); // Change here
	// 	time_date.setHours(0, 0, 0, 0);
	// 	time_date = new Date(time_date);

	// 	let y = date1.setHours(23, 59, 0, 0);
	// 	let y1 = new Date(y);


	// 	if (this.date_with_Delivery_time < new Date()) {
	// 		this.slot1 = true; // Assuming ASAP corresponds to slot1
	// 		this.time_array.push({
	// 			type: 0, // Use 0 for ASAP
	// 			date: date,
	// 			time_format: 'ASAP',
	// 			time: 'ASAP'
	// 		});
	// 		i++;
	// 	}

	// 	for (; time_date < y1;) {
	// 		let hours = time_date.getHours();
	// 		let am_pm = "AM";
	// 		if (hours > 12) {
	// 			hours -= 12;
	// 			am_pm = "PM";
	// 		} else if (hours === 0) {
	// 			hours = 12;
	// 		}

	// 		let type;
	// 		if (this.date_with_Delivery_time < time_date) {
	// 			if (time_date.getHours() < 6) {
	// 				type = 1;
	// 				this.slot1 = true;
	// 			} else if (time_date.getHours() < 12) {
	// 				type = 2;
	// 				this.slot2 = true;
	// 			} else if (time_date.getHours() < 18) {
	// 				type = 3;
	// 				this.slot3 = true;
	// 			} else {
	// 				type = 4;
	// 				this.slot4 = true;
	// 			}
	// 			this.time_array[i] = {
	// 				type: type,
	// 				date: date,
	// 				time_format: this._helper.pad2(time_date.getHours()) + ':' + this._helper.pad2(time_date.getMinutes()) + ' ' + am_pm,
	// 				time: this._helper.pad2(hours) + ':' + this._helper.pad2(time_date.getMinutes()) + ' ' + am_pm
	// 			};
	// 			i++;
	// 		}

	// 		time_date.setMinutes(time_date.getMinutes() + 15); // Change here
	// 		time_date_close.setMinutes(time_date_close.getMinutes() + 15); // Change here
	// 	}
	// }

	confirmPickup() {
		this.pickupRef.close();
		this._helper.delivery_type = 1;
		sessionStorage.setItem('is_schedule_order', 'true');
		sessionStorage.removeItem('schedule_item');
		if (this._cartService.user_cart.selected_time != 'asap') {
			let selected_date = {
				date: this._cartService.user_cart.schedule_date,
				date1: this._cartService.user_cart.schedule_date1
			}
			sessionStorage.setItem('schedule_item', JSON.stringify(selected_date));
		}
		this.is_book_table = false;
		this.tableNo = '';
		this._helper.selected_table = '';
		this.tableNoValue = '';
		sessionStorage.removeItem('table_no');
		this._helper._route.navigateByUrl('/menu-home');
		this._cartService.clear_cart(false);
	}

	onDine() {
		if (this.tableNo !== '') {
			this._helper._route.navigateByUrl('/menu-home');
		} else {
			this.onSelectTable()
		}
	}

	set_date(date: any) {
		this.slot1 = false;
		this.slot2 = false;
		this.slot3 = false;
		this.slot4 = false;
		var diff1 = String(parseInt(moment().tz(this.timezone).format("ZZ")) - parseInt(moment(new Date()).format("ZZ")));
		var hour = "0";
		var minute = "0";
		if (diff1[0]) {
			if (diff1[0] == "-") {
				hour = '0';
			} else {
				hour = diff1[0]
			}
		}
		if (diff1[1]) {
			if (diff1[1] == '7') {
				minute = 3 + diff1[2];
			} else {
				minute = diff1[1] + diff1[2];
			}

		}
		var total_minute = ((Number(hour) * 60) + Number(minute)) * 60000;
		// if (diff1[0] == "-") {
		//   total_minute = total_minute * -1;
		// }
		var current_store_time = new Date(Number(new Date()) + total_minute);

		if (date == this.date_array[0]) {
			this.schedule_date = date.date;
		}

		this.clicked_date = date.date_format;

		let date_with_Delivery_time = new Date(new Date(Number(new Date()) + total_minute).getTime() + this.store_details.schedule_order_create_after_minute * 60000)
		date_with_Delivery_time = new Date(date_with_Delivery_time.setSeconds(0, 0))
		this.date_array.forEach((date_detail) => {
			date_detail.isActive = false;
			if (date_detail.date == date.date) {
				date_detail.isActive = true;
			}
		});
		let checkSelectedDate = new Date(date.date);
		checkSelectedDate.setHours(23, 59, 59, 0);
		var diff = (checkSelectedDate.getTime() - new Date(Number(new Date()) + total_minute).getTime()) / 1000;
		diff /= 60;
		diff = Math.abs(Math.round(diff));

		var n = checkSelectedDate.getDay();

		let time_date = new Date(date.date);
		let time_date_close = new Date(date.date);
		var date1 = new Date(date.date);
		this.time_array = [];
		var i = 0;

		if (this._cartService.user_cart.is_user_pick_up_order == false) {
			this.store_details.store_delivery_time.sort((a: any, b: any) => a.day - b.day);
			if (this.store_details.is_store_set_schedule_delivery_time == true && this.store_details.store_delivery_time[date.day].is_store_open == true && this.store_details.store_delivery_time[date.day].is_store_open_full_time == false) {
				date1.setHours(0, 0, 0, 0);

				this.store_details.store_delivery_time[date.day].day_time.forEach((store_time: any, index: any) => {

					let x = date1.setHours(Math.floor(store_time.store_open_time / 60), store_time.store_open_time % 60, 0, 0)

					let x1 = new Date(x);
					let x2 = x1.getTime();

					time_date_close.setHours(Math.floor(store_time.store_open_time / 60), store_time.store_open_time % 60, 0, 0);
					time_date_close = new Date(time_date_close.setMinutes(time_date_close.getMinutes() + 15));
					time_date.setHours(Math.floor(store_time.store_open_time / 60), store_time.store_open_time % 60, 0, 0);
					time_date = new Date(time_date);

					let y = date1.setHours(Math.floor(store_time.store_close_time / 60), store_time.store_close_time % 60, 0, 0)
					let y1 = new Date(y);

					for (; time_date < y1;) {
						var hours = time_date.getHours();
						var am_pm = "AM";
						if (hours >= 12) {
							hours = hours > 12 ? hours - 12 : hours;
							am_pm = "PM";
						} else if (hours === 0) {
							hours = 12;
						}
						var hours_close = time_date_close.getHours();
						var am_pm_close = "AM";
						if (hours_close >= 12) {
							hours_close = hours_close > 12 ? hours_close - 12 : hours_close;
							am_pm_close = "PM";
						} else if (hours_close === 0) {
							hours_close = 12;
						}


						let type;
						if (this.date_with_Delivery_time < time_date) {
							if (time_date.getHours() < 6) {
								type = 1;
								this.slot1 = true;
							} else if (time_date.getHours() < 12) {
								type = 2;
								this.slot2 = true;
							} else if (time_date.getHours() < 18) {
								type = 3;
								this.slot3 = true;
							} else {
								type = 4;
								this.slot4 = true;
							}
							this.time_array[i] = {
								type: type,
								date: date,
								time_format: this._helper.pad2(time_date.getHours()) + ':' + this._helper.pad2(time_date.getMinutes()),
								time: this._helper.pad2(hours) + ':' + this._helper.pad2(time_date.getMinutes()) + ' ' + am_pm
							};
							i++;
						}
						time_date.setMinutes(time_date.getMinutes() + 15);
						time_date_close.setMinutes(time_date_close.getMinutes() + 15);
					}
				});
			} else {

				if (this.store_details.store_delivery_time[date.day].is_store_open_full_time) {
					let x = date1.setHours(0, 0, 0, 0)
					let x1 = new Date(x);
					let x2 = x1.getTime();

					time_date_close.setHours(0, 0, 0, 0);
					time_date_close = new Date(time_date_close.setMinutes(time_date_close.getMinutes() + 15));
					time_date.setHours(0, 0, 0, 0);
					time_date = new Date(time_date);

					let y = date1.setHours(23, 59, 0, 0)
					let y1 = new Date(y);

					for (; time_date < y1;) {
						var hours = time_date.getHours();
						var am_pm = "AM";
						if (hours >= 12) {
							hours = hours > 12 ? hours - 12 : hours;
							am_pm = "PM";
						} else if (hours === 0) {
							hours = 12;
						}
						var hours_close = time_date_close.getHours();
						var am_pm_close = "AM";
						if (hours_close >= 12) {
							hours_close = hours_close > 12 ? hours_close - 12 : hours_close;
							am_pm_close = "PM";
						} else if (hours_close === 0) {
							hours_close = 12;
						}

						let type;
						if (this.date_with_Delivery_time < time_date) {
							if (time_date.getHours() < 6) {
								type = 1;
								this.slot1 = true;
							} else if (time_date.getHours() < 12) {
								type = 2;
								this.slot2 = true;
							} else if (time_date.getHours() < 18) {
								type = 3;
								this.slot3 = true;
							} else {
								type = 4;
								this.slot4 = true;
							}
							this.time_array[i] = {
								type: type,
								date: date,
								time_format: this._helper.pad2(time_date.getHours()) + ':' + this._helper.pad2(time_date.getMinutes()),
								time: this._helper.pad2(hours) + ':' + this._helper.pad2(time_date.getMinutes()) + ' ' + am_pm
							};
							i++;
						}
						time_date.setMinutes(time_date.getMinutes() + 15);
						time_date_close.setMinutes(time_date_close.getMinutes() + 15);
					}
				} else {
					this.slot1 = undefined
					this.slot2 = undefined
					this.slot3 = undefined
					this.slot4 = undefined
					this.schedule_date = '';
					this.time_array = [];
				}


			}
		} else {


			if (this.store_details.store_time[n].is_store_open && this.store_details.store_time[n].is_store_open_full_time) {
				let x = date1.setHours(0, 0, 0, 0)
				let x1 = new Date(x);
				let x2 = x1.getTime();

				time_date_close.setHours(0, 0, 0, 0);
				time_date_close = new Date(time_date_close.setMinutes(time_date_close.getMinutes() + 30));
				time_date.setHours(0, 0, 0, 0);
				time_date = new Date(time_date);

				let y = date1.setHours(23, 59, 0, 0)
				let y1 = new Date(y);

				for (; time_date < y1;) {
					var hours = time_date.getHours();
					var am_pm = "AM";
					if (hours > 12) {
						hours -= 12;
						am_pm = "PM";
					} else if (hours === 0) {
						hours = 12;
					}
					var hours_close = time_date_close.getHours();
					var am_pm_close = "AM";
					if (hours_close > 12) {
						hours_close -= 12;
						am_pm_close = "PM";
					} else if (hours_close === 0) {
						hours_close = 12;
					}

					let type;
					if (this.date_with_Delivery_time < time_date) {
						if (time_date.getHours() < 6) {
							type = 1;
							this.slot1 = true;
						} else if (time_date.getHours() < 12) {
							type = 2;
							this.slot2 = true;
						} else if (time_date.getHours() < 18) {
							type = 3;
							this.slot3 = true;
						} else {
							type = 4;
							this.slot4 = true;
						}
						this.time_array[i] = {
							type: type,
							date: date,
							time_format: this._helper.pad2(time_date.getHours()) + ':' + this._helper.pad2(time_date.getMinutes()),
							time: this._helper.pad2(hours) + ':' + this._helper.pad2(time_date.getMinutes()) + ' ' + am_pm
						};
						i++;
					}
					time_date.setMinutes(time_date.getMinutes() + 30);
					time_date_close.setMinutes(time_date_close.getMinutes() + 30);
				}
			} else if (this.store_details.store_time[n].is_store_open && !this.store_details.store_time[n].is_store_open_full_time) {
				this.store_details.store_time[n].day_time.forEach((store_time: any, index: any) => {


					let x = date1.setHours(Math.floor(store_time.store_open_time / 60), store_time.store_open_time % 60, 0, 0)
					let x1 = new Date(x);
					let x2 = x1.getTime();

					time_date_close.setHours(Math.floor(store_time.store_open_time / 60), store_time.store_open_time % 60, 0, 0);
					time_date_close = new Date(time_date_close.setMinutes(time_date_close.getMinutes() + 30));
					time_date.setHours(Math.floor(store_time.store_open_time / 60), store_time.store_open_time % 60, 0, 0);
					time_date = new Date(time_date);

					let y = date1.setHours(Math.floor(store_time.store_close_time / 60), store_time.store_close_time % 60, 0, 0)
					let y1 = new Date(y);

					for (; time_date < y1;) {
						var hours = time_date.getHours();
						var am_pm = "AM";
						if (hours > 12) {
							hours -= 12;
							am_pm = "PM";
						} else if (hours === 0) {
							hours = 12;
						}
						var hours_close = time_date_close.getHours();
						var am_pm_close = "AM";
						if (hours_close > 12) {
							hours_close -= 12;
							am_pm_close = "PM";
						} else if (hours_close === 0) {
							hours_close = 12;
						}

						let type;
						if (this.date_with_Delivery_time < time_date) {
							if (time_date.getHours() < 6) {
								type = 1;
								this.slot1 = true;
							} else if (time_date.getHours() < 12) {
								type = 2;
								this.slot2 = true;
							} else if (time_date.getHours() < 18) {
								type = 3;
								this.slot3 = true;
							} else {
								type = 4;
								this.slot4 = true;
							}
							this.time_array[i] = {
								type: type,
								date: date,
								time_format: this._helper.pad2(time_date.getHours()) + ':' + this._helper.pad2(time_date.getMinutes()),
								time: this._helper.pad2(hours) + ':' + this._helper.pad2(time_date.getMinutes()) + ' ' + am_pm
							};
							i++;
						}

						time_date.setMinutes(time_date.getMinutes() + 30);
						time_date_close.setMinutes(time_date_close.getMinutes() + 30);
					}
				});
			} else {
				this.slot1 = undefined
				this.slot2 = undefined
				this.slot3 = undefined
				this.slot4 = undefined
				this.schedule_date = '';
				this.time_array = [];
			}
		};
		this.time_array = this.time_array.sort((a, b) => {
			// Extracting time strings
			const timeFormatA = a.time_format;
			const timeFormatB = b.time_format;

			// Comparing time strings
			if (timeFormatA < timeFormatB) return -1;
			if (timeFormatA > timeFormatB) return 1;
			return 0;
		});
	}


	convertTimeSlotsToDayStartToEnd(slots: any) {
		const dayStart = 0; // Start of the day in minutes
		const dayEnd = 1440; // End of the day in minutes

		// Convert time slots to day start to end format
		const dayStartToEndSlots = [];

		for (const slot of slots) {
			const openTime = slot.store_open_time >= 0 ? slot.store_open_time : slot.store_open_time + 1440;
			const closeTime = slot.store_close_time >= 0 ? slot.store_close_time : slot.store_close_time + 1440;

			dayStartToEndSlots.push({ "store_open_time": openTime, "store_close_time": closeTime });
		}

		// Merge overlapping slots
		const mergedSlots = [];
		let currentSlot = dayStartToEndSlots[0];

		for (let i = 1; i < dayStartToEndSlots.length; i++) {
			const nextSlot = dayStartToEndSlots[i];

			if (nextSlot.store_open_time <= currentSlot.store_close_time) {
				// Merge overlapping slots
				currentSlot.store_close_time = Math.max(currentSlot.store_close_time, nextSlot.store_close_time);
			} else {
				// Add non-overlapping slot to the result
				mergedSlots.push({ "store_open_time": currentSlot.store_open_time, "store_close_time": currentSlot.store_close_time });
				currentSlot = nextSlot;
			}
		}

		// Add the last slot
		mergedSlots.push({ "store_open_time": currentSlot.store_open_time, "store_close_time": currentSlot.store_close_time });

		// Sort slots by open time (day start to end)
		mergedSlots.sort((a, b) => a.store_open_time - b.store_open_time);

		return mergedSlots;
	}

	splitTimeRange(timeRange: any) {
		const [start, end] = timeRange.split(' - ');
		return [start, end];
	}

	set_time(time: any) {
		this._cartService.user_cart.selected_time = time;
		if (time != 'asap') {
			this.schedule_time = time.time_format;
			this.schedule_date = time.date.date;
			this.clicked_date = time.date.date_format;
			this.set_order_time(true);
			this.set_schedule(true);
		}
	}

	set_order_time(boolean: any) {

		if (boolean) {
			if (this.schedule_date !== '' && this.schedule_time !== '') {

				let server_date: any = new Date(this._cartService.user_cart.server_time);
				server_date = new Date(server_date).toLocaleString("en-US", { timeZone: this.timezone })
				server_date = new Date(server_date);

				let date = JSON.parse(JSON.stringify(this.schedule_date.split('-')));
				var schedule_time = this.schedule_time.split('-');

				let time = schedule_time[0].split(':')
				var selected_date1 = null;

				if (schedule_time[0] && schedule_time[0] != "") {
					let time1: any = schedule_time[0].split(':')
					selected_date1 = new Date(Date.now());
					selected_date1 = new Date(selected_date1).toLocaleString("en-US", { timeZone: this.timezone })
					selected_date1 = new Date(selected_date1);
					selected_date1.setDate(date[2])
					selected_date1.setMonth(date[1] - 1)
					selected_date1.setFullYear(date[0])
					selected_date1.setHours(time1[0], time1[1], 0, 0);
				}
				let selected_date: any = new Date(Date.now());
				selected_date = new Date(selected_date).toLocaleString("en-US", { timeZone: this.timezone })
				selected_date = new Date(selected_date);
				selected_date.setDate(date[2])
				selected_date.setMonth(date[1] - 1)
				selected_date.setFullYear(date[0])
				selected_date.setHours(time[0], time[1], 0, 0);
				let timeDiff = Math.round(selected_date.getTime() - server_date.getTime());

				if (timeDiff / 60000 >= 30) {

					this._cartService.user_cart.schedule_date = selected_date;
					this._cartService.user_cart.schedule_date1 = selected_date1;


					if (Number(schedule_time[0].split(":")[0]) > 12) {
						schedule_time[0] = this._helper.pad2(Number(schedule_time[0].split(":")[0]) - 12) + ':' + schedule_time[0].split(":")[1] + ' PM';
					} else {
						schedule_time[0] = schedule_time[0] + ' AM';
					}

					if (Number(schedule_time[0].split(":")[0]) > 12) {
						schedule_time[0] = this._helper.pad2(Number(schedule_time[1].split(":")[0]) - 12) + ':' + schedule_time[0].split(":")[0] + ' PM';
					} else {
						schedule_time[0] = schedule_time[0] + ' AM';
					}
					this._cartService.user_cart.clicked_date = this.clicked_date + ' ' + schedule_time;

				} else {
					// this._helper.trans.instant('store_not_provide_service_at_this_time');
				}
			} else {
				// store_not_provide_service_at_this_time
			}

		} else {
			// this._cartService.user_cart.schedule_date = null;
			this.schedule_date = '';
			this.schedule_time = '';
		}
		this.check_valid_time();
	}

	set_schedule(bool: any) {
		if (bool) {
			if (this._cartService.user_cart.schedule_date) {
				this._cartService.user_cart.is_schedule_order = true;
				// this._notifierService.showNotification('success', this._translateService.instant('schedule-time-select-successfully'));
				// $('.schedule-form').css('display', 'none');
				// setTimeout(() => {
				// 	$('.schedule-form').css('display', '');
				// }, 100);
				// this.onFilter(null);
				// this.filter_stores = this.stores.filter((store : any) => store.is_taking_schedule_order == true)
				// this.total_stores = this.filter_stores.length

			} else {
				// this._notifierService.showNotification('error', this._translateService.instant('please-select-time-to-schedule-order'));
			}
		} else {
			this._cartService.user_cart.is_schedule_order = false;
			this._cartService.user_cart.schedule_date = null;
			this._cartService.user_cart.selected_time = null;
			// this.onFilter(null);
			let date: any = this._cartService.user_cart.server_time;
			date = new Date(date).toLocaleString("en-US", { timeZone: this.timezone })
			date = new Date(date);
			this.check_open(date, true);
		}
	}


	onSlide(e: any) {
		this.dateIndex = parseInt(e.current.replace("slideId_", ""), 10);
		this.set_date(this.date_array[this.dateIndex]);
	}

	check_open(selected_date: any, today: any) {
		var date: any = JSON.parse(JSON.stringify(selected_date));
		var curDate = new Date(date).getTime();
		date = new Date(date)

		let weekday = date.getDay();
		let current_time = curDate;
		this.store_details.close = true;
		this.store_details.nextopentime = '';


		if (today) {
			this.store_open_day = 'Today';
		} else {
			this.store_open_day = WEEK_DAY[weekday];
		}
		if (this.store_details.store_time.length == 0) {
			return;
		}
		let week_index = this.store_details.store_time.findIndex((x: any) => x.day == weekday)
		let day_time = this.store_details.store_time[week_index].day_time;
		if (this.store_details.store_time[week_index].is_store_open_full_time) {
			this.store_details.close = false;
		} else {
			if (this.store_details.store_time[week_index].is_store_open) {
				if (day_time.length == 0) {
					this.store_details.close = true;
				} else {
					day_time.forEach((store_time: any, index: any) => {
						let x = date.setHours(Math.floor(store_time.store_open_time / 60), store_time.store_open_time % 60, 0, 0)
						let x1 = new Date(x);
						let x2 = x1.getTime();

						let y = date.setHours(Math.floor(store_time.store_close_time / 60), store_time.store_close_time % 60, 0, 0)
						let y1 = new Date(y);
						let y2 = y1.getTime();

						if (current_time >= x2 && current_time < y2) {
							this.store_details.close = false;
						}

						if (current_time < x2 && this.store_details.nextopentime == '') {
							this.store_details.nextopentime = this._helper.pad2(Math.floor(store_time.store_open_time / 60)) + ':' + this._helper.pad2(store_time.store_open_time % 60);
						}
					});
					if (this.store_details.nextopentime == '' && this.store_details.close) {
						this.store_details.nextopentime = day_time[0].store_open_time
					}


				}
			} else {
				this.store_details.close = true;
			}
		}

		// if(!this._cartService.user_cart.is_user_pick_up_order && this._cartService.user_cart.is_schedule_order){
		this.check_delivery_time(selected_date, today);
		// }

	}

	check_delivery_time(selected_date: any, today: any) {

		if (this._cartService.user_cart.is_user_pick_up_order) {
			this.store_delivery_close = false
		} else {
			var date: any = JSON.parse(JSON.stringify(selected_date));
			var curDate = new Date(date).getTime();
			date = new Date(date)
			let weekday = date.getDay();
			let current_time = curDate;
			this.store_delivery_close = true;
			this.store_details.nextopentime = '';
			if (today) {
				this.store_open_day = 'Today';
			} else {
				this.store_open_day = WEEK_DAY[weekday];
			}
			let week_index = this.store_details.store_delivery_time.findIndex((x: any) => x.day == weekday)
			let day_time = this.store_details.store_delivery_time[week_index].day_time;
			if (this.store_details.store_delivery_time[week_index].is_store_open_full_time) {
				this.store_delivery_close = false;

			}
			else {
				if (this.store_details.store_delivery_time[week_index].is_store_open) {
					if (day_time.length == 0) {
						this.store_delivery_close = true;

					} else {
						day_time.forEach((store_delivery_time: any, index: any) => {
							let x = date.setHours(Math.floor(store_delivery_time.store_open_time / 60), store_delivery_time.store_open_time % 60, 0, 0)
							let x1 = new Date(x);
							let x2 = x1.getTime();

							let y = date.setHours(Math.floor(store_delivery_time.store_close_time / 60), store_delivery_time.store_close_time % 60, 0, 0)
							let y1 = new Date(y);
							let y2 = y1.getTime();

							if (current_time >= x2 && current_time < y2) {
								this.store_delivery_close = false;
							}

							if (current_time < x2 && this.store_details.nextopentime == '') {
								this.store_details.nextopentime = this._helper.pad2(Math.floor(store_delivery_time.store_open_time / 60)) + ':' + this._helper.pad2(store_delivery_time.store_open_time % 60);
							}
						});
						if (this.store_details.nextopentime == '') {
							this.store_details.nextopentime = day_time[0].store_open_time
						}
					}
				} else {
					this.store_delivery_close = true;

				}
			}
			if (this.store_delivery_close) {
				// this._notifierService.showNotification('error', this._helper.trans.instant('label-title.invalid-slot-selected'));
				// this.set_schedule(false);
				// this._cartService.user_cart.is_schedule_order = false;
				// this._cartService.user_cart.schedule_date = null;
				// this.selected_time = null;
			}
		}

	}

	check_valid_time() {

		this.is_schedule_order = this._cartService.user_cart.is_schedule_order;

		let server_date: any = new Date(this._cartService.user_cart.server_time);
		server_date = new Date(server_date).toLocaleString("en-US", { timeZone: this.timezone })
		server_date = new Date(server_date);

		let selected_date: any = this._cartService.user_cart.schedule_date

		let day_diff = selected_date.getDay() - server_date.getDay();
		let timeDiff = Math.round(selected_date.getTime() - server_date.getTime());

		if (timeDiff / 60000 >= 30) {
			this.schedule_time_error = false;
			if (day_diff > 0) {
				this.check_open(selected_date, false);
			} else {
				this.check_open(selected_date, true);
			}

		} else {
			this.schedule_time_error = true;
		}
	}

	// ngOnDestroy() {
	// 	if (this.tableNoRef || this.pickupRef) {
	// 		this.tableNoRef.dismiss();
	// 		this.pickupRef.dismiss();
	// 	}
	// }


} 
