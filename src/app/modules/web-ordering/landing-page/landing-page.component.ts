import { Component, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { NgbCarouselConfig, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HomeService } from 'src/app/data/services/home.service';
import { Helper } from 'src/app/shared/helper';
import * as moment from 'moment-timezone';
import { CartService } from 'src/app/data/services/cart.service';
import { environment } from 'src/environments/environment';
import { LocationModel } from 'src/app/data/services/payment.service';

export var WEEK_DAY: any = {
	0: "Sunday",
	1: "Monday",
	2: "Tuesday",
	3: "Wednesday",
	4: "Thursday",
	5: "Friday",
	6: "Saturday"
};

declare var google: any;
@Component({
	selector: 'app-landing-page',
	templateUrl: './landing-page.component.html',
	styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent {
	modalRef!: NgbModalRef;
	scheduleModalRef!: NgbModalRef;
	modalConfig: any = { centered: true, backdrop: 'static', windowClass: 'modal-web modal-md' }
	scheduleConfig: any = { centered: true, backdrop: 'static', windowClass: 'modal-web' }
	date_array: any[] = [];
	time_array: any[] = [];
	today_date: any = new Date();
	ASAP: any;
	store_details: any;
	dietary_tags: any;
	dateIndex: number = 0;
	diff1!: string;
	timezone: any = "Asia/Kolkata";
	total_minute!: number;
	date_with_Delivery_time!: Date;
	slot1: any = false;
	slot2: any = false;
	slot3: any = false;
	slot4: any = false;
	clicked_date: any = null;
	selected_time: any = null;
	schedule_time: string = '';
	schedule_date: any = '';
	is_schedule_order: any;
	schedule_time_error: any;
	store_open_day: string = '';
	store_delivery_close: boolean = false;
	time_length = 21;

	@ViewChild('changeAddress', { static: true }) changeAddress!: TemplateRef<any>;
	@ViewChild('schedule', { static: true }) schedule!: TemplateRef<any>;

	constructor(private _helper: Helper, private modalService: NgbModal, private config: NgbCarouselConfig, private _homeService: HomeService, public _cartService: CartService, private renderer2: Renderer2) {
		config.showNavigationArrows = true;
		config.interval = 100000000;
		config.showNavigationIndicators = false;
	}

	ngOnInit() {
		this.timezone = moment.tz.zone(moment.tz.guess())?.name;
		// this.scheduleModalRef = this.modalService.open(this.schedule, this.scheduleConfig);
		this.get_store_data();
		let days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'];
		let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		let day = days[this.today_date.getDay()];
		let month = months[this.today_date.getMonth()];
		let date_format = day + ' ' + this.today_date.getDate() + ' ' + month;
		this.ASAP = date_format;
		this._cartService.user_cart.is_user_pick_up_order = true;
		this.loadGoogleScript(`https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_KEY}&libraries=places,drawing`).then(() => {
			this.onTypeChange();
			this._initAutoComplete();
		});
	}

	toStorePage() {
		this._helper._route.navigateByUrl('/web-ordering/restaurant-page')
	}

	loadGoogleScript(url: any) {
		return new Promise((resolve, reject) => {
			const script = this.renderer2.createElement('script');
			script.type = 'text/javascript';
			script.src = url;
			script.text = ``;
			script.async = true;
			script.defer = true;
			script.onload = resolve;
			script.onerror = reject;
			this.renderer2.appendChild(document.body, script);
		})
	}

	get_store_data() {
		let json = { store_id: '62b99a84019b9f20b7aa99a8', is_show_success_toast: false }
		this._homeService.get_store_product_item_list(json).then((res: any) => {
			this.store_details = res.store;
			this.dietary_tags = res.dietary_tags || [];
			this.lang_change_month_day();
			this.set_date(this.date_array[this.dateIndex]);
		})
	}

	onSchedule() {
		this.scheduleModalRef = this.modalService.open(this.schedule, this.scheduleConfig);
	}

	onTypeChange() {
		this.modalRef = this.modalService.open(this.changeAddress, this.modalConfig);
	}

	onSlide(e: any) {
		this.dateIndex = parseInt(e.current.replace("slideId_", ""), 10);
		this.set_date(this.date_array[this.dateIndex]);
		this.time_length = 21;
	}

	confirmSelection() {
		this.modalRef.close();
	}

	lang_change_month_day() {
		//console.log("ffff")
		let days = ['Sun', 'Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat'];
		let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		let time_date = new Date();
		time_date.setHours(0, 0, 0, 0);
		//console.log(this.timezone)
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
		//console.log(minute)
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

	_initAutoComplete() {
		var autocompleteElm = document.getElementById('address');
		let autocomplete = new google.maps.places.Autocomplete((autocompleteElm), {
			types: [],
			// componentRestrictions: { country: country_code }
		});
		autocomplete.addListener('place_changed', () => {
			console.log('called');
			var place = autocomplete.getPlace();
			var curLocation: LocationModel = new LocationModel();
			if (
				place?.geometry &&
				place?.geometry.location.lat() &&
				place?.geometry.location.lng()
			) {
				console.log('true');
				// this.helper._loader.isLoading = true;
				curLocation.latitude = place.geometry.location.lat();
				curLocation.longitude = place.geometry.location.lng();
				curLocation.address = place['formatted_address'];
				place['address_components'].forEach((element: any) => {
					var type = element.types[0]
					switch (type) {
						case 'country':
							curLocation.country_name = element.long_name;
							curLocation.country_code = element.short_name;
							break;
						case 'administrative_area_level_1':
							curLocation.state_code = element.short_name;
							curLocation.state_name = element.long_name;
							break;
						case 'administrative_area_level_2':
							curLocation.city_name = element.short_name;
							break;
						case 'postal_code':
							break;
						default:
							break;
					}
				});
			}
		});
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
			console.log('const');

			this.store_details.store_delivery_time.sort((a: any, b: any) => a.day - b.day);

			if (this.store_details.is_store_set_schedule_delivery_time == true && this.store_details.store_delivery_time[date.day].is_store_open == true && this.store_details.store_delivery_time[date.day].is_store_open_full_time == false) {
				date1.setHours(0, 0, 0, 0);
				this.store_details.store_delivery_time[n].day_time.forEach((store_time: any, index: any) => {
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
				time_date_close = new Date(time_date_close.setMinutes(time_date_close.getMinutes() + 15));
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
					time_date.setMinutes(time_date.getMinutes() + 15);
					time_date_close.setMinutes(time_date_close.getMinutes() + 15);
				}
			} else if (this.store_details.store_time[n].is_store_open && !this.store_details.store_time[n].is_store_open_full_time) {
				this.store_details.store_time[n].day_time.forEach((store_time: any, index: any) => {


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

						time_date.setMinutes(time_date.getMinutes() + 15);
						time_date_close.setMinutes(time_date_close.getMinutes() + 15);
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
	}

	set_time(time: any) {
		console.log(time);
		this._cartService.user_cart.selected_time = time;
		if (time != 'asap') {
			this.schedule_time = time.time_format;
			this.schedule_date = time.date.date;
			this.clicked_date = time.date.date_format;
			this.set_order_time(true);
			this.set_schedule(true);
		}
		this.scheduleModalRef.close()
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
				console.log(selected_date);

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

				//console.log(this.filter_stores);

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

	onMore(index: any) {
		this.time_length = this.time_array.length;
	}

	onLess(i: any) {
		this.time_length = 21;
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

}
