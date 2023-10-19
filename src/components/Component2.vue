<template>

    <div class="botIcon chatbot style2" :style="{ color: $settings.font_family }" :class="showFloatingDiv ? 'showBotSubject': ''" id="show_style2">
        <div class="chatboticon2" @click="toggleFloatingDiv">
            <div class="bot-icon">
                <svg :fill="$settings.chat_color" width="60px" height="60px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.928 11.607c-.202-.488-.635-.605-.928-.633V8c0-1.103-.897-2-2-2h-6V4.61c.305-.274.5-.668.5-1.11a1.5 1.5 0 0 0-3 0c0 .442.195.836.5 1.11V6H5c-1.103 0-2 .897-2 2v2.997l-.082.006A1 1 0 0 0 1.99 12v2a1 1 0 0 0 1 1H3v5c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2v-5a1 1 0 0 0 1-1v-1.938a1.006 1.006 0 0 0-.072-.455zM5 20V8h14l.001 3.996L19 12v2l.001.005.001 5.995H5z"/><ellipse cx="8.5" cy="12" rx="1.5" ry="2"/><ellipse cx="15.5" cy="12" rx="1.5" ry="2"/><path d="M8 16h8v2H8z"/></svg>
            </div>
        </div>
        
        <div class="Layout Layout-open Layout-expand Layout-right messages-wrapper2">
            <div class="Messenger_messenger" :style="{ background: $settings.chat_color }">
                <div class="layout-header2">
                    <div class="title">
                        <img :src="$settings.logo" alt="" id="style2_logo">
                        <p>OKTAMAM Group<br> ChatBot</p>
                    </div>
                    <div class="chat_close_icon" @click="toggleFloatingDiv">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="Messenger_content">
                    <div class="Messages">
                        <div class="Messages_list Messages_list2" id="Messages_list2">
                            <div v-for="(item, index) in messages" :key="index">
                                <div class="msg user" v-if="item.role == 'user'">
                                    <span class="avtr">
                                        <figure :style="{backgroundImage: url(userLogo)}"></figure>
                                    </span>
                                    <span class="responsText" v-html="item.message" :style="{ color: $settings.text_color, background: $settings.chat_color }"></span>
                                </div>
                                <div class="msg" v-if="item.role != 'user'">
                                    <span class="avtr">
                                        <figure :style="{backgroundImage: url(botLogo)}"></figure>
                                    </span>
                                    <span class="responsText" v-html="item.message"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form id="messenger2" @submit="customSubmit">
                        <div class="Input Input-blank">
                            <input name="msg2" class="Input_field" placeholder="Send a message...">
                            <button type="submit" class="Input_button Input_button-send">
                                <div class="Icon">
                                    <i class="fa fa-paper-plane" :style="{ color: $settings.chat_color }"></i>
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

</template>

<script>

export default {
    name: 'Component_2',
    data() {
        return {
            messages: [],
            question: "",
            showFloatingDiv: false,
            token: "",
            player: "",
            chatId: false,
            loading: false,
            // siteLanguage: 'en',
            userLogo: "images/chatuser.png",
            botLogo: "images/chatbot-icon.png",
        }
    },
    mounted() {
        // const currentScript = document.currentScript;
        // if (currentScript) {
        //     this.token = currentScript.getAttribute('data-token');
        //     this.player = currentScript.getAttribute('data-player');
        //     var lang = currentScript.getAttribute('data-lang');
        //     if(lang){
        //         this.siteLanguage = lang;
        //     }
        // } else {
        //     this.siteLanguage = navigator.language.split('-')[0]
        // }
        // this.$i18n.locale = this.siteLanguage;
    },
    methods: {
        customSubmit(event) {
            // Prevent the default form submission behavior
            event.preventDefault();
            this.sendQuestion();
        },

        async sendQuestion() {
            let question = this.question;
            if(this.loading || !question){
                return;
            }
            this.question = "";
            this.messages.push({
                "role": "user",
                "message": question,
            });
            this.messages.push({
                "role": "bot",
                "loading": true,
            });
            const chatMessagesDiv = document.getElementById("chat-messages")
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;

            const data = new FormData();
            if (this.chatId) {
                data.append("chat_id", this.chatId)
            }
            data.append("query", question)
            this.loading = true;
            fetch("http://chatbot.test/api/message", {
                method: "POST",
                body: data,
            }).then(response => {
                this.loading = false;
                if (response.status === 442) {
                    return response.json();
                } else if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response body as JSON
            }).then(async (data) => {
                let response = data;
                this.chatId = response.chat_id;

                this.messages.pop();
                this.messages.push({
                    "role": "bot",
                    "message": response.answer,
                });
                chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
            }).catch(error => {
                this.messages.pop();
                // Handle any errors that occurred during the fetch
                console.error('Fetch error:', error);
            });
        },
        toggleFloatingDiv() {
            this.showFloatingDiv = !this.showFloatingDiv;
        }
    },
}

</script>
