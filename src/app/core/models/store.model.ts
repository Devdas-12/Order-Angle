import { environment } from "src/environments/environment";
// import { DEFAULT_IMAGE } from "../constants/constants";

export class StoreModel {
    _id: any = null;
    private image_url: any = null;
    private logo_url: any = null;
    name: any = null;
    famous_products_tags!: Array<string>[];
    languages_supported!: Array<Object>[];
    price_rating: any = null;
    delivery_time: any = null;
    table_details: any = null;
    delivery_time_max: any = null;
    min_order_price: any = null;
    is_store_pay_delivery_fees!: boolean ;
    user_rate: any = null;
    user_rate_count: any = null;
    distance: any = null;
    is_use_item_tax: boolean = false;
    item_tax: number = 0;
    country_phone_code: string = '';
    phone: string = '';
    email: string = '';
    max_item_quantity_add_by_user: number = 0;
    location: Array<number> = [0, 0];
    address: string = '';
    user_type: number = 2;
    store_delivery_time: any = [];
    store_time: any = [];
    schedule_order_create_after_minute: number = 0;
    order_cancellation_charge_for_above_order_price: number = 0;
    is_store_set_schedule_delivery_time: boolean = false;
    is_provide_pickup_delivery: boolean = false;
    is_provide_delivery: boolean = true;
    close: boolean = false;
    nextopentime: string = '';
    is_store_busy: boolean = false;
    order_cancellation_charge_value: number = 0;
    is_tax_inclusive: boolean = false
    is_tax_included: boolean = false
    server_token: string = ''
    tax_details: Array<any> = []
    store_tax_details: Array<any> = [];
    is_table_reservation: boolean = false;
    table_booking_time: Array<any> = [];

    static _width: number = 370;

    constructor(store: StoreModel) {
        if (store) {
            this._id = store._id;
            this.image_url = store.image_url;
            this.logo_url = store.logo_url;
            this.name = store.name;
            this.table_details = store.table_details;
            this.famous_products_tags = store.famous_products_tags;
            this.languages_supported = store.languages_supported;
            this.price_rating = store.price_rating;
            this.delivery_time = store.delivery_time;
            this.delivery_time_max = store.delivery_time_max;
            this.is_store_pay_delivery_fees = store.is_store_pay_delivery_fees;
            this.user_rate = store.user_rate;
            this.user_rate_count = store.user_rate_count;
            this.distance = store.distance;
            this.is_use_item_tax = store.is_use_item_tax;
            this.item_tax = store.item_tax;
            this.country_phone_code = store.country_phone_code;
            this.phone = store.phone;
            this.email = store.email;
            this.max_item_quantity_add_by_user = store.max_item_quantity_add_by_user;
            this.location = store.location;
            this.address = store.address;
            this.user_type = store.user_type;
            this.store_delivery_time = store.store_delivery_time;
            this.store_time = store.store_time;
            this.schedule_order_create_after_minute = store.schedule_order_create_after_minute;
            this.is_store_set_schedule_delivery_time = store.is_store_set_schedule_delivery_time;
            this.is_provide_pickup_delivery = store.is_provide_pickup_delivery;
            this.is_provide_delivery = store.is_provide_delivery;
            this.close = store.close;
            this.nextopentime = store.nextopentime;
            this.is_store_busy = store.is_store_busy
            this.order_cancellation_charge_value = store.order_cancellation_charge_value
            this.is_tax_inclusive = store.is_tax_inclusive
            this.is_table_reservation = store.is_table_reservation
            this.table_booking_time = store.table_booking_time
            this.min_order_price = store.min_order_price
        }
    }

    // get imageUrl() {
    //     if (environment.IS_USE_AWS) {
    //         return `${environment.API_URL}/resize_image?image=${environment.IMAGE_URL}${this.image_url}&width=${StoreModel._width}&format=webp`;
    //     } else {
    //         return environment.IMAGE_URL + this.image_url
    //         // return `${environment.API_URL}/resize_image?image=/${this.image_url}&width=${StoreModel._width}&format=webp`;
    //     }
    // }

    // static get defaultImage() {
    //     var image_path = window.location.origin + '/' + DEFAULT_IMAGE.STORE_PROFILE;
    //     return `${environment.API_URL}/resize_image?image=${image_path}&width=${StoreModel._width}&format=webp`;
    // }

    static convertArrayToObject(array: Array<any> = [], ad_width = 200) {
        this._width = ad_width;
        var convertedArray: Array<StoreModel> = [];
        array.forEach(element => {
            convertedArray.push(new StoreModel(element))
        });
        return convertedArray;
    }

}
