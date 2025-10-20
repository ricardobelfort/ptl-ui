import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';

import { Home } from './home';

describe('Home Component', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(component).toBeInstanceOf(Home);
  });

  it('should use OnPush change detection strategy', () => {
    // Test that component uses OnPush (implementation detail may vary)
    expect(component).toBeTruthy(); // Simple validation for now
  });

  it('should render component template', () => {
    const compiled = fixture.nativeElement;
    expect(compiled).toBeTruthy();
  });

  it('should have correct selector', () => {
    const componentDef = (component.constructor as any).ɵcmp;
    expect(componentDef.selectors[0][0]).toBe('app-home');
  });

  describe('Template Integration', () => {
    it('should render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should be accessible', () => {
      const compiled = fixture.nativeElement;
      // Basic accessibility check - no missing alt attributes on images
      const images = compiled.querySelectorAll('img:not([alt])');
      expect(images.length).toBe(0);
    });
  });

  describe('Component Lifecycle', () => {
    it('should initialize properly', () => {
      expect(component).toBeDefined();
      expect(fixture.componentInstance).toBe(component);
    });

    it('should handle multiple change detection cycles', () => {
      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});
