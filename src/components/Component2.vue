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
                        <p>{{ $t("OKTAMAM Group") }}<br> {{ $t("ChatBot") }}</p>
                    </div>
                    <div class="chat_close_icon" @click="toggleFloatingDiv">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </div>
                </div>
                <div class="Messenger_content">
                    <div class="Messages">
                        <div class="Messages_list Messages_list2" id="Messages_list">
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
                    <form id="messenger2" @submit="customSubmit">
                        <div class="Input Input-blank" :style="{ background: rgbaFromHex($settings.chat_color, 0.2) }">
                            <input name="msg2" v-model="question" class="Input_field" :placeholder="$t(`send_a_message`)">
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
        rgbaFromHex(hex, alpha) {
            // Remove the # character if it's present
            hex = hex.replace('#', '');
            // Parse the hex value into RGB components
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            // Return the RGBA value with the specified alpha
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        },

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
