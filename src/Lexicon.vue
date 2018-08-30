<template>
  <div id="app">
    <div class="lexicon">
      <h1 class="lexicon-header">Add Words to Your Lexicon</h1>
      <div class="word-count">{{ words.length }} words and counting...</div>
      <div class="lexicon-container">
        <input type="text" v-model="word" v-on:keyup.enter="addWord" />
        <div class="lexicon-content">
          <Letter v-for="letter in letters" 
            :letter="letter"
            :key="letter"
            :wordlist="wordsForLetter(letter)"
            :deleteWord="onDeleteWord" />
        </div>
      </div>
    </div>
    <div v-if="user === null">
      <div class="btn-signin" @click="onSignIn">Sign in</div>
    </div>
    <div class="signedIn" v-else>
      <div class="userPhoto-container">
        <img 
          class="userPhoto" 
          :src="user.photoURL" 
          :alt="user.displayName" 
          @click="showMenu = !showMenu"
        />
        <div class="userDetails">
          <div class="provider">{{ provider }}</div>
          <div class="displayName">{{ user.displayName }}</div>
          <div class="email">{{ user.email }}</div>
        </div>
      </div>
      <div v-if="showMenu" class="userMenu">
        <div class="btn-signout" @click="onSignOut">Sign Out</div>
      </div>
    </div>
  </div>
</template>

<script>
  import Word from './components/Word.vue';
  import Letter from './components/Letter.vue';
  import { firebase, auth, firestore } from './firebase';

  const sampleList = [
    { id: 1, text: 'clean' },
    { id: 2, text: 'the' },
    { id: 3, text: 'house' },
    { id: 4, text: 'buy' },
    { id: 5, text: 'milk' }];

  const local_fuid = localStorage.getItem('fuid');
  let isSignedIn = JSON.parse(localStorage.getItem('isSignedIn'));

  // Pulls the user's wordlist from the database
  const getWordList = (userId) => {
    let tempList = [];
    const usersCollection = firestore.collection('users');
    const lexDoc = usersCollection.doc(userId);
    lexDoc.collection('lexicon').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        // console.log(doc.id, " => ", {...doc.data(), id: doc.id});
        tempList.push({...doc.data(), id: doc.id});
      });
      // localStorage.setItem('wordList',tempList);
      return tempList;
    });
    return tempList;
  };

  export default {
    name: 'lexicon',
    components: {
      Word,
      Letter
    },
    data() {
      return {
        words: sampleList,
        letters: [
          'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
        ],
        word: '',
        user: auth.currentUser || null,
        token: null,
        showMenu: false,
        provider: '',
        fuid: localStorage.getItem('fuid') || null
      }
    },

    mounted: function() {
      if(local_fuid && isSignedIn && localStorage.getItem('userData') && this.user === null) {
        this.user = JSON.parse(localStorage.getItem('userData'));

        // TODO: pull list of words from cache to ease loading times
        this.words = getWordList(local_fuid);
      } else if (local_fuid && isSignedIn) {
        this.words = getWordList(local_fuid);
      } else {
        isSignedIn = false;
      }
    },

    methods: {
      addWord() {
        // validate word
        if (!this.word){
          alert("Please enter a word!");
          return;
        }

        // TODO: Check database if word already exists
        if (this.words.map(w => w.text).includes(this.word)){
          this.word = '';
          return;
        }

        const timestamp = new Date().getTime();

        // Add words to the Firebase Firestore
        if(this.fuid && this.user) {
          const usersCollection = firestore.collection('users');
          const lexDoc = usersCollection.doc(this.fuid);
          lexDoc.collection('lexicon').add({ id: timestamp, text: this.word.trim(), timestamp: timestamp })
            .then(doc => {

              // Update the word's id to match the DB's reference ID for the word
              this.words.filter(w => w.id === timestamp)[0].id = doc.id;
              // eslint-disable-next-line
              console.log('Word successfully added to Firebase lexicon:', doc.id);
            })
            .catch(error => {
              // eslint-disable-next-line
              console.log('Error while adding word to Firebase lexicon:',error.message);
            });
        }

        // Add words to session words list (if not signed in)
        this.words.push({ id: timestamp, text: this.word.trim() });
        this.word = '';
      },
      onDeleteWord(word){

        if(this.fuid && this.user) {
          const usersCollection = firestore.collection('users');
          const lexDoc = usersCollection.doc(this.fuid);
          lexDoc.collection('lexicon').doc(word.id).delete()
            .then(() => {
              // eslint-disable-next-line
              // console.log('Word successfully removed from Firebase lexicon:');
            })
            .catch(error => {
              // eslint-disable-next-line
              console.log('Error while removing from Firebase lexicon:',error.message);
            });
        }

        // Remove word from session words list
        this.words = this.words.filter(item => item !== word);
      },
      wordsForLetter(letter) {
        return this.words.filter(w => w.text.charAt(0) === letter);
      },
      onSignIn() {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        auth.signInWithPopup(provider)
          .then(result => {
            this.user = result.user;
            this.token = result.credential.accessToken;
            this.provider = 'Google Account';
            localStorage.setItem('isSignedIn', true);
            localStorage.setItem('userData',JSON.stringify(result.user));

            // Create Firebase lexicon for the user if none exists
            if(!localStorage.getItem('fuid') && !this.fuid) {
              const usersCollection = firestore.collection('users');
              usersCollection.add({
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                providerId: result.user.providerData[0].providerId,
                uid: result.user.uid
              }).then(docRef => {
                // record firebase userId 
                this.fuid = docRef.id;
                localStorage.setItem('fuid',docRef.id);

                (this.fuid) ? this.words = getWordList(this.fuid) : this.words = sampleList;
              });
              return;
            }

            // Populate list of words once signed in
            (localStorage.getItem('fuid')) ? this.words = getWordList(localStorage.getItem('fuid')) : this.words = sampleList;

          })
          .catch(error => {
            // eslint-disable-next-line
            console.error(`Error: ${error.message}`);
          })
      },
      onSignOut() {
        auth.signOut().then(() => {
          this.user = null;
          this.token = null;
          this.showMenu = false;
          this.fuid = null;
          this.provider = '';
          localStorage.setItem('isSignedIn', false);
          this.words = sampleList;
        });
      }
    }
  }
</script>

<style>
  body {
    margin: 0;
    padding: 0;
    font-family: Bitter, serif;
    background: linear-gradient(#aeffae, #3d99ff);
    height: auto;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .lexicon {
    text-align: center;
    border: 1px solid white;
    width: 80vw;
    height: auto;
    box-shadow: 2px 3px 15px rgba(0,0,0,0.5);
    background: #f6f6f6;
    padding-bottom: 60px;
    margin: 50px auto;
  }

  .lexicon-header {
    color: black;
    font-family: Bitter, serif;
    font-weight: 400;
    text-transform: uppercase;
    margin: 70px auto 30px;
  }

  .lexicon-container {
    width: 80%;
    margin: 0 auto;
  }

  input {
    width: 60%;
    padding: 10px;
    font-size: 1em;
    margin: 10px auto;
    box-shadow: 1px 3px 20px 0px rgba(0,0,0,0.3);
    border-radius: 5px;
    outline: 0;
  }

  .word-count {
    margin: -25px 0 0;
    color: #888;
  }

  .btn-signin {
    position: fixed;
    right: 5px;
    top: 5px;
    cursor: pointer;
    padding: 10px;
    border-radius: 5px;
    background-color: orangered;
    color: #fff;
    box-shadow: 2px 2px 10px rgba(0,0,0,0.3);
  }
  .btn-signin:hover {
    box-shadow: none;
    background-color: #fff;
    color: orangered;
    border: 2px solid orangered;
  }

  .btn-signout {
    cursor: pointer;
  }

  .signedIn {
    position: fixed;
    right: 5px;
    top: 5px;
  }

  .userPhoto-container {
    text-align: right;
    position: relative;
  }

  .userPhoto-container .userPhoto {
    width: 50px;
    border-radius: 50%;
    text-align: center;
    cursor: pointer;
  }

  .userPhoto-container .userPhoto:hover + .userDetails {
    visibility: visible;
  }

  .userDetails {
    visibility: hidden;
    padding: 10px;
    background-color: rgba(0,0,0,.6);
    background-color: rgba(60,64,67,0.90);
    border-radius: 10px;
    text-align: left;
    font: 500 12px 'Roboto', arial, sans-serif;
    letter-spacing: .8px;
    transition: visibility 1s 500ms ease;
    position: absolute;
    right: 5px;
  }

  .userDetails .provider {
    color: #fff;
    font-size: .75rem;
    text-transform: capitalize;
  }

  .userDetails .displayName,
  .userDetails .email {
    color: #bdc1c6;
    line-height: 16px;
    font-size: .75rem;
  }

  .userMenu {
    display: flex;
    flex-flow: column;
    background-color: #ddd;
    border: 1px solid #aaa;
    border-radius: 5px;
    padding: 5px;
    font-size: .875rem;
    user-select: none;
  }

  .lexicon-content {
    display: flex;
    flex-flow: row wrap;
  }
  
</style>
