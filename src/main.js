import { createApp, reactive } from 'vue';
import { createI18n } from 'vue-i18n';
import ChatWidget from './ChatWidget.vue'

// Import your translation files
import en from './locales/en.json';
import ar from './locales/ar.json';
import './assets/chat-widget.css';

const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {en, ar},
});
  
const app = createApp(ChatWidget)
app.use(i18n);
app.mount('#chat-widget-container')
const currentScript = document.currentScript;

if (currentScript) {
    let token = currentScript.getAttribute('data-token');
    console.log({"token xxxxx": token});
    fetch("http://chatbot.test/api/organizations/themes", {
        method: "POST",
        body: {
            "token": "some-randim-tokens"
        },
    }).then(response => {
        if (response.status === 442) {
            return response.json();
        } else if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the response body as JSON
    }).then(async (data) => {

        let response = data;
        console.log({response})
        const globalSettings = reactive(response);
          
          app.config.globalProperties.$settings = globalSettings;
          
    }).catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch error:', error);
    });

}


