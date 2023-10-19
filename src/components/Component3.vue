<template>

    <div class="botIcon chatbot style3" :style="{ color: $settings.font_family }" :class="showFloatingDiv ? 'showBotSubject': ''" id="show_style3">
        <div class="chatboticon3" @click="toggleFloatingDiv">
            <div  class="chatbot-dots" :style="{ borderColor: $settings.chat_color }">
                <div class="dot" :style="{ background: $settings.chat_color }"></div>
                <div class="dot" :style="{ background: $settings.chat_color }"></div>
                <div class="dot" :style="{ background: $settings.chat_color }"></div>
            </div>
            <div class="chatbot-dots-corner" :style="{ borderTopColor: $settings.chat_color }"></div>
            <div id="antenna" :style="{ background: $settings.chat_color }">
                <div id="beam" :style="{ background: $settings.chat_color }"></div>
                <div id="beam-pulsar" :style="{ background: $settings.chat_color }"></div>
            </div>
        </div>
        
        <div class="Layout Layout-open Layout-expand Layout-right messages-wrapper3">
            <div class="Messenger_messenger">
                <div class="messenger_header" :style="{ background: $settings.chat_color }">
                    <div class="">
                        <img :src="$settings.logo" alt="" id="style3_logo">
                    </div>
                    <div class="chat_close_icon" @click="toggleFloatingDiv">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </div>
                </div>
                
                <div class="Messenger_content">
                    <div class="Messages">
                        <div class="Messages_list Messages_list3" id="Messages_list">
                            <div v-for="(item, index) in messages" :key="index">
                                <div class="msg user" v-if="item.role == 'user'">
                                    <span class="avtr">
                                        <img :src="$settings.user_icon">
                                    </span>
                                    <span class="responsText" v-html="item.message" :style="{ color: $settings.text_color, background: $settings.chat_color }"></span>
                                </div>
                                <div class="msg" v-if="item.role != 'user'">
                                    <span class="avtr">
                                        <img :src="$settings.bot_icon">
                                    </span>
                                    <span class="responsText">
                                        <span v-if="item.message.trim() === ''">{{ $t("typing") }}...</span>
                                        <span v-else v-html="item.message"></span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form id="messenger3" @submit="customSubmit">
                        <div class="Input Input-blank">
                            <input name="msg3" v-model="question" class="Input_field" :placeholder="$t(`send_a_message`)">
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
            chatId: false,
            loading: false,
        }
    },
    mounted() {
        this.token = this.$settings.token;
        if(this.$settings.has_initial_message){
            this.messages.push({
                "role": "bot",
                "message": this.$settings.initial_message,
            });
        }
    },
    methods: {
        customSubmit(event) {
            // Prevent the default form submission behavior
            event.preventDefault();
            this.sendQuestion();
        },
        tryJSON(str) {
            try {
                return JSON.parse(str);
            } catch (e) {
                return null;
            }
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
                "message": "",
            });
            const chatMessagesDiv = document.getElementById("Messages_list")
            chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
            this.loading = true;

            const body = {
                question: question,
            };
            if(this.chatId){
                body.chat_id = this.chatId;
            }
            fetch("https://chat.oktamam.info/api/organization/message/"+this.token, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                method: "POST",
                body: JSON.stringify(body),
            })
            .then(async (res) => {
                this.loading = false;
                if (!res.ok) {
                    this.messages[this.messages.length - 1].message = "Internal error occur in the system";
                    return;
                }
                const reader = res.body.getReader();
                const decoder = new TextDecoder();

                let response = null;
                let loop = true;
                while (loop) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    let text = decoder.decode(value, { stream: true });
                    if(text.endsWith('JSON_RESPONSE')){
                        response = this.tryJSON(text.replace('JSON_RESPONSE', ''));
                    }else{
                        this.messages[this.messages.length - 1].message += text
                        const msgsDiv = document.getElementById("Messages_list")
                        msgsDiv.scrollTop = msgsDiv.scrollHeight;
                    }
                }
                if(response && response.status){
                    this.chatId = response.chat_id;
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
        },
        toggleFloatingDiv() {
            this.showFloatingDiv = !this.showFloatingDiv;
        }
    },
}

</script>