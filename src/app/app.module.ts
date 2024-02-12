import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './modules/home-page/home-page.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { authModule } from './modules/auth/auth.module';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgbAccordionModule, NgbCarouselModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalsModule } from './layout/modals/modals.module';
import { LoaderComponent } from './layout/loader/loader.component';
import { ToastrComponent } from './layout/toastr/toastr.component';
import { ResInterceptInterceptor } from './core/interceptor/res-intercept.interceptor';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MenuHomeComponent } from './modules/menu-home/menu-home.component';
import { CheckoutComponent } from './modules/checkout/checkout.component';
import { CartPageComponent } from './modules/cart-page/cart-page.component';
import { ThanksPageComponent } from './modules/thanks-page/thanks-page.component';
import { MbscModule } from '@mobiscroll/angular';
import { DirectivesModule } from './data/directive/directive.module';
import { PipeModule } from './data/pipe/pipe.module';

import { register } from 'swiper/element/bundle';
import { NgSelectModule } from '@ng-select/ng-select';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaModule, RecaptchaV3Module } from 'ng-recaptcha';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MAT_SNACK_BAR_DATA, MatSnackBarModule } from '@angular/material/snack-bar';

register();


@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    NavbarComponent,
    LoaderComponent,
    ToastrComponent,
    MenuHomeComponent,
    CheckoutComponent,
    CartPageComponent,
    ThanksPageComponent
  ],
  imports: [
    MbscModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    authModule,
    HttpClientModule,
    NgbDropdownModule,
    ReactiveFormsModule,
    ModalsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, 'assets/language/', '.json'),
        deps: [HttpClient]
      }
    }),
    NgbCarouselModule,
    NgbAccordionModule,
    DirectivesModule,
    PipeModule,
    NgSelectModule,
    RecaptchaV3Module,
    RecaptchaModule,
    MatSnackBarModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResInterceptInterceptor,
      multi: true,
    },
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: "6Lf1a1IpAAAAABVWRlJEip0IYCIdlRB6vVr9gUtE" },
    { provide: MAT_SNACK_BAR_DATA, useValue: {} }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
