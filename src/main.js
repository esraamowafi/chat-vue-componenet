import { createApp } from 'vue'
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

