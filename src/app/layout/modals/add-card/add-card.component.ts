import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import {
  NgbModal,
  NgbModalConfig,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { STRIPE_IMAGE } from 'src/app/core/constant/constant';
import { PaymentService } from 'src/app/data/services/payment.service';
import { UserService } from 'src/app/data/services/user.service';
import { Helper } from 'src/app/shared/helper';

declare var stripe: any;
declare var elements: any;

@Component({
  selector: 'app-add-card',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
})
export class AddCardComponent {
  modalRef!: NgbModalRef;
  STRIPE_IMAGE = STRIPE_IMAGE ;
  modalConfig: any = {
    centered: true,
    ariaLabelledBy: 'modal-basic-title',
    size: 'md',
  };
  userSettings: any;
  card: any;
  cardHandler = this.onChange.bind(this);
  card_error: any;
  cardNumber: any;
  cardExpiry: any;
  cardCvc: any;
  card_image: any;
  card_key: any;

  @ViewChild('template', { static: true }) template!: TemplateRef<any>;
  @ViewChild('cardInfo') cardInfo!: ElementRef;

  constructor(
    private modalService: NgbModal,
    private _userService: UserService,
    public _helper: Helper,
    private _fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private paymentService: PaymentService
  ) {}

  loadStripe(): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML =
        "var stripe = Stripe('pk_test_51ODQgkDpCW0xRme58VyRBJ3Nyy1uBBQzPkV66PGe8KBgS7vYDWdHidRKfEtPq6tcceaPAwSEZCzjERO12QM0Ksxh00IVqcGurY'); var elements = stripe.elements();";

      document.getElementsByTagName('head')[0].appendChild(script);
      resolve(true);
    });
  }

  ngOnInit(): void {
    this.modalConfig.backdrop = 'static';
    this.modalConfig.keyboard = false;
  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.loadStripe().then(() => {
  //       if (elements || elements._elements.length) {
  //         elements._elements = [];
  //       }
  //       var style = {
  //         base: {
  //           border: '1px solid #E8E8E8',
  //         },
  //       };

  //       var cardNumber = elements.create('cardNumber', {
  //         style: style,
  //         classes: {
  //           base: 'form-control w-full'
  //         }
  //       });

  //       var cardExpiry = elements.create('cardExpiry', {
  //         style: style,
  //         classes: {
  //           base: 'form-control'
  //         }
  //       });

  //       var cardCvc = elements.create('cardCvc', {
  //         style: style,
  //         classes: {
  //           base: 'form-control'
  //         }
  //       });

  //       cardNumber.mount('#cc-number');
  //       cardExpiry.mount('#cc-expiry');
  //       cardCvc.mount('#cc-cvc');
  //     });
  //   }, 2000);
  // }

  onChange({ error }: any) {
    if (error) {
      this.card_error = error.message;
    } else {
      this.card_error = null;
    }
    this.cd.detectChanges();
  }

  // Example usage
  // var cardNumber = "4242424242424242"; // Replace with the actual card number
  // var cardType = getCardType(cardNumber);

  open() {
    this.modalRef = this.modalService.open(this.template, this.modalConfig);
    this.card_image = this.getCardImage('');
    this.getCardKey();
    try {
      if (this.card) {
        this.card.clear();
        this.card.removeEventListener('change', this.cardHandler);
      }
    } catch (err) {}
    setTimeout(() => {
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
            classes: {
              base: 'form-control w-full',
            },
          });

          this.cardExpiry = elements.create('cardExpiry', {
            style: style,
            classes: {
              base: 'form-control',
            },
          });

          this.cardCvc = elements.create('cardCvc', {
            style: style,
            classes: {
              base: 'form-control',
            },
          });

          this.cardNumber.on('change', (event: any) => {
            this.card_image = this.getCardImage(event.brand);
          });

          this.cardNumber.mount('#cc-number');
          this.cardExpiry.mount('#cc-expiry');
          this.cardCvc.mount('#cc-cvc');
        });
      }, 200);

      // this.card.addEventListener('change', this.cardHandler);
    }, 100);
  }

  getCardKey() {
    this.paymentService.get_card_key().then((res: any) => {
      this.card_key = res.clientSecret;
    });
  }

  getCardImage(cardType: any) {
    switch (cardType) {
      case 'visa':
        return this.STRIPE_IMAGE.visa;
      case 'mastercard':
        return this.STRIPE_IMAGE.mastercard;
      case 'amex':
        return this.STRIPE_IMAGE.amex;
      case 'discover':
        return this.STRIPE_IMAGE.discover;
      case 'diners':
        return this.STRIPE_IMAGE.diners;
      case 'jcb':
        return this.STRIPE_IMAGE.jcb;
      case 'unionpay':
        return this.STRIPE_IMAGE.unionpay;
      default:
        return this.STRIPE_IMAGE.default;
    }
  }

  save() {
    stripe.createToken(this.cardNumber).then((result: any) => {
      if (result.error) {
        var errorElement = document.getElementById('card-errors');
      } else {
        stripe
          .handleCardSetup(this.card_key, this.cardNumber, {
            payment_method_data: {
              billing_details: {},
            },
          })
          .then((res_data: any) => {
            let json: any = {
              cardToken: result.token.card.id,
              paymentMethod: res_data.setupIntent.payment_method,
            };
            this.paymentService.add_card(json).then((res) => {
              this.modalRef.close()
            });
          });
      }
    });
  }
}
