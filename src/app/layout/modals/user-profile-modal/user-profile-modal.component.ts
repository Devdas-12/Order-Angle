import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UserService } from './../../../data/services/user.service';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Helper } from 'src/app/shared/helper';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss'],
})
export class UserProfileModalComponent {
  modalRef!: NgbModalRef;
  modalConfig = {
    centered: true,
    ariaLabelledBy: 'modal-basic-title',
    size: 'lg',
  };
  profileObservable!: Subscription;
  profileUpdate!: FormGroup;
  userDetails: any;
  imageUrl = environment.IMAGE_URL;
  imagefile!: Blob;
  profile_image: any;
  userSettings: any;

  @ViewChild('template', { static: true }) template!: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private _userService: UserService,
    public _helper: Helper,
    private _fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this._userService._settingsObservable.subscribe((res: any) => {
      this.userSettings = res?.data;
      this.__initForm();
    });
  }

  open() {
    this.profileObservable = this._userService._userdataObservable.subscribe(
      (data) => {
        this._userService.get_user_profile().then((res: any) => {
          this.userDetails = res.user;
          this.profileUpdate.patchValue({
            username: this.userDetails.username,
            phone: this.userDetails.phone,
            phoneCode: this.userDetails.phoneCode,
            email: this.userDetails.email,
          });
          this.profile_image = `${this.imageUrl}/profileImage/${this.userDetails.profileImage}`;
        });
      }
    );
    this.modalRef = this.modalService.open(this.template, this.modalConfig);
  }

  __initForm() {
    this.profileUpdate = this._fb.group({
      username: new FormControl('', [Validators.required]),
      phone: new FormControl('', [
        Validators.required,
        Validators.minLength(Number(this.userSettings?.minPhoneLength)),
        Validators.maxLength(Number(this.userSettings?.maxPhoneLength)),
      ]),
      phoneCode: new FormControl(''),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      password: new FormControl('', [Validators.minLength(6)]),
    });
  }

  onSelectImageFile(event: any) {
    // 1: Profile, 2: document,
    let files = event.target.files;
    if (files.length === 0) return;
    let mimeType = files[0].type;

    var fileType = this._helper.uploadFile.filter((element: any) => {
      return mimeType == element;
    });

    if (mimeType != fileType) {
      // this._notifierService.showNotification('error', this._helper.trans.instant('validation-title.invalid-image-format'));
      files = [];
      return;
    } else {
      this.imagefile = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.imagefile);
      reader.onload = (_event) => {
        this.profile_image = reader.result;
      };

    }

    // this.cropModel.imageChangedEvent = event;
    // this.cropModel.show();
  }

  updateProfile() {
    if (this.profileUpdate.invalid) {
      this.profileUpdate.markAllAsTouched();
      return;
    }

    let formData = new FormData();
    formData.set('username', this.profileUpdate.value.username);
    formData.set('phone', this.profileUpdate.value.phone);
    formData.set('email', this.profileUpdate.value.email);
    formData.set('phoneCode', this.profileUpdate.value.phoneCode);

    if (this.profileUpdate.value.password !== '') {
      formData.set('phone', this.profileUpdate.value.email);
    }
    if (this.imagefile) {
      formData.set('profileImage', this.imagefile);
    }

    this._userService.update_user_profile(formData).then((res) => {
    });
  }
}
