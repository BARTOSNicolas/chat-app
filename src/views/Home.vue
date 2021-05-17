<template>
  <div class="chatting">
    <p class="message" v-for="(message, index) of messages" :key="index" :class="message.user === userName ? 'user' : 'other'"><span>{{ message.user }}</span> :<br> {{ message.msg }}</p>
    <v-progress-linear
        v-if="isWriting"
        class="write mb-4"
        color="indigo"
        buffer-value="0"
        stream
    ></v-progress-linear>
    <div class="input-text">
      <v-text-field
          hide-details
          v-model="inputMessage"
          label="Chatting"
          solo
          dense
      ></v-text-field>
      <v-btn
          color="blue-grey"
          class="ma-2 white--text"
          @click="sendMessage">
        Send
        <v-icon right dark>
          mdi-send
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import store from '../store/store'
import io from 'socket.io-client';
var socket = io.connect("http://192.168.1.87:3000");

  export default {
    name: 'Home',
    data: ()=>{
      return{
        inputMessage: null,
        isWriting: false,
        messages: []
      }
    },
    created() {
      this.realTimeData();
    },
    computed:{
      userName(){
        return store.state.userName
      }
    },
    watch:{
      inputMessage(){
        if(this.inputMessage && this.inputMessage.length === 1){
          socket.emit('isWriting', true);
        }
      }
    },
    methods:{
      realTimeData(){
        socket.on('chatMessage', data => {
          this.messages.push({
            user: data.user,
            msg: data.msg
          })
        });
        socket.on('isWriting', value =>{
          this.isWriting = value;
        })
      },
      sendMessage(){
        if(this.inputMessage){
          socket.emit('chatMessage', {user: this.userName ,msg: this.inputMessage});
          socket.emit('isWriting', false);
          this.inputMessage = null;
        }
      }
    }
  }
</script>
<style scoped lang="scss">
.chatting{
  height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  .input-text{
    display: flex;
    align-items: center;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background-color: indigo;
  }
  .message{
    align-self: flex-start;
    background-color: #607d8b;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    margin: 0;
    margin-bottom: 8px;
    span{
      font-weight: bold;
      text-transform: capitalize;
    }
    &.user{
      align-self: flex-end;
      background-color: indigo;
    }
  }
  .write{
    width: 30px;
  }
}

</style>
