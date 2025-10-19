import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');

    // Mock document
    spyOn(document.documentElement.classList, 'remove');
    spyOn(document.documentElement.classList, 'add');

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jasmine.createSpy('matchMedia').and.returnValue({
        matches: false,
        addEventListener: jasmine.createSpy(),
        removeEventListener: jasmine.createSpy()
      })
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with light theme by default', () => {
    expect(service.currentTheme()).toBe('light');
    expect(service.isDarkMode()).toBeFalse();
  });

  it('should toggle theme from light to dark', fakeAsync(() => {
    expect(service.currentTheme()).toBe('light');

    service.toggleTheme();
    tick(); // Trigger effects

    expect(service.currentTheme()).toBe('dark');
    expect(service.isDarkMode()).toBeTrue();
  }));

  it('should toggle theme from dark to light', fakeAsync(() => {
    service.setTheme('dark');
    tick();
    expect(service.currentTheme()).toBe('dark');

    service.toggleTheme();
    tick();

    expect(service.currentTheme()).toBe('light');
    expect(service.isDarkMode()).toBeFalse();
  }));

  it('should set specific theme', fakeAsync(() => {
    service.setTheme('dark');
    tick();
    expect(service.currentTheme()).toBe('dark');

    service.setTheme('light');
    tick();
    expect(service.currentTheme()).toBe('light');
  }));

  it('should update theme signal when set', fakeAsync(() => {
    service.setTheme('dark');
    tick();

    expect(service.currentTheme()).toBe('dark');
    expect(service.isDarkMode()).toBeTrue();
  }));
});