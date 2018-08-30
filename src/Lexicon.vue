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
          <div class="provider">{{ user.providerData[0].providerId === 'google.com' ? 'Google Account' : '' }}</div>
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

  let lastSignIn = null;
  let lastSignOut = null;

  // Pulls the user's wordlist from the database
  const getWordList = (userId) => {
    let tempList = [];
    console.log('getWordList');
    firestore.collection('users').doc(userId).collection('lexicon').get()
      .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        // Update the local list item to use the DB's doc number
        // console.log(doc.id, " => ", {...doc.data(), id: doc.id});
        tempList.push({...doc.data(), id: doc.id});
      });
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
        words: [],
        letters: [
          'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
        ],
        word: '',
        user: null,
        showMenu: false
      }
    },

    mounted: function() {
      const refresh = setInterval(() => {
        if(!this.user) {
          this.user = auth.currentUser;
        }

        if (auth.currentUser) {
          if(!localStorage.getItem('uid')) {
            localStorage.setItem('uid',auth.currentUser.uid);
          }

          if(this.words.length === 0) {
            this.words = getWordList(auth.currentUser.uid);
          }
        }
      }, 500);

      // Subscribe to updates from other devices/instances
      if(auth.currentUser) {
        firestore.collection('users').doc(auth.currentUser.uid)
          .onSnapshot(doc => {
            // console.log(doc.data());
            lastSignIn = doc.data().lastSignIn;
            lastSignOut = doc.data().lastSignOut;
          });

        firestore.collection('users').doc(auth.currentUser.uid).collection('lexicon')
          .onSnapshot(lexCollection => {
            let tempList = [];
            lexCollection.docs.forEach(doc => {
              doc.ref.get().then(docItem => {
                // console.log(docItem.data());
                tempList.push(docItem.data());
              });
            })

            if(tempList) {
              console.log('Word Count:',tempList.length);
              this.words = tempList;
            }

          })
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
        if(auth.currentUser) {
          firestore.collection('users').doc(auth.currentUser.uid).collection('lexicon')
            .add({ 
              id: timestamp, 
              text: this.word.trim(), 
              timestamp: timestamp 
            })
            .then(doc => {
              // Update the word's id to match the DB's reference ID for the word
              this.words.filter(w => w.id === timestamp)[0].id = doc.id;
              // eslint-disable-next-line
              // console.log('Word successfully added to Firebase lexicon:', doc.id);
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

        if(auth.currentUser) {
          firestore.collection('users').doc(auth.currentUser.uid).collection('lexicon')
            .doc(word.id).delete()
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

        // Sign in the user 
        auth.signInWithPopup(provider)
          .then(result => {
            this.user = result.user;

            const timestamp = new Date();

            // Populate list of words once signed in
            (result.user.uid) 
              ? this.words = getWordList(result.user.uid) 
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
                .set(userData, { merge: true }).then(() => {
                localStorage.setItem('uid',result.user.uid);
              });
            } else {
              // Create a new user in Firestore
              const userData = { lastSignIn: timestamp };

              firestore.collection('users').doc(result.user.uid)
                .set(userData, { merge: true }).then(() => {
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
        const timestamp = new Date();

        const userData = { lastSignOut: timestamp };

        firestore.collection('users').doc(this.user.uid)
          .set(userData, { merge: true }).then(() => {

          // reset variables
          this.user = null;
          this.showMenu = false;
          this.words = [];
          localStorage.removeItem('uid');

          // official signout
          auth.signOut();
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
    right: 5px;
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
