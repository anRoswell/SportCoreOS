import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TiendaMobileComponent } from './tienda-mobile.component';

describe('TiendaMobileComponent', () => {
  let component: TiendaMobileComponent;
  let fixture: ComponentFixture<TiendaMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiendaMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TiendaMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
