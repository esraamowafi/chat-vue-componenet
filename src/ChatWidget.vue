<template>
    <button class="fab" @click="toggleFloatingDiv">Open</button>
    <div v-if="showFloatingDiv" class="floating-div">
        <div class="chat-container">
            <div class="chat-messages">
                <div v-for="(item, index) in messages" :key="index">
                    <div class="message user-message" v-if="item.role == 'user'">
                        <span v-html="item.message"></span>
                    </div>
                    <div class="message receiver-message" v-if="item.role != 'user'">
                        <span v-html="item.message"></span>
                    </div>
                </div>
            </div>
            <!-- Add more messages here -->

            <!-- Input field and send button -->
            <div class="input-container">
                <input type="text" class="message-input" @keyup.enter="sendQuestion" v-model="question"
                    placeholder="Type a message...">
                <button class="send-button" @click="sendQuestion">Send</button>
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
            showFloatingDiv: false
        }
    },
    methods: {
        async sendQuestion() {
            let question = this.question;
            this.question = "";
            this.messages.push({
                "role": "user",
                "message": question,
            });
            const data = new FormData();
            var chat_id = localStorage.getItem('chat_id');
            if (chat_id) {
                data.append("chat_id", chat_id)
            }
            data.append("query", question)
            fetch(
                "http://chatbot.test/api/message",
                {
                    method: "POST",
                    body: data,
                }
            ).then(response => {
                if (response.status === 442) {
                    return response.json();
                } else if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the response body as JSON
            })
                .then(async (data) => {
                    let response = data;
                    console.log({ response });
                    localStorage.setItem('chat_id', response.chat_id);
                    this.messages.push({
                        "role": "bot",
                        "message": response.answer,
                    });
                })
                .catch(error => {
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

<style scoped>
/* Chat container */

.chat-messages {
    height: 360px;
    overflow-y: scroll;
}

.chat-container {
    max-width: 400px;
    margin: 0 auto;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    background-color: #f9f9f9;
}

/* Chat message */
.message {
    background-color: #007bff;
    color: white;
    border-radius: 5px;
    padding: 8px 12px;
    margin-bottom: 10px;
    clear: both;
    max-width: 70%;
}

/* User message */
.user-message {
    float: right;
    background-color: #4CAF50;
}

/* Sender's name */
.sender-name {
    font-weight: bold;
    margin-right: 5px;
}

/* Receiver's name */
.receiver-name {
    font-weight: bold;
    margin-left: 5px;
}

/* Input field and send button */
.input-container {
    margin-top: 10px;
    clear: both;

}

.message-input {
    width: 70%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.send-button {
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 8px 12px;
    cursor: pointer;
}

.floating-div {
    position: fixed;
    bottom: 45px;
    right: 30px;
    /* transform: translate(-50%, -50%); */
    width: 360px; /* Set your desired width */
    margin: 10px;
    /* Add other styles as desired */
}

.fab{
    position: fixed;
    bottom: 30px;
    right: 30px;
}

</style>