<template>

    <div class="botIcon chatbot style3" :style="{ color: $settings.font_family }" :class="showFloatingDiv ? 'showBotSubject': ''" id="show_style3">
        <div class="chatboticon3" @click="toggleFloatingDiv">
            <div  class="chatbot-dots" :style="{ borderColor: $settings.chat_color }">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <div class="chatbot-dots-corner" :style="{ borderTopColor: $settings.chat_color }"></div>
              <div id="antenna">
                <div id="beam"></div>
                <div id="beam-pulsar"></div>
              </div>
        </div>
        
        <div class="Layout Layout-open Layout-expand Layout-right messages-wrapper3">
            <div class="Messenger_messenger">
                <div class="messenger_header">
                    <div class="">
                        <img :src="$settings.company_logo" alt="" id="style3_logo">
                    </div>
                    <div class="chat_close_icon" @click="toggleFloatingDiv">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </div>
                </div>
                
                <div class="Messenger_content">
                    <div class="Messages">
                        <div class="Messages_list Messages_list3" id="Messages_list3">
                            <div v-for="(item, index) in messages" :key="index">
                                <div class="msg user" v-if="item.role == 'user'">
                                    <span class="avtr">
                                        <figure :style="{backgroundImage: url(userLogo)}"></figure>
                                    </span>
                                    <span class="responsText" v-html="item.message"></span>
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
                    <form id="messenger3" @submit="customSubmit">
                        <div class="Input Input-blank">
                            <input name="msg3" class="Input_field" placeholder="Send a message...">
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
    name: 'Component_3',
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
