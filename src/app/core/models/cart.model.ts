export class cartProductsModel {
    items: Array<ItemModel> = [];
    product_id: string = '';
    product_name: string = '';
    unique_id: number = 0;
    total_item_tax: number = 0;
    total_item_price: number = 0;
}

export class ItemModel {
    item_id = null;
    unique_id = 0;
    item_name = '';
    item_tax = 0;
    quantity = 0;
    image_url = [];
    details = '';
    specifications: Array<cartSpecificationGroupsModel> = [];
    item_price = 0;
    total_price = 0;
    tax = 0;
    total_specification_price = 0;
    total_specification_tax = 0;
    total_item_price = 0;
    max_item_quantity = 0;
    total_tax = 0;
    total_item_tax = 0;
    note_for_item = '';
    tax_details = [];
    dietary_tags =[] ;
}


export class cartSpecificationGroupsModel {
    list: any = [];
    name: string = '';
    price: number = 0;
    type: number = 0;
    unique_id: number = 0;
    range: number = 0;
    max_range: number = 0;
    quantity: Number = 0;
    modifier_id: string = '';
    modifier_group_id: string = '';
    is_parent_associate: boolean = false;
    is_associated: boolean = false;
}

export class CartData {
    cart: Array<cartProductsModel> = [];
    cart_id: string = '';
    city_id: string = '';
    is_admin_services: boolean = false;
    destination_addresses: Array<cartAddress> = [new cartAddress('destination')];
    pickup_addresses: Array<cartAddress> = [new cartAddress('pickup')];
    max_item_quantity_add_by_user: number = 0
    selectedStoreId: string = '';
    total_item: number = 0;


    constructor() {
        this.cart = [];
        this.cart_id = '';
        this.city_id = '';
        this.destination_addresses = [new cartAddress('destination')];
        this.pickup_addresses = [new cartAddress('pickup')];
        this.max_item_quantity_add_by_user = 0
        this.selectedStoreId = '';
        this.total_item = 0;
    }

}

export class Cart {
    cart_data: CartData = new CartData();
    total_item_tax: number = 0;
    total_cart_amount: number = 0;
    cart_main_item: any[] = [];                 // For Edit Order Get Main Item with Specifications
    is_user_pick_up_order: boolean = false;
    is_with_table_order: boolean = false;
    selected_time: any = 'asap';
    is_schedule_order: boolean = false;
    schedule_date: any = new Date();
    schedule_date1: any = new Date();
    clicked_date: string = '';
    server_time: any = new Date();
    total_taxes: Array<any> = [];
    is_use_item_tax: boolean = false;
    is_tax_inclusive: boolean = false;
    table_no: number = 0;
    table_id: string = '';
    no_of_persons: number = 0
    booking_type: number = 0
    is_table_booking!:boolean;

    constructor() {
        this.cart_data = new CartData();
        this.total_item_tax = 0;
        this.total_cart_amount = 0;
        this.cart_main_item = [];                 // For Edit Order Get Main Item with Specifications
        this.is_user_pick_up_order = false;
        this.is_with_table_order = false;
        this.is_schedule_order = false;
        this.schedule_date = new Date();
        this.schedule_date1 = new Date();
        this.clicked_date = '';
        this.server_time = new Date();
        this.total_taxes = [];
        this.is_use_item_tax = false;
        this.is_tax_inclusive = false;
        this.table_no = 0;
        this.no_of_persons = 0;
        this.table_id = '';
    }

}

export class cartAddress {
    delivery_status: number = 0;
    address_type: string = '';
    address: string = "";
    flat_no: string = "";
    street: string = "";
    landmark: string = "";
    city: string = "";
    location: Array<number> = [0, 0];
    note: string = "";
    user_type: number = 0;
    user_details: any = {
        name: "",
        country_phone_code: "",
        phone: "",
        email: ""
    }

    constructor(address_type : any) {
        this.address_type = address_type;
    }

}