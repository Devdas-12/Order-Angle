import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countrySearch',
})
export class CountrySearchPipe implements PipeTransform {
  transform(countries: any[], searchText: string): any[] {
    if (!countries || !searchText) {
      return countries;
    }

    searchText = searchText.toLowerCase();

    return countries.filter((country) => {
      return (
        country.name.toLowerCase().includes(searchText) ||
        country.code.includes(searchText)
      );
    });
  }
}
