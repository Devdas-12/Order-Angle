import { Subscription } from 'rxjs';
import { environment } from './../../../environments/environment';
import { Component, EventEmitter, HostListener, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { UserService } from 'src/app/data/services/user.service';
import { AuthComponent } from 'src/app/modules/auth/auth.component';
import { Helper } from 'src/app/shared/helper';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileModalComponent } from '../modals/user-profile-modal/user-profile-modal.component';
import { LoaderService } from 'src/app/data/services/loader.service';
import { HomeService } from 'src/app/data/services/home.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  modalRef!: NgbModalRef;
  loginUser: any;
  isLogin: boolean = false;
  imageUrl = environment.IMAGE_URL;
  profileObservable!: Subscription;
  modalConfig: any = {
    centered: true,
    ariaLabelledBy: 'modal-basic-title',
    size: 'sm',
  };
  @ViewChild('authModel', { static: false }) authModel!: AuthComponent;
  @ViewChild('logout_popup', { static: false }) logout_popup!: TemplateRef<any>;
  @ViewChild('profileModal', { static: false })
  profileModal!: UserProfileModalComponent;
  isSticky: boolean = false;
  storeDetails: any;
  localStoreDetails: any;
  @Input() isHome!: boolean;
  @Input() isMenuHome!: boolean;
  @Input() checkout!: boolean;
  searchValue = '';
  @Output() onOpen: EventEmitter<any> = new EventEmitter();
  @Output() onFilter: EventEmitter<any> = new EventEmitter();
  @Output() backClick: EventEmitter<any> = new EventEmitter();
  table_no: any = this.helper.selected_table;
  menuObservable!: Subscription;
  isSearch: boolean = false;
  store_id: any

  @Input() get user() {
    return this.searchValue;
  }

  set user(value: any) {
    this.userChange.emit(value);
    this.searchValue = value;
  }

  @Output() userChange = new EventEmitter();

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    this.isSticky = scrollPosition > 50; // Adjust the threshold as needed
  }

  constructor(
    private userService: UserService,
    public helper: Helper,
    private modalService: NgbModal,
    public loader: LoaderService,
    private _homeService: HomeService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params.length) {
        this.store_id = params._id;
      }else{
        this.store_id = localStorage.getItem('cartStoreId');
      }
    });
    this.get_store_data();
    if (this.helper.store_details) {
      this.localStoreDetails = JSON.parse(this.helper.store_details);
    }

    this.loader._isMainLoading = false;
  }

  get_store_data() {
    let json = { store_id: this.store_id, is_show_success_toast: false }
    this._homeService.get_store(json).then((res) => {
      this.storeDetails = res.store_detail;
    })
  }

  close() {
    this.modalRef.close();
  }

  onMenu() {
    this.onOpen.emit();
  }

  filterClick() {
    this.onFilter.emit();
  }

  confirm() {
    localStorage.removeItem('login_token');
    localStorage.removeItem('login_data');
    this.helper.jwt_token = '';
    location.reload();
  }

  onSearch() {
    this.isSearch = !this.isSearch;
  }

  onBack() {
    this.backClick.emit();
  }

  redirectTo() {
    this.helper._route.navigate(['/'], { queryParams: { _id: this.helper.store_id } });
  }

}
