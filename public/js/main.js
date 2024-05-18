class Dashboard {
  constructor () {
    this.initElements();
    this.setupListeners();
  }

  initElements() {
    const ids = ['dynamicContent', 'themeToggle', 'menuConversion', 'menuWallet', 'menuTrading', 'menuAbout'];
    this.elements = ids.reduce((acc, id) => {
      acc[id] = document.getElementById(id);
      return acc;
    }, {});
  }

  setupListeners() {
    ['menuConversion', 'menuWallet', 'menuTrading', 'menuAbout'].forEach(menuId => {
      const element = this.elements[menuId];
      if (element) {
        element.addEventListener('click', async () => {
          await this.loadDynamicContent(`includes/${menuId.substring(4).toLowerCase()}.html`);
        });
      }
    });
  }

  async loadDynamicContent(content) {
    try {
      const response = await fetch(content);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const html = await response.text();
      this.cleanDynamicContent();
      this.sanitizeAndInsertHTML(html, this.elements.dynamicContent);
      this.refreshScripts();
    } catch (error) {
      console.error('Failed to load the content:', error);
      this.elements.dynamicContent.innerHTML = `<p>Error loading the content. Please try again later.</p>`;
    }
  }
  cleanDynamicContent() {
    while (this.elements.dynamicContent.firstChild) {
      this.elements.dynamicContent.removeChild(this.elements.dynamicContent.firstChild);
    }
  }

  sanitizeAndInsertHTML(html, container) {
    const sanitized = html.replace(/<script.*?>.*?<\/script>/gi, '');
    container.innerHTML = sanitized;
  }

  refreshScripts() {
    const scripts = this.elements.dynamicContent.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => new Dashboard());
