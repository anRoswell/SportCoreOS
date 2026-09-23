import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.removeItem('sportcore_theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.removeItem('sportcore_theme');
  });

  it('should be created and default to light theme', () => {
    expect(service).toBeTruthy();
    expect(service.currentTheme()).toBe('light');
    expect(service.isDark()).toBeFalse();
  });

  it('should toggle theme between light and dark', () => {
    expect(service.currentTheme()).toBe('light');
    service.toggleTheme();
    expect(service.currentTheme()).toBe('dark');
    expect(service.isDark()).toBeTrue();

    service.toggleTheme();
    expect(service.currentTheme()).toBe('light');
    expect(service.isDark()).toBeFalse();
  });

  it('should set theme explicitly', () => {
    service.setTheme('dark');
    expect(service.currentTheme()).toBe('dark');
    service.setTheme('light');
    expect(service.currentTheme()).toBe('light');
  });
});
