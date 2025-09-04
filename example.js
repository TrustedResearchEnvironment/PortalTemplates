/**
 * SimpleEmbed - A minimal asset customization library for embedding
 * Version 1.0.0
 */
(function() {
  // Define the library
  const SimpleEmbed = {
    /**
     * Initialize the library
     * @param {Object} options - Configuration options
     */
    init: function(options = {}) {
      console.log('SimpleEmbed: Library initialized with options:', options);
      
      // Replace the error message in the entity-page-embed container
      const container = document.getElementById('entity-page-embed');
      if (container) {
        this.updateContainer(container, options);
      } else {
        console.error('SimpleEmbed: Could not find container #entity-page-embed');
      }
      
      return this;
    },
    
    /**
     * Update the container with content
     * @param {HTMLElement} container - The container element
     * @param {Object} options - Configuration options
     */
    updateContainer: function(container, options) {
      console.log('SimpleEmbed: Updating container with content');
      
      // Clear the existing content
      container.innerHTML = '';
      
      // Create a simple card with information
      const card = document.createElement('div');
      card.className = 'card my-4';
      card.innerHTML = `
        <div class="card-header">
          <h4 class="mb-0">SimpleEmbed Asset</h4>
        </div>
        <div class="card-body">
          <p class="card-text">This is a simple embedded asset created by SimpleEmbed library.</p>
          <p class="card-text text-muted">Asset ID: ${options.assetId || 'Unknown'}</p>
          <button class="btn btn-primary" id="simpleEmbed-action">Perform Action</button>
        </div>
      `;
      
      // Append the card to the container
      container.appendChild(card);
      
      // Add event listener to the button
      setTimeout(() => {
        const actionButton = document.getElementById('simpleEmbed-action');
        if (actionButton) {
          actionButton.addEventListener('click', () => {
            console.log('SimpleEmbed: Action button clicked');
            alert('SimpleEmbed action performed!');
          });
        }
      }, 0);
    },
    
    /**
     * Load asset data
     * @param {string} assetId - The ID of the asset to load
     */
    loadAsset: function(assetId) {
      console.log('SimpleEmbed: Loading asset with ID:', assetId);
      
      // Simulate loading data
      setTimeout(() => {
        console.log('SimpleEmbed: Asset data loaded successfully');
        this.init({ assetId });
      }, 500);
      
      return this;
    },
    
    /**
     * Clean up resources
     */
    destroy: function() {
      console.log('SimpleEmbed: Cleaning up resources');
      
      // Remove any event listeners or clear intervals if needed
      const actionButton = document.getElementById('simpleEmbed-action');
      if (actionButton) {
        actionButton.removeEventListener('click', () => {});
      }
      
      return this;
    }
  };
  
  // Expose the library to the global scope
  window.SimpleEmbed = SimpleEmbed;
  
  // Log that the library is loaded
  console.log('SimpleEmbed: Library loaded and ready to use');
})();

// Example usage:
// SimpleEmbed.init({ assetId: '12345' });
