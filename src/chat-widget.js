(function () {
    // Load Vue.js from a CDN if it's not already loaded
    if (!window.Vue) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/vue';
      script.defer = true;
      document.head.appendChild(script);
    }
  
    script.onload = function () {
      // Wait for Vue.js to load, then create and mount the chat widget
      var app = new Vue({
        render: function (h) {
          return h(window.ChatWidget);
        },
      });
  
      app.$mount('#chat-widget-container');
    };
  })();
  