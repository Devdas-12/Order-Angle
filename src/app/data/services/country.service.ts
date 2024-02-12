import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiColletions } from 'src/app/core/constant/api-collection';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root',
})
export class CountryService {
    constructor(private http: HttpClient, private _api: ApiService) { }

    getCountryData(): Observable<any> {
        return this.http.get('assets/country_json/country_list.json');
    }

    async get_country(): Promise<any> {
        try {
            const response = await this._api.get({ url: apiColletions.get_countries, parameters: {} })
            if (response.success) {
                return response.data;
            } else {
                return []
            }
        } catch (err) {
            return []
        }
    }
}
