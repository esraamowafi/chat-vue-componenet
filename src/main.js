import { createApp } from 'vue'
import ChatWidget from './ChatWidget.vue'

window.ChatWidget = ChatWidget;

createApp(ChatWidget).mount('#chat-widget-container')
