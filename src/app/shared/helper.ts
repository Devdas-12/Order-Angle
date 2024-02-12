import { HttpClient } from '@angular/common/http';
import { DEFAULT_IMAGE } from './../core/constant/constant';
import { Injectable, NgZone, Inject } from '@angular/core';
import { Route, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
// import { ToastService } from '../data/services/toast.service';
import { BehaviorSubject, Observable } from 'rxjs';
// import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class Helper {
  jwt_token: any = localStorage.getItem('login_token');
  user_details: any = localStorage.getItem('userDetails');
  DEFAULT_IMAGE = DEFAULT_IMAGE;
  uploadFile = ['image/jpeg', 'image/jpg', 'image/png'];
  is_qr_code_scanned: boolean = false;
  is_table_booking: boolean = false;
  country_id: any = '62b949ea019b9f20b7aa9992';
  city_id: any = '62b94a15019b9f20b7aa9994';
  is_tax_inclusive: any;
  delivery_type: any;
  cart_unique_token: any;
  selected_table: any = sessionStorage.getItem('table_no');
  tip_amount: any = Number(sessionStorage.getItem('tip_amount')) || '';
  store_id = localStorage.getItem('cartStoreId');
  store_details: any = localStorage.getItem('store_data') || '';
  public store_data = new BehaviorSubject<boolean>(false);
  storeObservable: Observable<boolean> = this.store_data.asObservable();
  public dietary_tag_data = new BehaviorSubject<any>(false);
  tagObservable: Observable<boolean> = this.dietary_tag_data.asObservable();

  constructor(public _route: Router, public _translate: TranslateService, private http: HttpClient) { }

  phone_number_validation(evt: any) {
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57)) ||
      charCode === 101
    ) {
      return false;
    }
    return true;
  }

  pad2(number: number) {
    return (number < 10 ? '0' : '') + number
  }

  get generate_new_uuid(): string {
    return 'xxxxxxxx-xxxx-xxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  loadScript(name: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = name;
      document.getElementsByTagName('head')[0].appendChild(script);
      resolve(true)
      script.src = name
    });
  }

  downloadtoPdf(pdfUrl: string): Observable<Blob> {
    return this.http.get(pdfUrl, { responseType: 'blob' });
  }

}
