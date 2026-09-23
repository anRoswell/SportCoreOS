import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ServiciosMobileComponent } from './servicios-mobile.component';

describe('ServiciosMobileComponent', () => {
  let component: ServiciosMobileComponent;
  let fixture: ComponentFixture<ServiciosMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiciosMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
