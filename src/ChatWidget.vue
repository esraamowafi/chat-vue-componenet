<template>
    <div class="fab-container">
        <button @click="toggleFloatingDiv" class="fab">
            <svg height="32px" width="32px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 58 58" xml:space="preserve">
                <g>
                    <path style="fill:#0391FD;"
                        d="M25,9.586C11.193,9.586,0,19.621,0,32c0,4.562,1.524,8.803,4.135,12.343
                        C3.792,48.433,2.805,54.194,0,57c0,0,8.47-1.191,14.273-4.651c0.006-0.004,0.009-0.01,0.014-0.013
                        c1.794-1.106,3.809-2.397,4.302-2.783c0.301-0.417,0.879-0.543,1.328-0.271c0.298,0.181,0.487,0.512,0.488,0.86
                        c0.003,0.582-0.008,0.744-3.651,3.018c2.582,0.81,5.355,1.254,8.245,1.254c13.807,0,25-10.035,25-22.414S38.807,9.586,25,9.586z" />
                    <path style="fill:#0F71D3;" d="M58,23.414C58,11.035,46.807,1,33,1c-9.97,0-18.575,5.234-22.589,12.804
                        C14.518,11.153,19.553,9.586,25,9.586c13.807,0,25,10.035,25,22.414c0,4.735-1.642,9.124-4.437,12.743
                        C51.162,47.448,58,48.414,58,48.414c-2.805-2.805-3.792-8.566-4.135-12.657C56.476,32.217,58,27.976,58,23.414z" />
                    <path style="fill:#FFFFFF;"
                        d="M32.5,26h-14c-0.552,0-1-0.447-1-1s0.448-1,1-1h14c0.552,0,1,0.447,1,1S33.052,26,32.5,26z" />
                    <path style="fill:#FFFFFF;"
                        d="M38,33H13c-0.552,0-1-0.447-1-1s0.448-1,1-1h25c0.552,0,1,0.447,1,1S38.552,33,38,33z" />
                    <path style="fill:#FFFFFF;"
                        d="M38,40H13c-0.552,0-1-0.447-1-1s0.448-1,1-1h25c0.552,0,1,0.447,1,1S38.552,40,38,40z" />
                </g>
            </svg>
        </button>
        <div v-if="showFloatingDiv" class="hidden-content" id="hiddenContent">
            <div class="close-container">
                <button @click="toggleFloatingDiv" class="close-btn" id="closeBtn">×</button>
            </div>
            <div class="chat-container"> 
                <div class="chat-messages" id="chat-messages">
                    <div v-for="(item, index) in messages" :key="index">
                        <div class="message user-message" v-if="item.role == 'user'">
                            <span v-html="item.message"></span>
                        </div>
                        <div class="message receiver-message" v-if="item.role != 'user'">
                            <span v-if="item.loading" class="animate-pulse text-gray-600 text-sm">{{ $t("typing") }}...</span>
                            <span v-else v-html="item.message"></span>
                        </div>
                        
                    </div>
                </div>
                <!-- Add more messages here -->

                <!-- Input field and send button -->
                <div class="input-container">
                    <input type="text" class="message-input" @keyup.enter="sendQuestion" v-model="question"
                    :placeholder="$t(`type_a_message`)">
                    <span id="spacer-span"></span>
                    <button class="send-button" @click="sendQuestion">
                        <span v-if="loading" class="loading">
                            <span style="background-color: #fff;"></span>
                            <span style="background-color: #fff;"></span>
                            <span style="background-color: #fff;"></span>
                        </span>
                        <span v-else>{{ $t("send") }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ChatWidget',
    data() {
        return {
            messages: [],
            question: "",
            showFloatingDiv: false,
            token: "",
            player: "",
            chatId: false,
            loading: false,
            siteLanguage: 'ar',
        }
    },
    mounted() {
        const currentScript = document.currentScript;
        if (currentScript) {
            this.token = currentScript.getAttribute('data-token');
            this.player = currentScript.getAttribute('data-player');
            var lang = currentScript.getAttribute('data-lang');
            if(lang){
                this.siteLanguage = lang;
            }
        } else {
            this.siteLanguage = navigator.language.split('-')[0]
        }
        this.$i18n.locale = this.siteLanguage;
        console.log({"token": this.token});
        console.log({"player": this.player});
    },
    methods: {
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
