<script type="text/javascript">
(function() {
  // AssetEmbed - A simple asset customization library
  class AssetEmbed {
    constructor(options = {}) {
      this.options = {
        container: '#entity-page-embed',
        title: 'Embedded Asset Visualization',
        description: 'This is a sample embedded asset from our customization library.',
        theme: 'light',
        ...options
      };
      
      this.initialized = false;
    }
    
    initialize() {
      if (this.initialized) return;
      
      const container = document.querySelector(this.options.container);
      if (!container) {
        console.error('AssetEmbed: Container not found', this.options.container);
        return;
      }
      
      // Clear any error messages
      container.innerHTML = '';
      
      // Create the visualization container
      const vizContainer = document.createElement('div');
      vizContainer.className = 'card shadow my-4';
      vizContainer.style.height = '500px';
      
      // Add header
      const header = document.createElement('div');
      header.className = 'card-header d-flex justify-content-between align-items-center';
      
      const title = document.createElement('h5');
      title.className = 'mb-0';
      title.textContent = this.options.title;
      
      const controls = document.createElement('div');
      controls.className = 'btn-group';
      
      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'btn btn-sm btn-outline-secondary';
      refreshBtn.innerHTML = '<i class="fa-light fa-refresh"></i>';
      refreshBtn.addEventListener('click', () => this.refreshData());
      
      controls.appendChild(refreshBtn);
      header.appendChild(title);
      header.appendChild(controls);
      
      // Add body
      const body = document.createElement('div');
      body.className = 'card-body';
      
      const description = document.createElement('p');
      description.className = 'card-text';
      description.textContent = this.options.description;
      
      const chartContainer = document.createElement('div');
      chartContainer.id = 'asset-chart-container';
      chartContainer.style.height = '350px';
      chartContainer.style.position = 'relative';
      
      body.appendChild(description);
      body.appendChild(chartContainer);
      
      // Assemble the visualization
      vizContainer.appendChild(header);
      vizContainer.appendChild(body);
      container.appendChild(vizContainer);
      
      // Create a sample chart
      this.createSampleChart();
      
      this.initialized = true;
      console.log('AssetEmbed: Initialized successfully');
      
      return this;
    }
    
    createSampleChart() {
      const container = document.getElementById('asset-chart-container');
      if (!container) return;
      
      // Create a simple bar chart using DIVs
      const data = [
        { label: 'Category A', value: 45 },
        { label: 'Category B', value: 72 },
        { label: 'Category C', value: 35 },
        { label: 'Category D', value: 65 },
        { label: 'Category E', value: 53 }
      ];
      
      const chartWrapper = document.createElement('div');
      chartWrapper.className = 'd-flex flex-column h-100';
      
      const chartTitle = document.createElement('h6');
      chartTitle.className = 'text-center mb-4';
      chartTitle.textContent = 'Sample Data Visualization';
      
      const chartBody = document.createElement('div');
      chartBody.className = 'd-flex justify-content-around align-items-end h-75';
      chartBody.style.borderBottom = '1px solid #dee2e6';
      chartBody.style.paddingBottom = '10px';
      
      // Create bars
      data.forEach(item => {
        const barContainer = document.createElement('div');
        barContainer.className = 'd-flex flex-column align-items-center';
        barContainer.style.width = `${100 / data.length}%`;
        
        const barValue = document.createElement('div');
        barValue.className = 'mb-2';
        barValue.textContent = item.value;
        
        const bar = document.createElement('div');
        bar.className = 'bg-primary rounded-top';
        bar.style.width = '80%';
        bar.style.height = `${item.value * 2}px`;
        bar.style.transition = 'height 0.5s ease-in-out';
        
        const barLabel = document.createElement('div');
        barLabel.className = 'mt-2 text-center small';
        barLabel.textContent = item.label;
        
        barContainer.appendChild(barValue);
        barContainer.appendChild(bar);
        barContainer.appendChild(barLabel);
        chartBody.appendChild(barContainer);
      });
      
      chartWrapper.appendChild(chartTitle);
      chartWrapper.appendChild(chartBody);
      container.appendChild(chartWrapper);
    }
    
    refreshData() {
      const container = document.getElementById('asset-chart-container');
      if (!container) return;
      
      // Clear existing chart
      container.innerHTML = '';
      
      // Regenerate with new random data
      setTimeout(() => {
        this.createSampleChart();
      }, 300);
      
      console.log('AssetEmbed: Data refreshed');
    }
    
    destroy() {
      const container = document.querySelector(this.options.container);
      if (container) {
        container.innerHTML = '';
      }
      this.initialized = false;
      console.log('AssetEmbed: Destroyed');
    }
  }
  
  // Expose the library to the global scope
  window.AssetEmbed = AssetEmbed;
  
  // Auto-initialize when the page is ready
  document.addEventListener('DOMContentLoaded', () => {
    const embedder = new AssetEmbed({
      title: 'Asset Visualization',
      description: 'This visualization is provided by our embedded asset customization library.'
    });
    
    embedder.initialize();
    
    // Expose the instance for debugging
    window.assetEmbedInstance = embedder;
  });
})();
</script>
