import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { BoletinIaMobileComponent } from './boletin-ia-mobile.component';

describe('BoletinIaMobileComponent', () => {
  let component: BoletinIaMobileComponent;
  let fixture: ComponentFixture<BoletinIaMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoletinIaMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BoletinIaMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
