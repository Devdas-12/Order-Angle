import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../data/services/api.service';
import { apiColletions } from '../core/constant/api-collection';
import { Helper } from './helper';
import { CartService } from '../data/services/cart.service';

export class Language {
  code!: string;
  label!: string;
  shorthand!: string;
  langJson!: any;
  userVisibility!: boolean;
}

@Injectable({ providedIn: 'root' })
export class LangService {
  supportedLanguages: Language[] = [];
  IMAGE_URL = environment.IMAGE_URL;
  defaultLanguage: any = localStorage.getItem('language');

  private languages = new BehaviorSubject<any>(null);
  languagesObservable = this.languages.asObservable();


  constructor(private translate: TranslateService, private _api: ApiService , private _helper : Helper , private _cartService : CartService) { }

  get_language_list(): Promise<boolean> {
    return new Promise((resolve, rejects) => {
      try {
        this._api.get({ url: apiColletions.get_language_list })
          .then((response) => {
            resolve(response.data);
          });
      } catch (err) {
        resolve(false);
      }
    });
  }

  configLanguages() {
    return new Promise((resolve, rejects) => {
      this.get_language_list().then((res_data: any) => {
        if (res_data) {
          res_data.languages.forEach((_lang: any) => {
            this.supportedLanguages.push({
              code: _lang.code,
              label: _lang.name,
              shorthand: _lang.code,
              langJson: _lang.languageJson,
              userVisibility: _lang.userVisibility,
            });
          });
          console.log(this.supportedLanguages);

          setTimeout(() => {
            this.languages.next(this.supportedLanguages);
          });
          resolve(true);
        } else { }
      });
    });
  }

  init(): void {
    // this.configLanguages().then(() => {
    //   this.supportedLanguages.forEach((_lang) => {
    //     this.translate.setTranslation(_lang.code, _lang.langJson);
    //   });

    //   let index = this.supportedLanguages.findIndex(
    //     (x) => x.code == this.defaultLanguage
    //   );

    //   if (index != -1) {
    //   } else {
    //     this.translate.setDefaultLang(this.supportedLanguages[0].code);
    //     this.translate.use(this.supportedLanguages[0].code);
    //   }
    // });
    this.translate.setDefaultLang('en');
    this.translate.use('en');

    this.storeCartToken();
  }

  storeCartToken(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let cart_unique_token = localStorage.getItem('cart_unique_token');
      if (cart_unique_token === null) {
        let new_token = this._helper.generate_new_uuid;
        localStorage.setItem('cart_unique_token', new_token);
        this._helper.cart_unique_token = new_token;
        this._cartService.cart_unique_token = new_token;
      } else {
        this._helper.cart_unique_token = cart_unique_token;
        this._cartService.cart_unique_token = cart_unique_token;
      }
      resolve(true)
    });
  }


  set language(lang: string) {
    let language = lang || '';

    const isSupportedLanguage = this.supportedLanguages
      .map((item) => item.code)
      .includes(language);
    if (!isSupportedLanguage) {
      language = this.defaultLanguage;
    }
    this.translate.use(language);
    localStorage.setItem('language', lang);
    // setThemeLang(language,this.direction);
  }

  get languageShorthand(): string {
    let currentLang = this.supportedLanguages.find(
      (item) => item.code === this.translate.currentLang
    );
    return currentLang ? currentLang.shorthand : 'en';
  }

  get languageLabel(): string {
    let language = this.supportedLanguages.find(
      (item) => item.code === this.translate.currentLang
    );
    return language?.label || '';
  }

  get languageIndex() {
    let languageIndex = this.supportedLanguages.findIndex((item) => item.code == this.translate.currentLang);

    return languageIndex;
  }
}
