import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PagosMobileComponent } from './pagos-mobile.component';

describe('PagosMobileComponent', () => {
  let component: PagosMobileComponent;
  let fixture: ComponentFixture<PagosMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PagosMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
