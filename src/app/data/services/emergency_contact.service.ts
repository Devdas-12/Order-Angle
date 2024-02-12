import { Injectable } from '@angular/core';
import { apiColletions } from 'src/app/core/constant/api-collection';
import { ApiService } from './api.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmegencyContactService {
    
  private contactUpdate = new BehaviorSubject<any>(null);
  _contactObservable = this.contactUpdate.asObservable();

  constructor(private _api: ApiService) {}

  get_emergency_contacts(): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      try {
        this._api
          .get({ url: apiColletions.get_emergency_contacts })
          .then((response) => {
            resolve(response.data);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  add_contacts(parameters: any): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      try {
        this._api
          .post({ url: apiColletions.add_new_contact, parameters })
          .then((response) => {
            this.contactUpdate.next({});
            resolve(response.data);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  add_multiple_contacts(parameters: any): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      try {
        this._api
          .post({ url: apiColletions.add_multiple_contacts, parameters })
          .then((response) => {
            this.contactUpdate.next({});
            resolve(response.data);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  edit_contacts(parameters: any , _id : any): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      try {
        this._api
          .put({ url: `${apiColletions.edit_contact}/${_id}`, parameters })
          .then((response) => {
            this.contactUpdate.next({});
            resolve(response.data);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }
  delete_contacts(_id : any): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      try {
        this._api
          .delete({ url: `${apiColletions.edit_contact}/${_id}`})
          .then((response) => {
            this.contactUpdate.next({});
            resolve(response.data);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }
}
