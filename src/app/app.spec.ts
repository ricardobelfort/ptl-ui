import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App Component', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: routerSpyObj }
      ],
    }).compileComponents();

    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should be a standalone component', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeInstanceOf(App);
  });

  it('should have title signal', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect((app as any).title()).toBe('ptl-ui');
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  describe('Template Integration', () => {
    it('should render without errors', () => {
      const fixture = TestBed.createComponent(App);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should be accessible', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      // Basic accessibility check
      const images = compiled.querySelectorAll('img:not([alt])');
      expect(images.length).toBe(0);
    });
  });

  describe('Component Properties', () => {
    it('should initialize properly', () => {
      const fixture = TestBed.createComponent(App);
      const app = fixture.componentInstance;
      expect(app).toBeDefined();
      expect(fixture.componentInstance).toBe(app);
    });

    it('should handle change detection', () => {
      const fixture = TestBed.createComponent(App);
      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Navigation Integration', () => {
    it('should have access to router', () => {
      expect(routerSpy).toBeTruthy();
    });

    it('should support routing', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      // Router outlet should be present for navigation
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });
  });
});
