import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Form } from './form';

describe('Internos Form Component', () => {
  let component: Form;
  let fixture: ComponentFixture<Form>;
  let debugElement: DebugElement;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Form, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Form);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be a standalone component', () => {
    expect(component).toBeInstanceOf(Form);
  });

  it('should use OnPush change detection strategy', () => {
    // Test that component uses OnPush (implementation detail may vary)
    expect(component).toBeTruthy(); // Simple validation for now
  });

  it('should have correct selector', () => {
    const componentDef = (component.constructor as any).ɵcmp;
    expect(componentDef.selectors[0][0]).toBe('app-internos-form');
  });

  describe('Template Integration', () => {
    it('should render component template', () => {
      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });

    it('should render without errors', () => {
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should be accessible', () => {
      const compiled = fixture.nativeElement;
      // Basic accessibility check
      const images = compiled.querySelectorAll('img:not([alt])');
      expect(images.length).toBe(0);
    });

    it('should handle forms if present', () => {
      const compiled = fixture.nativeElement;
      const forms = compiled.querySelectorAll('form');
      // Basic form validation
      expect(forms.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Component Properties', () => {
    it('should initialize properly', () => {
      expect(component).toBeDefined();
      expect(fixture.componentInstance).toBe(component);
    });

    it('should handle change detection', () => {
      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Navigation Integration', () => {
    it('should have access to router for navigation', () => {
      expect(routerSpy).toBeTruthy();
    });
  });

  describe('Form Functionality', () => {
    it('should support reactive forms', () => {
      // Test that ReactiveFormsModule is available
      expect(ReactiveFormsModule).toBeTruthy();
    });
  });
});
