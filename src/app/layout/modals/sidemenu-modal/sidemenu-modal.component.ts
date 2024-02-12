import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/data/services/api.service';
import { CartService } from 'src/app/data/services/cart.service';
import { CountryService } from 'src/app/data/services/country.service';
import { ToastService } from 'src/app/data/services/toastr.service';
import { UserService } from 'src/app/data/services/user.service';
import { Helper } from 'src/app/shared/helper';
import { environment } from 'src/environments/environment';
declare var grecaptcha: any;
declare var jQuery: any;

@Component({
    selector: 'app-sidemenu-modal',
    templateUrl: './sidemenu-modal.component.html',
    styleUrls: ['./sidemenu-modal.component.scss']
})
export class SidemenuModalComponent {
    modalRef!: NgbModalRef;
    otpverifyRef!: NgbModalRef;
    modalConfig: any = {
        Animation: false,
        windowClass: 'modal-right',
        backdrop: 'static',
        fullscreen: true,
    };
    otpverifyConfig: any = {
        centered: true, backdrop: 'static', windowClass: 'modal-regular'
    };
    isVerify: any = false;
    countryList: any;
    selectedCountry: any;
    imageUrl = environment.IMAGE_URL;
    phoneNumber: any = '';
    userDetails: any;

    @ViewChild('template', { static: true }) template!: TemplateRef<any>;
    @ViewChild('otpverify', { static: true }) otpverify!: TemplateRef<any>;
    phoneEmpty: boolean = false;
    phoneMinLength: boolean = false;
    isCaptchaVerified: boolean = false
    captchaToken: any = '';
    store_details: any;

    temp_otp: any;
    @HostListener('window:popstate', ['$event'])
    dismissModal() {
        if (this.modalRef) {
            this.modalRef.dismiss();
        }
        if (this.otpverifyRef) {
            this.otpverifyRef.dismiss();
        }
    }

    constructor(private modalService: NgbModal, private countryService: CountryService, private userService: UserService, public helper: Helper, public toastr: ToastService, private cartService: CartService) { }

    open() {
        this.modalRef = this.modalService.open(this.template, this.modalConfig);
        this.getCountryList();
        this.helper.store_data.subscribe((res) => {
            this.store_details = res;
        })
        if (localStorage.getItem('userDetails')) {
            this.userDetails = JSON.parse(localStorage.getItem('userDetails') || '');
            this.isVerify = this.userDetails.isVerify;
        }

        // setTimeout(() => {
        //     if (!this.isVerify) {
        //         grecaptcha.render('html_element', {
        //             'sitekey': '6Lf1a1IpAAAAABVWRlJEip0IYCIdlRB6vVr9gUtE',
        //             'callback': function () {
        //                 jQuery("#submit_btn").prop('disabled', false);
        //             },
        //             'expired-callback': function () {
        //                 jQuery("#submit_btn").prop('disabled', true);
        //             }
        //         });
        //     }
        // }, 500);
    }

    // resolved(captchaResponse: string) {
    //     this.isCaptchaVerified = false
    //     this.captchaToken = captchaResponse
    // }

    getCountryList() {
        this.countryService.get_country().then((res) => {
            this.countryList = res.countries;
            this.onSelect(this.countryList[0])
        })
    }

    onSelect(country: any) {
        this.selectedCountry = country;
    }

    validationCheck() {
        if (this.phoneEmpty && this.phoneNumber != '') {
            this.phoneEmpty = false;
        } else if (this.phoneMinLength && this.phoneNumber?.length >= 6) {
            this.phoneMinLength = false;
        }
    }

    onVerify() {

        this.isCaptchaVerified = false
        if (this.phoneNumber == '') {
            this.phoneEmpty = true;
            this.phoneMinLength = false;
            return;
        } else if (this.phoneNumber?.length < 6) {
            this.phoneMinLength = true;
            this.phoneEmpty = false;
            return;
        } else {
            this.phoneMinLength = false;
            this.phoneEmpty = false;
        }

        let json = {
            phone: this.phoneNumber,
            country_phone_code: this.selectedCountry.country_phone_code,
            is_show_success_toast: false
        }



        if (true) {
            // if (grecaptcha.getResponse() == "") {
            //     grecaptcha.reset();
            // } else {
            this.userService.check_user(json).then((res) => {
                // this.modalRef.close();
                this.temp_otp = res;

                this.otpverifyRef = this.modalService.open(this.otpverify, this.otpverifyConfig);

                const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(".otp-field input");

                inputs.forEach((input, index) => {
                    input.dataset.index = index.toString();

                    input.addEventListener("keyup", handleOtp);
                    input.addEventListener("paste", handleOnPasteOtp);
                });
            })
            // }


        }
    }

    submit() {
        const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(".otp-field input");
        // 👇 Entered OTP
        let otp = "";
        inputs.forEach((input) => {
            let value = input.value;
            let isValidInput = value.match(/[0-9a-z]/gi);
            let fieldIndex = parseInt(input.dataset.index!);

            if (input.value == '') {
                input.classList.add('invalid');
            }
            if (isValidInput) {
                otp += input.value;
                // input.disabled = true;
                input.classList.remove('invalid');
                // input.classList.add("disabled");
            }
        });
        if (otp.length == 6) {
            let json = {
                phone: this.phoneNumber,
                country_phone_code: this.selectedCountry.country_phone_code,
                otp: otp,
                is_show_success_toast: false
            }

            this.userService.otp_verification(json).then((res) => {

                if (res.success) {
                    this.phoneNumber = ''
                    this.isVerify = true;
                    this.otpverifyRef.close();
                    setTimeout(() => {
                        this.toastr.showToast('success-toast', this.helper._translate.instant('success-code.196'))
                    }, 1000);
                    // location.reload();
                    this.cartService.update_local_cart('');
                    if (this.helper._route.url == '/cart') {
                        this.modalRef.close();
                    }
                } else {
                    setTimeout(() => {
                        otp = '';
                        this.toastr.showToast('success-toast', res.message)
                    }, 1000);
                }
                // this.isVerify = true;
            })
            //     return;
        }
        // 👉 Call API below
    }
}


function handleOtp(e: KeyboardEvent) {
    /**
     * <input type="text" 👉 maxlength="1" />
     * 👉 NOTE: On mobile devices `maxlength` property isn't supported,
     * So we have to write our own logic to make it work. 🙂
     */
    const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(".otp-field input");

    const input = e.target as HTMLInputElement;
    let value = input.value;
    let isValidInput = value.match(/[0-9a-z]/gi);
    input.value = "";
    input.value = isValidInput ? value[0] : "";

    if (input.value != '') {
        input.classList.remove('invalid')
    }

    let fieldIndex = parseInt(input.dataset.index!);
    if (fieldIndex < inputs.length - 1 && isValidInput) {
        (input.nextElementSibling as HTMLInputElement).focus();
    }

    if (e.key === "Backspace" && fieldIndex > 0) {
        (input.previousElementSibling as HTMLInputElement).focus();
    }

    if (fieldIndex === inputs.length - 1 && isValidInput) {
        // submit();
    }
}

function handleOnPasteOtp(e: ClipboardEvent) {
    const inputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(".otp-field input");

    const data = e.clipboardData?.getData("text");
    const value = data ? data.split("") : [];
    if (value.length === inputs.length) {
        inputs.forEach((input, index) => (input.value = value[index]));
        // submit();
    }
}