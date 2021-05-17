<template>
  <v-app>
    <v-navigation-drawer
        app
        v-model="drawer"
        :mini-variant.sync="mini"
        permanent
    >
      <v-list-item class="px-1">
        <v-list-item-icon>
          <v-avatar color="indigo">
            <v-icon dark>
              mdi-account-circle
            </v-icon>
          </v-avatar>
        </v-list-item-icon>

        <v-list-item-title>{{ userName }}</v-list-item-title>

        <v-btn
            icon
            @click.stop="mini = !mini"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item

            v-for="(user, index) in users"
            :key="index">
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ user.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>

    </v-main>
    <v-dialog
        v-model="dialog"
        persistent
        max-width="310"
    >
      <v-card>
        <v-card-title class="headline">
          What's your nickname ?
        </v-card-title>
        <v-card-text>
          <v-text-field
              autocomplete="false"
              v-model="inputName"
              solo
              label="Enter your nickname here"
              :hint="alreadyUsed ? 'Nickname already in use' : '3 Letters min. - 25 Letters max.'"
              persistent-hint
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="green darken-1"
              text
              @click="createUser"
              :disabled="dialogDisabled"
          >
            Chatting
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
        v-model="snackbar"
        top right
        color="success"
        rounded
    >
      {{ snackText }}
    </v-snackbar>
  </v-app>
</template>

<script>
import store from './store/store';
import io from 'socket.io-client';
var socket = io.connect("http://192.168.1.87:3000");

export default {
  name: 'App',

  data () {
    return {
      inputName: "",
      dialogDisabled: true,
      alreadyUsed: false,
      drawer: true,
      users: [],
      mini: false,
      dialog: false,
      snackbar: false,
      snackText: ""
    }
  },
  created() {
    this.realTimeData();
  },
  mounted() {
    this.dialog = true;
  },
  watch:{
    inputName(val){
      if(val.length >= 3){
        this.dialogDisabled = false;
      }else{
        this.dialogDisabled = true;
      }
      if(val.length > 25){
        this.dialogDisabled = true;
      }
      this.users.forEach(user => {
        if(user.name.toLowerCase() == val.toLowerCase()){
          this.alreadyUsed = true;
          this.dialogDisabled = true;
        }
      })
    }
  },
  computed:{
    userName:{
      get(){
        return store.state.userName;
      },
      set(){
        store.state.userName = this.inputName.charAt(0).toUpperCase() + this.inputName.slice(1);
      }
    }
  },
  methods:{
    createUser(){
      this.userName = this.inputName;
      this.dialog = false;
      socket.emit('newUser', this.userName);
    },
    realTimeData(){
      socket.on('newUser', (users, user) => {
        this.users = users;
        this.snackText = user + " s'est join à la conversation";
        this.snackbar = true;
        setTimeout(()=>{
          this.snackbar = false;
        },2500)
      });
      socket.on('updateUser', users => {
        this.users = users;
      })
      socket.on('leaveUser', user => {
        this.snackText = user + " est parti(e) de la conversation";
        this.snackbar = true;
        setTimeout(()=>{
          this.snackbar = false;
        },2500)
      })
    },
  },
  beforeDestroy() {
    socket.emit('leaveUser', this.userName)
  }
};
</script>
<style scoped lang="scss">


</style>
