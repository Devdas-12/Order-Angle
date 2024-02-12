import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountrySearchPipe } from 'src/app/data/pipe/country-search.pipe';
import { PipeModule } from 'src/app/data/pipe/pipe.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AuthComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule ,
    PipeModule,
    TranslateModule
  ],
  exports : [AuthComponent],
  providers: []
})
export class authModule { }
