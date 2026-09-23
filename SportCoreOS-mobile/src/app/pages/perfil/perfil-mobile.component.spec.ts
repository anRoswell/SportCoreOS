import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { PerfilMobileComponent } from './perfil-mobile.component';

describe('PerfilMobileComponent', () => {
  let component: PerfilMobileComponent;
  let fixture: ComponentFixture<PerfilMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilMobileComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
