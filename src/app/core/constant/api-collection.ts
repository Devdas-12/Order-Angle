export var apiColletions = {

    // "user logins"

    "user_settings": "/auth/setting",
    "user_register": "/auth/register",
    "user_login": "/auth/login",
    "get_user_profile": "/users/profile",
    "user_verification": "/api/user/check_user_registerd",
    "otp_verification": "/api/user/opt_verification_for_guest",
    "check_user": "/api/user/check_user_registerd_2",
    "update_user": "/api/user/update",

    // "subscriptions details"

    "get_subscription_list": "/users/subscription/list",
    "get_active_subscription": "/users/subscription/active",
    "get_subscription_history": "/users/subscription/history",


    // "Forgot password"

    "forgot_password_by_email": "/auth/forgot-password-email",
    "reset_password_by_email": "/auth/reset-password-email",

    //  "Emergency Contacts"

    "get_emergency_contacts": "/users/emergency-users",
    "add_new_contact": "/users/emergency-user",
    "add_multiple_contacts": "/users/emergency-users",
    "edit_contact": "/users/emergency-user",

    // "Payments apis"

    "get_card_key": "/users/card-key",
    // "add_card": "/users/card",
    // "get_card_list": "/users/card",
    // "select_card": "/users/select-card",
    "delete_card": "/users/card",
    "get_payment_key": "/users/payment-key",

    // language

    "get_language_list": "/admin/language",
    "get_all_countries": "/admin/get_country_list",
    "get_countries": "/api/admin/get_country_list",



    // store details

    "get_store_data": "/admin/get_store_data",
    "get_product_group_list": "/api/user/get_product_group_list",
    "user_get_store_product_item_list": "/api/user/user_get_store_product_item_list",
    "add_item_in_cart": "/api/user/add_item_in_cart",
    "get_cart": "/api/user/get_cart",
    "create_order": "/api/user/create_order",
    "get_order_cart_invoice": "/api/user/get_order_cart_invoice_for_table_booking",
    // "get_order_cart_invoice": "/api/user/get_order_cart_invoice",
    "clear_cart": "/api/user/clear_cart",
    "get_table_list": "/api/store/table_list",
    "download_tax_invoice": "/api/user/downloadinvoice",
    "get_invoice": "/api/user/get_invoice",

    // Payments

    "get_payment_gateway": "/api/user/get_payment_gateway",
    "get_card_list": "/api/user/get_card_list",
    "get_stripe_add_card_intent": "/api/user/get_stripe_add_card_intent",
    "add_card": "/api/user/add_card",
    "select_card": "/api/user/select_card",
    "get_stripe_payment_intent": "/api/user/get_stripe_payment_intent",
    "pay_order_payment": "/api/user/pay_order_payment",
}