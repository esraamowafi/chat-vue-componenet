import { createApp, reactive } from 'vue';
import { createI18n } from 'vue-i18n';
import ChatWidget from './ChatWidget.vue'

import Component1 from './components/Component1.vue'
import Component2 from './components/Component2.vue'
import Component3 from './components/Component3.vue'

// Import your translation files
import en from './locales/en.json';
import ar from './locales/ar.json';
import './assets/chat-widget.css';

  
const currentScript = document.currentScript;
let siteLanguage = "en";
if (currentScript) {
    var lang = currentScript.getAttribute('data-lang');
    if(lang){
        siteLanguage = lang;
    }
} else {
    siteLanguage = navigator.language.split('-')[0]
}
// this.$i18n.locale = siteLanguage;
const i18n = createI18n({
    locale: siteLanguage,
    fallbackLocale: 'en',
    messages: {en, ar},
});

if (currentScript) {
    let token = currentScript.getAttribute('data-token');
    // TODO: Remove this in production.
    if(!token){
        token = "97167317-6334-4feb-990c-ce9daf96df30";
    }
    fetch("http://chatbot.test/api/organization/themes/"+token, {
        method: "GET",
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
        // Attach the code to 
        if(response.status && response.component.chatbot_type == "chat_bubble"){
            let component = response.component;
            const globalSettings = reactive(component);
            let type = Component1;
            if(component.chat_style == "style1"){
                type = Component1;
            } else if(component.chat_style == "style2") {
                type = Component2;
            } else if(component.chat_style == "style3") {
                type = Component3;
            }
            console.log("chat_bubble")

            var customId = "chat-bubble-container";
            var chat_bubble = document.createElement("div");
            chat_bubble.id = customId;
            document.body.appendChild(chat_bubble);

            const app = createApp(type)
            app.config.globalProperties.$settings = globalSettings;
            app.use(i18n);
            app.mount('#'+customId)
        }
    }).catch(error => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch error:', error);
    });

}


