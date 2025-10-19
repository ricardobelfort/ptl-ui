import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LoadingComponent } from './loading';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;

  const createComponent = (properties: any = {}) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [LoadingComponent]
    });

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;

    // Set input properties
    Object.keys(properties).forEach(key => {
      fixture.componentRef.setInput(key, properties[key]);
    });

    fixture.detectChanges();
    return { fixture, component };
  };

  describe('Component Initialization', () => {
    beforeEach(() => {
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default values', () => {
      expect(component.type()).toBe('spinner');
      expect(component.size()).toBe('md');
      expect(component.message()).toBe('');
      expect(component.inline()).toBe(false);
      expect(component.minimal()).toBe(false);
      expect(component.fullscreen()).toBe(false);
    });

    it('should render with default configuration', () => {
      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container).toBeTruthy();

      const spinner = fixture.debugElement.query(By.css('lucide-loader'));
      expect(spinner).toBeTruthy();
    });
  });

  describe('Loading Types', () => {
    it('should display spinner type', () => {
      createComponent({ type: 'spinner' });

      const spinner = fixture.debugElement.query(By.css('lucide-loader'));
      expect(spinner).toBeTruthy();
    });

    it('should display refresh type', () => {
      createComponent({ type: 'refresh' });

      const refresh = fixture.debugElement.query(By.css('lucide-refresh-cw'));
      expect(refresh).toBeTruthy();
    });

    it('should display circle type', () => {
      createComponent({ type: 'circle' });

      const circle = fixture.debugElement.query(By.css('lucide-circle'));
      expect(circle).toBeTruthy();
    });

    it('should display dots type', () => {
      createComponent({ type: 'dots' });

      const dots = fixture.debugElement.query(By.css('lucide-more-horizontal'));
      expect(dots).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should apply small size class', () => {
      createComponent({ size: 'sm' });

      const icon = fixture.debugElement.query(By.css('.loading-icon'));
      expect(icon.nativeElement.classList).toContain('size-sm');
    });

    it('should apply medium size class', () => {
      createComponent({ size: 'md' });

      const icon = fixture.debugElement.query(By.css('.loading-icon'));
      expect(icon.nativeElement.classList).toContain('size-md');
    });

    it('should apply large size class', () => {
      createComponent({ size: 'lg' });

      const icon = fixture.debugElement.query(By.css('.loading-icon'));
      expect(icon.nativeElement.classList).toContain('size-lg');
    });
  });

  describe('Layouts', () => {
    it('should apply inline layout class', () => {
      createComponent({ inline: true });

      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container.nativeElement.classList).toContain('inline');
    });

    it('should apply minimal layout class', () => {
      createComponent({ minimal: true });

      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container.nativeElement.classList).toContain('minimal');
    });

    it('should apply fullscreen layout when fullscreen is true', () => {
      createComponent({ fullscreen: true });

      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container.nativeElement.classList).toContain('fullscreen');
    });

    it('should have overlay when fullscreen is true', () => {
      createComponent({ fullscreen: true });

      const overlay = fixture.debugElement.query(By.css('.loading-overlay'));
      expect(overlay).toBeTruthy();
    });
  });

  describe('Message Display', () => {
    it('should not display message when not provided', () => {
      createComponent();

      const message = fixture.debugElement.query(By.css('.loading-message'));
      expect(message).toBeFalsy();
    });

    it('should display message when provided', () => {
      createComponent({ message: 'Loading data...' });

      const message = fixture.debugElement.query(By.css('.loading-message'));
      expect(message).toBeTruthy();
      expect(message.nativeElement.textContent.trim()).toBe('Loading data...');
    });

    it('should update message dynamically', () => {
      createComponent({ message: 'Initial message' });

      let message = fixture.debugElement.query(By.css('.loading-message'));
      expect(message.nativeElement.textContent.trim()).toBe('Initial message');

      fixture.componentRef.setInput('message', 'Updated message');
      fixture.detectChanges();

      message = fixture.debugElement.query(By.css('.loading-message'));
      expect(message.nativeElement.textContent.trim()).toBe('Updated message');
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct type class', () => {
      createComponent({ type: 'refresh' });

      const icon = fixture.debugElement.query(By.css('.loading-icon'));
      expect(icon.nativeElement.classList).toContain('type-refresh');
    });

    it('should combine multiple classes correctly', () => {
      createComponent({
        type: 'circle',
        size: 'lg',
        minimal: true
      });

      const container = fixture.debugElement.query(By.css('.loading-container'));
      const icon = fixture.debugElement.query(By.css('.loading-icon'));

      expect(container.nativeElement.classList).toContain('minimal');
      expect(icon.nativeElement.classList).toContain('type-circle');
      expect(icon.nativeElement.classList).toContain('size-lg');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      createComponent();

      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container.nativeElement.getAttribute('role')).toBe('status');
      expect(container.nativeElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should have aria-label when message is provided', () => {
      createComponent({ message: 'Loading content...' });

      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container.nativeElement.getAttribute('aria-label')).toBe('Loading content...');
    });

    it('should have default aria-label when no message', () => {
      createComponent();

      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container.nativeElement.getAttribute('aria-label')).toBe('Carregando...');
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with all props set', () => {
      createComponent({
        type: 'refresh',
        size: 'lg',
        minimal: true,
        message: 'Processing request...',
        fullscreen: true
      });

      const container = fixture.debugElement.query(By.css('.loading-container'));
      const icon = fixture.debugElement.query(By.css('.loading-icon'));
      const message = fixture.debugElement.query(By.css('.loading-message'));
      const overlay = fixture.debugElement.query(By.css('.loading-overlay'));

      expect(container.nativeElement.classList).toContain('fullscreen');
      expect(icon.nativeElement.classList).toContain('type-refresh');
      expect(icon.nativeElement.classList).toContain('size-lg');
      expect(message.nativeElement.textContent.trim()).toBe('Processing request...');
      expect(overlay).toBeTruthy();
    });

    it('should handle rapid prop changes', () => {
      createComponent({ type: 'spinner', size: 'sm' });

      // Change multiple properties
      fixture.componentRef.setInput('type', 'refresh');
      fixture.componentRef.setInput('size', 'lg');
      fixture.componentRef.setInput('message', 'Loading...');
      fixture.detectChanges();

      fixture.componentRef.setInput('type', 'circle');
      fixture.componentRef.setInput('message', 'Almost done...');
      fixture.detectChanges();

      // Verify final state
      const icon = fixture.debugElement.query(By.css('.loading-icon'));
      const message = fixture.debugElement.query(By.css('.loading-message'));

      expect(icon.nativeElement.classList).toContain('type-circle');
      expect(icon.nativeElement.classList).toContain('size-lg');
      expect(message.nativeElement.textContent.trim()).toBe('Almost done...');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined values gracefully', () => {
      expect(() => {
        createComponent({
          message: undefined,
          inline: undefined
        });
      }).not.toThrow();
    });

    it('should handle null values gracefully', () => {
      expect(() => {
        createComponent({
          message: null,
          inline: null
        });
      }).not.toThrow();
    });

    it('should handle empty string message', () => {
      createComponent({ message: '' });

      const message = fixture.debugElement.query(By.css('.loading-message'));
      expect(message).toBeTruthy();
      expect(message.nativeElement.textContent.trim()).toBe('');
    });
  });
});