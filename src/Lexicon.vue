<template>
  <div id="app">
    <div class="lexicon">
      <h1 class="lexicon-header">Add a Word to Your Lexicon</h1>
      <div class="word-count">{{ words.length }} words and counting...</div>
      <div class="lexicon-container">
        <input type="text" v-model="word" v-on:keyup.enter="addWord" />
        <div class="lexicon-content">
          <Letter v-for="letterEntry in letters_extended" 
            :key="letterEntry.letter"
            :letter="letterEntry.letter"
            :count="letterEntry.count"
            :group="letterEntry.group"
            :wordlist="wordsUnderLetter(letterEntry.letter)"
            :deleteWord="onDeleteWord" 
            :lookupWord="onLookupWord"
          />
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
          <div class="provider">{{ user.providerData[0].providerId === 'google.com' ? 'Google Account' : 'Account Info' }}</div>
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


  // eslint-disable-next-line
  let lastSignIn = null;
  // eslint-disable-next-line
  let lastSignOut = null;
  var unsubscribe;

  export default {
    name: 'lexicon',
    components: {
      Word,
      Letter
    },
    data() {
      return {
        words: [],
        letters: [
          'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
        ],
        letters_extended: [],
        word: '',
        user: null,
        showMenu: false
      }
    },

    mounted: function() {

      this.letters_extended = this.countWordsForLetter();
    
      if (auth.currentUser) {
        this.user = auth.currentUser;

        if(!localStorage.getItem('uid')) {
          localStorage.setItem('uid',auth.currentUser.uid);
        }

        if(this.words.length === 0) {
          this.fetchData(auth.currentUser.uid);
        }
      }

    },

    methods: {
      fetchData(userId) {
        unsubscribe = firestore.collection('users').doc(userId)
          .onSnapshot(doc => {
            this.words = doc.data().lexicon || [];
          });
      },
      addWord() {
        // validate word
        if (!this.word){
          alert("Please enter a word!");
          return;
        }

        const newWord = this.word.trim().toLowerCase();

        // TODO: Check database if word already exists
        if (this.words.map(w => w.text).includes(newWord)){
          this.word = '';
          return;
        }

        const timestamp = new Date().getTime();

        // Add words to session words list (if not signed in)
        this.words.push({ text: newWord, timestamp: timestamp });
        this.word = '';
        this.letters_extended = this.countWordsForLetter();

        // Add words to the Firebase Firestore
        if(auth.currentUser) {

          firestore.collection('users').doc(auth.currentUser.uid).set({
            lexicon: this.words
          }, { merge: true }).then(() => {
              // Word successfully added to lexicon
              this.letters_extended = this.countWordsForLetter();
            })
            .catch(() => {
              // Word not added to lexicon
            });

          this.fetchData(auth.currentUser.uid);
        }
      },
      onDeleteWord(word){
        
        // Remove word from session words list
        this.words = this.words.filter(w => w.text !== word) || [];
        this.letters_extended = this.countWordsForLetter();

        if(auth.currentUser) {
          firestore.collection('users').doc(auth.currentUser.uid).set({
            lexicon: this.words
          }, { merge: true})
          .then(() => {
            // eslint-disable-next-line
            // console.log('Successfully deleted: ' + word);
          })
          .catch(() => {
            // Error while deleting word
            // eslint-disable-next-line
            // console.log('Error while deleting: ' + word, error);
          });
        }
      },
      onLookupWord() {
        // Close any other words
        // eslint-disable-next-line
        // console.log(`Expanding "${word}"`);
      },
      wordsUnderLetter(letter) {
        return this.words.filter(w => w.text.charAt(0) === letter);
      },
      onSignIn() {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        // Sign in the user 
        auth.signInWithPopup(provider)
          .then(result => {
            this.user = result.user;

            const timestamp = new Date();

            // Populate list of words once signed in
            (result.user.uid) 
              ? this.fetchData(result.user.uid) 
              : this.words = [];

            // Add user sign up/sign in details in Firestore
            if(result.additionalUserInfo.isNewUser) {
              const userData = {
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                providerId: result.user.providerData[0].providerId,
                signUpDate: timestamp,
                lastSignIn: timestamp,
                lastSignOut: timestamp
              };

              firestore.collection('users').doc(result.user.uid)
                .set(userData, { merge: true })
                .then(() => {
                  localStorage.setItem('uid',result.user.uid);
                });
            } else {
              // Sign in an existing user
              firestore.collection('users').doc(result.user.uid)
                .set({ lastSignIn: timestamp }, { merge: true })
                .then(() => {
                  localStorage.setItem('uid',result.user.uid);
                });
            }
          })
          .catch(error => {
            // eslint-disable-next-line
            console.error(`Error: ${error.message}`);
          })
      },
      onSignOut() {
        unsubscribe();

        const timestamp = new Date();
        firestore.collection('users').doc(auth.currentUser.uid)
          .set({ lastSignOut: timestamp }, { merge: true }).then(() => {

          // reset variables
          this.user = null;
          this.showMenu = false;
          this.words = [];
          localStorage.removeItem('uid');

          // official signout
          auth.signOut();
        });
      },
      countWords(letter) {
        return this.words ? this.words.filter(w => w.text.charAt(0) === letter).length : 0;
      },
      countWordsForLetter() {
        const counts = this.letters.map(l => this.countWords(l)),
          min = Math.min(...counts),
          max = Math.max(...counts),
          increment = ((max - min) * .2).toFixed(0);

        let group = 'one';

        return this.letters.map((l, index) => {
          if (this.countWords(l) < (increment * 1)) {
            group = 'one';
          } else if (this.countWords(l) < (increment * 2)) {
            group = 'two';
          } else if (this.countWords(l) < (increment * 3)) {
            group = 'three';
          } else if (this.countWords(l) < (increment * 4)) {
            group = 'four';
          } else if (this.countWords(l) >= (increment * 4)) {
            group = 'five';
          }
          return {
            order: index,
            letter: l, 
            count: this.countWords(l),
            group: group
          }
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
    background-image: linear-gradient(#B1E6D1, #3D7B80);
    
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
    border-radius: 5px;
  }

  .lexicon-header {
    font-family: Bitter, serif;
    font-family: 'Crushed', cursive;
    color: black;
    font-weight: 400;
    text-transform: uppercase;
    margin: 70px auto 30px;
    user-select: none;
  }

  .lexicon-container {
    width: 90%;
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
    user-select: none;
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
    right: 80px;
    top: 5px;
  }

  .userDetails .provider {
    color: #fff;
    font-size: .75rem;
/*    text-transform: capitalize;*/
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
