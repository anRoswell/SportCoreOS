import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RendimientoMobileComponent } from './rendimiento-mobile.component';

describe('RendimientoMobileComponent', () => {
  let component: RendimientoMobileComponent;
  let fixture: ComponentFixture<RendimientoMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RendimientoMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RendimientoMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
