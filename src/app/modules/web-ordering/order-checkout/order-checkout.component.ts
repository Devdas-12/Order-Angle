import { Component, HostListener, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CartService } from 'src/app/data/services/cart.service';
import { CountryService } from 'src/app/data/services/country.service';
import { HomeService } from 'src/app/data/services/home.service';
import { PaymentService } from 'src/app/data/services/payment.service';
import { ToastService } from 'src/app/data/services/toastr.service';
import { Helper } from 'src/app/shared/helper';
import { environment } from 'src/environments/environment';

declare var stripe: any;
declare var elements: any;

@Component({
  selector: 'app-order-checkout',
  templateUrl: './order-checkout.component.html',
  styleUrls: ['./order-checkout.component.scss']
})
export class OrderCheckoutComponent {
  details: any;
  store_details: any;
  countryList: any;
  selectedCountry: any;
  imageUrl = environment.IMAGE_URL
  store: any;
  paymentGatewayData: any;
  is_provide_delivery: any;
  is_provide_pickup_delivery: any;
  is_taking_schedule_order: any;
  promo_codes: any;
  timezone: any;
  paymentMethod: any;
  payment_id: any;
  payment_name: any;
  order_payment: any;
  invoice_failed: any = true;
  checkOutForm!: FormGroup;
  paymentIndex: any = 1;
  isGoogleApplePay: any;
  card: any;
  cartItems: any;
  ismobile = false;
  deviceWidth: any;

  constructor(private _homeService: HomeService, public helper: Helper, private countryService: CountryService, public _cartService: CartService, private _paymentService: PaymentService, private _fb: FormBuilder, private toastrService: ToastService, private renderer: Renderer2) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.getDeviceWidth();
  }
  ngOnInit() {
    this.getDeviceWidth();
    this._initForm();
    // this.getStore();
    this.getCountryList();
    this._initPromocodes();
  }

  private getDeviceWidth() {
    this.deviceWidth = window.innerWidth || document.documentElement.clientWidth;
    if (this.deviceWidth < 768) {
      this.ismobile = true;
    } else {
      this.ismobile = false;
    }
  }


  _initPromocodes() {
    var store_id = localStorage.getItem('cartStoreId');
    if (store_id) {
      this._cartService.user_cart.cart_data.selectedStoreId = store_id;
      this._homeService.get_store({ store_id: this._cartService.user_cart.cart_data.selectedStoreId, is_show_success_toast: false }).then((response: any) => {
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
          this._cartService.user_cart.is_user_pick_up_order = true
          if (!this.is_provide_delivery && this.is_provide_pickup_delivery) {
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
      first_name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required]),
      is_eligable: new FormControl('', [Validators.required]),
      is_marketing: new FormControl('')
    })
  }

  // getStore() {
  //   let json = {
  //     store_id: '62b99a84019b9f20b7aa99a8',
  //     is_show_success_toast: false
  //   }

  //   this._homeService.get_store(json).then((res) => {
  //     this.details = res;
  //     this.store_details = res.store_detail;
  //     // this.filter_items = res.products;
  //     // this.famous_products_tags = res.store.famous_products_tags;
  //   })
  // }

  async getCart() {

    // this._cartService.get_cart('').then((res) => {
    // 	this.cart_data = res.data.cart;
    // 	this.order_details = this.cart_data.order_details;
    // 	console.log(res);
    // })
    await this._cartService.update_local_cart('')
    await this.user_get_cart_invoice();
    this.cartItems = await this._cartService.user_cart.cart_data;
    console.log(this.cartItems);

  }

  async fetchPaymentGateway() {
    this.paymentGatewayData = await this._paymentService.get_payment_gateway([], '', '', this.helper.cart_unique_token);
    this.paymentMethod = this.paymentGatewayData.payment_gateway
    // console.log(this.paymentMethod)
    const idx = this.paymentGatewayData.payment_gateway.findIndex((_p: any) => _p.name.toLowerCase())
    // console.log(this.paymentGatewayData.payment_gateway[0].name)
    if (idx !== -1) {
      this.payment_id = this.paymentGatewayData.payment_gateway[idx]._id;
      this.payment_name = this.paymentGatewayData.payment_gateway[idx].name;
    }

    setTimeout(() => {
      this.loadStripe().then(() => {
        if (elements || elements._elements.length) {
          elements._elements = [];
        }
        setTimeout(() => {
          this.googlePay();
        }, 200);
      })
    })

    // this._initCards();

    // this.fetchCardList();
  }


  getCountryList() {
    this.countryService.get_country().then((res) => {
      this.countryList = res.countries;
      this.onSelect(this.countryList[0])
    })
  }

  onSelect(country: any) {
    this.selectedCountry = country;
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

  loadStripe(): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = "var stripe = Stripe('" + environment.STRIPE_KEY + "'); var elements = stripe.elements();";
      // console.log(script.innerHTML)
      document.getElementsByTagName('head')[0].appendChild(script);
      resolve(true);
    })
  }

  googlePay() {
    const paymentRequest = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      // country: this.store.country_details.country_code,
      // currency: this.store.country_details.currency_code.toLowerCase(),
      total: {
        label: 'Total',
        amount: 1000, // Amount in cents
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
      console.log(result);

      if (result?.googlePay || result?.applePay) {
        paymentRequestButton.mount('#google-pay-button');
        this.isGoogleApplePay = true;
        this.paymentIndex = 1;
      } else {
        this.paymentIndex = 2;
        this.isGoogleApplePay = false;
        setTimeout(() => {
          this.cardPayment();
        }, 300);
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

  changePayment(value: any) {
    this.paymentIndex = value;
    if (value == 1) {
      this.googlePay();
    } else {
      this.cardPayment();
    }
  }

  cardPayment() {
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

        var card = elements.create('card');
        card.mount('#card-element');


        // this.cardNumber.on('change', (event: any) => {
        // 	// this.card_image = this.getCardImage(event.brand);
        // });

        // this.cardHolder.mount('#cc-holder');
      });
    }, 200);
  }
}
