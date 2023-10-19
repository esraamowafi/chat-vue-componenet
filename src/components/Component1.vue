<template>

    <div class="botIcon chatbot style1 " :style="{ color: $settings.font_family }" :class="showFloatingDiv ? 'showBotSubject': ''" id="show_style1">
        <div class="botIconContainer" @click="toggleFloatingDiv">
            <div class="iconInner" :style="{ background: $settings.chat_color }">
                <img :src="$settings.logo" id="style1_logo">
            </div>
            <h1>{{ $t("Chat Now") }}</h1>
        </div>
        <div class="Layout Layout-open Layout-expand Layout-right">
            <div class="Messenger_messenger">
                <div class="curve">
                    <div class="curve-before" :style="{ background: $settings.chat_color }"></div>
                    <div class="header-title">
                        <div class="icon_fullscreen">
                            <a href="#">
                                <i class="fa-solid fa-expand" aria-hidden="true"></i>
                            </a>
                        </div>
                        <div class="chat_close_icon" @click="toggleFloatingDiv">
                            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        </div>
                    </div>
                    <div class="name">
                        <h5>{{ $t("OKTAMAM Group") }}</h5>
                        <h6>{{ $t("ChatBot") }}</h6>
                    </div>
                </div>
                <div class="Messenger_content">
                    <div class="Messages">
                        <div class="Messages_list" id="Messages_list">
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
                    <form id="messenger" @submit="customSubmit">
                        <div class="Input Input-blank">
                            <input type="text" name="msg" v-model="question" class="Input_field" 
                            :placeholder="$t(`send_a_message`)" />
                            <button type="submit" class="Input_button Input_button-send">
                                <div class="Icon">
                                    <i :style="{ color: $settings.chat_color }" class="fa fa-paper-plane"></i>
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
    name: 'Component_1',
    data() {
        return {
            messages: [],
            question: "",
            showFloatingDiv: false,
            token: "62b99eba-d88e-4653-990c-b4e9645f754f",
            chatId: false,
            loading: false,
        }
    },
    mounted() {
        const currentScript = document.currentScript;
        if (currentScript) {
            this.token = currentScript.getAttribute('data-token');
        }
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
