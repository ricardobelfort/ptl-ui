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

      const spinner = fixture.debugElement.query(By.css('lucide-icon'));
      expect(spinner).toBeTruthy();
    });
  });

  describe('Loading Types', () => {
    it('should display spinner type', () => {
      createComponent({ type: 'spinner' });

      const spinner = fixture.debugElement.query(By.css('lucide-icon'));
      expect(spinner).toBeTruthy();
    });

    it('should display refresh type', () => {
      createComponent({ type: 'refresh' });

      const refresh = fixture.debugElement.query(By.css('lucide-icon'));
      expect(refresh).toBeTruthy();
    });

    it('should display circle type', () => {
      createComponent({ type: 'circle' });

      const circle = fixture.debugElement.query(By.css('lucide-icon'));
      expect(circle).toBeTruthy();
    });

    it('should display dots type', () => {
      createComponent({ type: 'dots' });

      const dots = fixture.debugElement.query(By.css('.loading-dots'));
      expect(dots).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should apply small size class', () => {
      createComponent({ size: 'sm' });

      // Test that the component has the correct size input
      expect(component.size()).toBe('sm');
      
      // Test that iconClass method returns the correct class
      expect(component['iconClass']()).toContain('sm');
    });

    it('should apply medium size class', () => {
      createComponent({ size: 'md' });

      // Test that the component has the correct size input
      expect(component.size()).toBe('md');
      
      // Test that iconClass method returns the correct class
      expect(component['iconClass']()).toContain('md');
    });

    it('should apply large size class', () => {
      createComponent({ size: 'lg' });

      // Test that the component has the correct size input
      expect(component.size()).toBe('lg');
      
      // Test that iconClass method returns the correct class
      expect(component['iconClass']()).toContain('lg');
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

    it('should have fullscreen style when fullscreen is true', () => {
      createComponent({ fullscreen: true });

      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container.nativeElement.classList).toContain('fullscreen');
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
    it('should generate correct icon classes', () => {
      createComponent({ size: 'lg' });

      // Test that iconClass method generates the correct classes
      expect(component['iconClass']()).toBe('loading-icon lg');
    });

    it('should combine multiple classes correctly', () => {
      createComponent({
        type: 'circle',
        size: 'lg',
        minimal: true
      });

      const container = fixture.debugElement.query(By.css('.loading-container'));
      
      // Test container classes
      expect(container.nativeElement.classList).toContain('minimal');
      
      // Test component methods return correct classes
      expect(component['iconClass']()).toBe('loading-icon lg');
      expect(component['containerClass']()).toBe('minimal');
      
      // Test that correct icon is rendered for circle type
      const circleIcon = fixture.debugElement.query(By.css('lucide-icon'));
      expect(circleIcon).toBeTruthy();
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
      const icon = fixture.debugElement.query(By.css('lucide-icon'));
      const message = fixture.debugElement.query(By.css('.loading-message'));

      // Test container classes
      expect(container.nativeElement.classList).toContain('fullscreen');
      expect(container.nativeElement.classList).toContain('minimal');
      
      // Test component state
      expect(component.type()).toBe('refresh');
      expect(component.size()).toBe('lg');
      expect(component.message()).toBe('Processing request...');
      
      // Test rendered elements
      expect(icon).toBeTruthy();
      expect(message.nativeElement.textContent.trim()).toBe('Processing request...');
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
      const icon = fixture.debugElement.query(By.css('lucide-icon'));
      const message = fixture.debugElement.query(By.css('.loading-message'));

      // Test component state
      expect(component.type()).toBe('circle');
      expect(component.size()).toBe('lg');
      expect(component.message()).toBe('Almost done...');
      
      // Test rendered elements
      expect(icon).toBeTruthy();
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
      expect(message).toBeFalsy(); // Empty string should not render message element
      
      // But container should still have correct aria-label
      const container = fixture.debugElement.query(By.css('.loading-container'));
      expect(container.nativeElement.getAttribute('aria-label')).toBe('Carregando...');
    });
  });
});