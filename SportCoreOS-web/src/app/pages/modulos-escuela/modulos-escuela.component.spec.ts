import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ModulosEscuelaComponent } from './modulos-escuela.component';

describe('ModulosEscuelaComponent', () => {
  let component: ModulosEscuelaComponent;
  let fixture: ComponentFixture<ModulosEscuelaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulosEscuelaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModulosEscuelaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
