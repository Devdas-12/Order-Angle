import { Injectable } from '@angular/core';
import { apiColletions } from 'src/app/core/constant/api-collection';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  constructor(private _api : ApiService) {}

  get_subscriptions(): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      try {
        this._api.get({ url: apiColletions.get_subscription_list }).then((response) => {
          resolve(response.data);
        });
      } catch (err) {
        resolve(false);
      }
    });
  }

  get_activated_subscription(){
    return new Promise((resolve, rejects) => {
      try {
        this._api.get({ url: apiColletions.get_active_subscription }).then((response) => {
          resolve(response.data);
        });
      } catch (err) {
        resolve(false);
      }
    });
  }

  get_subscription_history(){
    return new Promise((resolve, rejects) => {
      try {
        this._api.get({ url: apiColletions.get_subscription_history }).then((response) => {
          resolve(response.data);
        });
      } catch (err) {
        resolve(false);
      }
    });
  }
}
