import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { CanchasMobileComponent } from './canchas-mobile.component';

describe('CanchasMobileComponent', () => {
  let component: CanchasMobileComponent;
  let fixture: ComponentFixture<CanchasMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanchasMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CanchasMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
