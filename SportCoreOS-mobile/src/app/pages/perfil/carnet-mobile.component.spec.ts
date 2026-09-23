import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CarnetMobileComponent } from './carnet-mobile.component';

describe('CarnetMobileComponent', () => {
  let component: CarnetMobileComponent;
  let fixture: ComponentFixture<CarnetMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarnetMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarnetMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
