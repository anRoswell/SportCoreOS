import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PartidosMobileComponent } from './partidos-mobile.component';

describe('PartidosMobileComponent', () => {
  let component: PartidosMobileComponent;
  let fixture: ComponentFixture<PartidosMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartidosMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PartidosMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
