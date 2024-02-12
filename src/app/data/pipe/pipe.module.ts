import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountrySearchPipe } from './country-search.pipe';
import { SearchPipe } from './search.pipe';

@NgModule({
  declarations: [CountrySearchPipe , SearchPipe],
  imports: [CommonModule],
  exports: [CountrySearchPipe , SearchPipe],
})
export class PipeModule {}