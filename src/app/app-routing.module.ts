import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './modules/home-page/home-page.component';
import { MenuHomeComponent } from './modules/menu-home/menu-home.component';
import { CheckoutComponent } from './modules/checkout/checkout.component';
import { CartPageComponent } from './modules/cart-page/cart-page.component';
import { ThanksPageComponent } from './modules/thanks-page/thanks-page.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    pathMatch: 'full',
  },
  {
    path: 'menu-home',
    component: MenuHomeComponent,
  },
  {
    path: 'cart',
    component: CartPageComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
  },
  {
    path: 'thanks-page',
    component: ThanksPageComponent,
  },
  {
    path : 'web-ordering',
    loadChildren: () => import('./modules/web-ordering/web-ordering.module').then(m => m.WebOrderingModule) as Promise<any>
  },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


// 'c1f6ebba-322a-803-0739-4b4e55069b88'