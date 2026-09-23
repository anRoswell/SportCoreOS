import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NoticiasMobileComponent } from './noticias-mobile.component';

describe('NoticiasMobileComponent', () => {
  let component: NoticiasMobileComponent;
  let fixture: ComponentFixture<NoticiasMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticiasMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticiasMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
