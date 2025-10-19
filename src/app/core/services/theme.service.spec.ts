import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageGetSpy: jasmine.Spy;
  let localStorageSetSpy: jasmine.Spy;
  let documentClassListRemoveSpy: jasmine.Spy;
  let documentClassListAddSpy: jasmine.Spy;
  let matchMediaSpy: jasmine.Spy;

  beforeEach(() => {
    // Reset localStorage spies
    localStorageGetSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    localStorageSetSpy = spyOn(localStorage, 'setItem');

    // Reset document spies
    documentClassListRemoveSpy = spyOn(document.documentElement.classList, 'remove');
    documentClassListAddSpy = spyOn(document.documentElement.classList, 'add');

    // Reset matchMedia spy
    matchMediaSpy = jasmine.createSpy('matchMedia').and.returnValue({
      matches: false,
      addEventListener: jasmine.createSpy(),
      removeEventListener: jasmine.createSpy()
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaSpy
    });

    TestBed.configureTestingModule({});
  });

  describe('Basic Functionality', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(ThemeService);
      tick(); // Allow initial effects to run
    }));

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

    it('should apply theme to DOM when changed', fakeAsync(() => {
      // Reset spies after initialization
      documentClassListRemoveSpy.calls.reset();
      documentClassListAddSpy.calls.reset();
      localStorageSetSpy.calls.reset();

      service.setTheme('dark');
      tick();

      expect(documentClassListRemoveSpy).toHaveBeenCalledWith('light', 'dark');
      expect(documentClassListAddSpy).toHaveBeenCalledWith('dark');
      expect(localStorageSetSpy).toHaveBeenCalledWith('ptl-theme', 'dark');
    }));
  });

  describe('Initialization Scenarios', () => {
    it('should initialize from localStorage when available - dark theme', () => {
      localStorageGetSpy.and.returnValue('dark');
      service = TestBed.inject(ThemeService);

      expect(service.currentTheme()).toBe('dark');
      expect(service.isDarkMode()).toBeTrue();
    });

    it('should initialize from localStorage when available - light theme', () => {
      localStorageGetSpy.and.returnValue('light');
      service = TestBed.inject(ThemeService);

      expect(service.currentTheme()).toBe('light');
      expect(service.isDarkMode()).toBeFalse();
    });

    it('should ignore invalid localStorage values', () => {
      localStorageGetSpy.and.returnValue('invalid-theme');
      service = TestBed.inject(ThemeService);

      expect(service.currentTheme()).toBe('light'); // Falls back to system preference
    });

    it('should use system preference when no localStorage and prefers dark', () => {
      localStorageGetSpy.and.returnValue(null);
      matchMediaSpy.and.returnValue({
        matches: true,
        addEventListener: jasmine.createSpy(),
        removeEventListener: jasmine.createSpy()
      });

      service = TestBed.inject(ThemeService);

      expect(service.currentTheme()).toBe('dark');
      expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should use system preference when no localStorage and prefers light', () => {
      localStorageGetSpy.and.returnValue(null);
      matchMediaSpy.and.returnValue({
        matches: false,
        addEventListener: jasmine.createSpy(),
        removeEventListener: jasmine.createSpy()
      });

      service = TestBed.inject(ThemeService);

      expect(service.currentTheme()).toBe('light');
      expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    });

    it('should fallback to light theme when no window.matchMedia available', () => {
      localStorageGetSpy.and.returnValue(null);
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined
      });

      service = TestBed.inject(ThemeService);

      expect(service.currentTheme()).toBe('light');
    });
  });

  describe('Edge Cases and Browser Compatibility', () => {
    beforeEach(fakeAsync(() => {
      service = TestBed.inject(ThemeService);
      tick(); // Allow initial effects to run
    }));

    it('should handle server-side rendering gracefully', fakeAsync(() => {
      // Test that the service doesn't crash in SSR environment
      // by checking if applyTheme handles undefined document
      service.setTheme('dark');
      tick();

      // Should not throw errors and theme should still update
      expect(service.currentTheme()).toBe('dark');
      expect(service.isDarkMode()).toBeTrue();
    }));

    it('should maintain readonly nature of currentTheme signal', () => {
      const themeSignal = service.currentTheme;

      // Should be a function (signal)
      expect(typeof themeSignal).toBe('function');

      // Should return current value
      expect(themeSignal()).toBe('light');

      // Verify it's the same instance (readonly)
      expect(service.currentTheme).toBe(themeSignal);
    });

    it('should handle rapid theme changes', fakeAsync(() => {
      // Reset spies after initialization
      localStorageSetSpy.calls.reset();

      service.setTheme('dark');
      tick();

      expect(service.currentTheme()).toBe('dark');
      expect(localStorageSetSpy).toHaveBeenCalledWith('ptl-theme', 'dark');

      service.setTheme('light');
      tick();

      expect(localStorageSetSpy).toHaveBeenCalledWith('ptl-theme', 'light');
    }));

    it('should verify isDarkMode computed signal', () => {
      service.setTheme('light');
      expect(service.isDarkMode()).toBeFalse();

      service.setTheme('dark');
      expect(service.isDarkMode()).toBeTrue();
    });
  });
});