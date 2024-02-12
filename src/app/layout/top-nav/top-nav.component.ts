import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthComponent } from 'src/app/modules/auth/auth.component';
import { environment } from 'src/environments/environment';
import { UserProfileModalComponent } from '../modals/user-profile-modal/user-profile-modal.component';
import { UserService } from 'src/app/data/services/user.service';
import { Helper } from 'src/app/shared/helper';
import { LoaderService } from 'src/app/data/services/loader.service';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent {
  modalRef!: NgbModalRef;
  loginUser: any ;
  isLogin: boolean = false;
  imageUrl = environment.IMAGE_URL;
  profileObservable!: Subscription;
  modalConfig: any = { centered: true, ariaLabelledBy: 'modal-basic-title' , size :'sm' };
  @ViewChild('authModel', { static: false }) authModel!: AuthComponent;
  @ViewChild('logout_popup', { static: false }) logout_popup!: TemplateRef<any>;
  @ViewChild('profileModal' , {static : false}) profileModal! : UserProfileModalComponent;
  isSticky: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isSticky = scrollPosition > 50; // Adjust the threshold as needed
  }

  constructor(private userService: UserService, public helper: Helper , private modalService: NgbModal , private loader : LoaderService) {}

  ngOnInit() {
    if(this.helper.user_details){
      this.profileObservable = this.userService._userdataObservable.subscribe((res) => {
        this.loginUser = JSON.parse(this.helper.user_details).user;
      })
    }
    if(this.loginUser){
      this.isLogin = true;
    }
    this.getSettings();
    this.loader._isMainLoading = false ;
    // if (this.helper.jwt_token) {
    //   this.profileObservable = this.userService._userdataObservable.subscribe(
    //     (res_data) => {
    //       this.userService.get_user_profile().then((res: any) => {
    //         if (res) {
    //           this.loginUser = res.user;
    //         }
    //       });
    //     }
    //   );
    // }

  }

  login() {
    this.authModel.open();
  }

  onProfile(){
    this.profileModal.open();
  }

  logout(){
    this.modalRef = this.modalService.open(this.logout_popup, this.modalConfig);
  }

  onRegister() {
    this.authModel.registerModal();
  }

  getSettings() {
    this.userService.get_settings();
  }

  close(){
    this.modalRef.close();
  }

  confirm(){
    localStorage.removeItem('login_token');
    this.helper.jwt_token = '' ;
    location.reload();
  }
  
}
