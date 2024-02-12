import { CountryService } from './../../data/services/country.service';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  ModalDismissReasons,
  NgbModal,
  NgbModalRef,
} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/data/services/user.service';
import { Helper } from 'src/app/shared/helper';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  public visible = false;
  loginModalRef!: NgbModalRef;
  registerModalRef!: NgbModalRef;
  phoneCodeModalRef!: NgbModalRef;
  forgotModalRef!: NgbModalRef;
  resetModalRef!: NgbModalRef;
  filterValue = '';
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  forgotForm! : FormGroup ;
  resetPasswordForm! : FormGroup ;
  passwordsDoNotMatch! : boolean ;
  modalConfig: any = { centered: true, ariaLabelledBy: 'modal-basic-title' , windowClass : 'modal-md' };
  modalConfigBeta: any = {
    centered: true,
    ariaLabelledBy: 'modal-basic-title',
    size: 'sm',
  };
  closeResult = '';
  userSettings: any;
  countryList: any;
  selectedCountryCode: any;
  @ViewChild('login', { static: true }) login!: TemplateRef<any>;
  @ViewChild('register', { static: true }) register!: TemplateRef<any>;
  @ViewChild('forgot_password', { static: true }) forgot_password!: TemplateRef<any>;
  @ViewChild('reset_password', { static: true }) reset_password!: TemplateRef<any>;
  @ViewChild('phoneCode', { static: true }) phoneCode!: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private _fb: FormBuilder,
    public helper: Helper,
    private _countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.userService._settingsObservable.subscribe((res: any) => {
      this.userSettings = res?.data;
    });
  }

  open() {
    this.__initForm();
    this.loginModalRef = this.modalService.open(this.login, this.modalConfig);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  registerModal() {
    this.__initRegisterForm();
    this.getCountry();
    if (this.loginModalRef) {
      this.loginModalRef.close();
      this.registerModalRef = this.modalService.open(
        this.register,
        this.modalConfig
      );
    } else {
      this.registerModalRef = this.modalService.open(
        this.register,
        this.modalConfig
      );
    }
  }

  loginModal() {
    this.registerModalRef.close();
    this.open();
  }

  forgotModal(){
    this.loginModalRef.close();
    this.__initForgotForm();
    this.forgotModalRef = this.modalService.open(this.forgot_password , this.modalConfig)
  }

  __initForm() {
    this.loginForm = this._fb.group({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      deviceToken : new FormControl('devda45d'),
      deviceType : new FormControl(2)
    });
  }

  __initRegisterForm() {
    this.registerForm = this._fb.group({
      username: new FormControl('', [Validators.required]),
      phone: new FormControl('', [
        Validators.required,
        Validators.minLength(Number(this.userSettings?.minPhoneLength)),
        Validators.maxLength(Number(this.userSettings?.maxPhoneLength))
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      phoneCode: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      terms_and_condition: new FormControl('', [Validators.required]),
    });
  }

  __initForgotForm() {
    this.forgotForm = this._fb.group({
      email : new FormControl('' , [Validators.required , Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
    })
  }

  __initRestPasswordForm() {
    this.resetPasswordForm = this._fb.group({
      email: new FormControl(''),
      emailOtp : new FormControl('' , [Validators.required , Validators.minLength(6) , Validators.maxLength(6)]),
      password : new FormControl('' , [Validators.required , Validators.minLength(6)]),   
      confirmPassword : new FormControl('' , [Validators.required , Validators.minLength(6)])   
    })
  }

  getCountry() {
    this._countryService.getCountryData().subscribe((res) => {
      this.countryList = res;
    });
  }

  onCodeClick() {
    this.phoneCodeModalRef = this.modalService.open(
      this.phoneCode,
      this.modalConfigBeta
    );
  }

  getCountryCode(countryCode: any) {
    return countryCode.replace('+', '');
    // Return null if the "root" property is missing
  }

  selectedCode(code: any) {
    this.registerForm.patchValue({
      phoneCode: code,
    });
    this.selectedCountryCode = this.getCountryCode(code);
    this.phoneCodeModalRef.close();
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.userService.user_login(this.loginForm.value).then((res) => {
      if (res) {
        this.loginModalRef.close();
        this.userService.get_user_profile().then((res) => {
          location.reload();
        })
      }
    });
  }

  onRegister() {
    if (
      this.registerForm.invalid ||
      this.registerForm.get('terms_and_condition')?.value == false
    ) {
      this.registerForm.markAllAsTouched();
      return;
    }

    let json = {
      username: this.registerForm.value.username,
      phone: this.registerForm.value.phone,
      email: this.registerForm.value.email,
      phoneCode: this.selectedCountryCode,
      password: this.registerForm.value.password,
    };

    this.userService.user_register(json).then((res) => {
      if (res) {
        this.registerModalRef.close();
      }
    });
  }

  onForgot(){
    if(this.forgotForm.invalid){
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.userService.forgot_password_with_email(this.forgotForm.value).then((res) => {
      if(res){
        this.forgotModalRef.close();
        this.__initRestPasswordForm();
        this.resetPasswordForm.patchValue({
          email : this.forgotForm.value.email
        })
        this.resetModalRef = this.modalService.open(this.reset_password , this.modalConfig)
      }
    })

  }

  onReset(){
    if(this.resetPasswordForm.invalid){
      this.resetPasswordForm.markAllAsTouched();
      return ;
    }
    if (this.resetPasswordForm.value.password === this.resetPasswordForm.value.confirmPassword) {
      // Passwords match, proceed with password reset logic
      this.passwordsDoNotMatch = false;
      // Add your password reset code here
    } else {
      // Passwords do not match, display an error message
      this.passwordsDoNotMatch = true;
      return ;
    }

    let json = {
      email : this.resetPasswordForm.value.email ,
      emailOtp : this.resetPasswordForm.value.emailOtp ,
      password : this.resetPasswordForm.value.password
    }

    this.userService.reset_password_with_email(json).then((res) => {
      this.resetModalRef.close();
      this.open();
    })
  }
}
