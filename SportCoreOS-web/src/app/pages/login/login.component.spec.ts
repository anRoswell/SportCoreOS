import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent (Seguridad & Captcha)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create LoginComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Formulario de Acceso', () => {
    it('debe actualizar los valores de email y contraseña correctamente', () => {
      component.email = 'admin@club.com';
      component.password = 'MiClaveSegura123!';
      expect(component.email).toBe('admin@club.com');
      expect(component.password).toBe('MiClaveSegura123!');
    });
  });

  describe('Sistema Captcha Anti-Bot', () => {
    it('debe inicializar un código Captcha visual y su SVG en el montaje', () => {
      expect(component.captchaCode()).toBeTruthy();
      expect(component.captchaCode().length).toBe(5);
      expect(component.captchaSvg()).toBeTruthy();
    });

    it('debe validar coincidencia de Captcha ignorando mayúsculas/minúsculas', () => {
      const code = component.captchaCode();
      component.captchaInput.set(code.toLowerCase());
      expect(component.isCaptchaMatched()).toBe(true);
    });

    it('debe reportar error cuando el captcha no coincide', () => {
      component.captchaInput.set('99999');
      expect(component.isCaptchaMatched()).toBe(false);
    });
  });

  describe('Navegación de Pestañas (Tabs)', () => {
    it('debe iniciar por defecto en la pestaña de login institucional', () => {
      expect(component.activeTab()).toBe('login');
    });

    it('debe permitir cambiar a la pestaña de modo demo', () => {
      component.activeTab.set('demo');
      expect(component.activeTab()).toBe('demo');
    });

    it('debe permitir regresar a la pestaña de login institucional', () => {
      component.activeTab.set('demo');
      component.activeTab.set('login');
      expect(component.activeTab()).toBe('login');
    });
  });
});
