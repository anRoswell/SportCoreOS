import { Pipe, PipeTransform } from '@angular/core';
import { formatSportCurrency } from '../utils/currency-formatter.util';

@Pipe({
  name: 'sportCurrency',
  standalone: true
})
export class SportCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, includeSymbol: boolean = true, suffix: string = ''): string {
    return formatSportCurrency(value, includeSymbol, suffix);
  }
}
