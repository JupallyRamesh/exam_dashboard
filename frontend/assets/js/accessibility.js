// WCAG 2.1 Compliance and Screen Reader Support
const accessibility = {
    // Initialize screen reader support
    initScreenReader: () => {
        document.documentElement.setAttribute('role', 'application');
        document.documentElement.setAttribute('aria-label', 'Exam System');
    },
    
    // Add ARIA labels dynamically
    addAriaLabels: (element, label) => {
        element.setAttribute('aria-label', label);
        element.setAttribute('role', 'button');
    },
    
    // Keyboard navigation
    enableKeyboardNav: () => {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                // Ensure focus is visible
                document.body.classList.add('keyboard-navigation');
            }
        });
    },
    
    // Screen reader announcements
    announce: (message) => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('class', 'sr-only');
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 3000);
    }
};

export default accessibility;
