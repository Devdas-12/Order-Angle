import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { apiColletions } from 'src/app/core/constant/api-collection';
import { Helper } from 'src/app/shared/helper';

@Injectable({
    providedIn: 'root',
})
export class HomeService {
    
    constructor(private _api: ApiService , public _helper : Helper) {}

    async get_store(parameters : any): Promise<any>{
        try{
            const response = await this._api.post({url : apiColletions.get_store_data , parameters})
            this._helper.store_data.next(response.data.store_detail) ;
            let store_data : any = {
                store_id : response.data.store_detail._id,
                name : response.data.store_detail.name,
                store_email : response.data.store_detail.email,
                city_id : response.data.store_detail.city_id,
                country_id : response.data.store_detail.country_id,
            }
            this._helper.store_details = JSON.stringify(store_data);
            localStorage.setItem('store_data' , JSON.stringify(store_data));
            return response.data;
        }catch(err){
            return err ;
        }
    }

    async get_product_group_list(parameters : any): Promise<any>{
        try{
            const response = await this._api.post({url : apiColletions.get_product_group_list , parameters});
            return response.data;
        } catch(err){
            return err ;
        }
    }

    async get_store_product_item_list(parameters : any): Promise<any>{
        try{
            const response = await this._api.post({url : apiColletions.user_get_store_product_item_list , parameters});
            // this._helper.store_data.next(response.data.store) ;
            return response.data ;
        }catch(err){
            return  err;
        }
    }

    async get_table_list(parameters : any) : Promise<any>{
        try{
            const response = await this._api.post({url : apiColletions.get_table_list , parameters});
            return response.data ;
        } catch (err){
            return false ;
        }
    }
}