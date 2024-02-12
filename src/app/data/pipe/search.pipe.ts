import { Pipe, PipeTransform } from '@angular/core';
// import { LangService } from '../shared/lang.service';

@Pipe({
    name: 'searchpipe',
})
export class SearchPipe implements PipeTransform {

    // constructor(private _lang:LangService){}
    constructor() { }

    transform(value: any, search: string, searcharea: string[]): any {
        if (search !== undefined && search !== '' && searcharea !== undefined) {
            const regex = new RegExp(search, 'i');
            const data : any= [];
            value.forEach((element : any) => {
                let flag = false;

                searcharea.forEach(ele => {

                    // if(typeof element[ele] === 'object'){
                    //     if (element[ele][this._lang.selectedlanguageIndex] && element[ele][this._lang.selectedlanguageIndex].match(regex)) {
                    //         flag = true;
                    //     }
                    // }else{
                    if (element['name'].match(regex)) {
                        flag = true;
                    }
                    // }
                });
                if (flag) {
                    data.push(element);
                }
            });
            return data;
        }
        return value;
    }
}