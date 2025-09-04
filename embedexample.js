/**
 * AssetEmbed - A customization library for embedding media assets
 * Version 1.0.0
 * 
 * This library enables features such as embedding videos, images, and other media
 * with customization options for appearance and behavior.
 */
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.AssetEmbed = factory());
}(this, function() {
  'use strict';
  
  /**
   * Main AssetEmbed class
   */
  class AssetEmbed {
    constructor(options = {}) {
      this.options = {
        responsive: true,
        autoplay: false,
        loop: false,
        muted: false,
        controls: true,
        theme: 'light',
        ...options
      };
      
      this.version = '1.0.0';
      this.containers = [];
    }
    
    /**
     * Initialize embedding on a specific container
     * @param {string|HTMLElement} container - The container element or selector
     * @param {string} assetUrl - URL to the asset to embed
     * @param {Object} options - Embedding options for this specific container
     */
    embed(container, assetUrl, options = {}) {
      // Merge global options with container-specific options
      const containerOptions = {
        ...this.options,
        ...options
      };
      
      // Get container element
      const containerEl = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
        
      if (!containerEl) {
        console.error('AssetEmbed: Container not found', container);
        return null;
      }
      
      // Determine asset type from URL
      const assetType = this._getAssetType(assetUrl);
      
      // Create appropriate embed element based on asset type
      let embedElement;
      
      switch(assetType) {
        case 'video':
          embedElement = this._createVideoEmbed(assetUrl, containerOptions);
          break;
        case 'image':
          embedElement = this._createImageEmbed(assetUrl, containerOptions);
          break;
        case 'audio':
          embedElement = this._createAudioEmbed(assetUrl, containerOptions);
          break;
        case 'iframe':
          embedElement = this._createIframeEmbed(assetUrl, containerOptions);
          break;
        default:
          console.error('AssetEmbed: Unsupported asset type', assetType);
          return null;
      }
      
      // Clear container and append the new embed element
      containerEl.innerHTML = '';
      containerEl.appendChild(embedElement);
      
      // Store reference to this container
      this.containers.push({
        element: containerEl,
        embedElement,
        options: containerOptions,
        assetUrl
      });
      
      // Apply theme
      this._applyTheme(containerEl, containerOptions.theme);
      
      // Return the embed element for further customization
      return embedElement;
    }
    
    /**
     * Determine asset type from URL
     * @private
     */
    _getAssetType(url) {
      const extension = url.split('.').pop().toLowerCase();
      
      const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
      const audioExtensions = ['mp3', 'wav', 'ogg', 'aac'];
      
      if (videoExtensions.includes(extension)) return 'video';
      if (imageExtensions.includes(extension)) return 'image';
      if (audioExtensions.includes(extension)) return 'audio';
      
      // Check if it's a known embedding service
      if (url.includes('youtube.com') || url.includes('youtu.be')) return 'iframe';
      if (url.includes('vimeo.com')) return 'iframe';
      if (url.includes('spotify.com')) return 'iframe';
      
      // Default to iframe for unknown types
      return 'iframe';
    }
    
    /**
     * Create video embedding element
     * @private
     */
    _createVideoEmbed(url, options) {
      const video = document.createElement('video');
      video.src = url;
      video.controls = options.controls;
      video.autoplay = options.autoplay;
      video.loop = options.loop;
      video.muted = options.muted;
      
      if (options.responsive) {
        video.style.width = '100%';
        video.style.height = 'auto';
      }
      
      return video;
    }
    
    /**
     * Create image embedding element
     * @private
     */
    _createImageEmbed(url, options) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = options.alt || 'Embedded image';
      
      if (options.responsive) {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
      
      return img;
    }
    
    /**
     * Create audio embedding element
     * @private
     */
    _createAudioEmbed(url, options) {
      const audio = document.createElement('audio');
      audio.src = url;
      audio.controls = options.controls;
      audio.autoplay = options.autoplay;
      audio.loop = options.loop;
      
      if (options.responsive) {
        audio.style.width = '100%';
      }
      
      return audio;
    }
    
    /**
     * Create iframe embedding element
     * @private
     */
    _createIframeEmbed(url, options) {
      // Process URL for known services
      let embedUrl = url;
      
      // YouTube URL processing
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('/').pop()
          : new URL(url).searchParams.get('v');
          
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${options.autoplay ? 1 : 0}&controls=${options.controls ? 1 : 0}&loop=${options.loop ? 1 : 0}&mute=${options.muted ? 1 : 0}`;
      }
      
      // Vimeo URL processing
      if (url.includes('vimeo.com')) {
        const videoId = url.split('/').pop();
        embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=${options.autoplay ? 1 : 0}&loop=${options.loop ? 1 : 0}&muted=${options.muted ? 1 : 0}`;
      }
      
      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      
      if (options.responsive) {
        iframe.style.width = '100%';
        iframe.style.height = options.height || '315px';
      } else {
        iframe.style.width = options.width || '560px';
        iframe.style.height = options.height || '315px';
      }
      
      return iframe;
    }
    
    /**
     * Apply theme to container
     * @private
     */
    _applyTheme(container, theme) {
      container.classList.add(`asset-embed-theme-${theme}`);
      
      // Add theme-specific styles
      if (theme === 'dark') {
        container.style.backgroundColor = '#222';
        container.style.color = '#fff';
        container.style.padding = '10px';
      } else if (theme === 'light') {
        container.style.backgroundColor = '#f8f8f8';
        container.style.color = '#333';
        container.style.padding = '10px';
      }
    }
    
    /**
     * Destroy all embeddings
     */
    destroy() {
      this.containers.forEach(container => {
        container.element.innerHTML = '';
      });
      this.containers = [];
    }
  }
  
  // Add CSS for themes
  const style = document.createElement('style');
  style.textContent = `
    .asset-embed-theme-light {
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .asset-embed-theme-dark {
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }
  `;
  document.head.appendChild(style);
  
  return AssetEmbed;
}));
