# My Lexicon

## Purpose

My Lexicon is an educational app that lets users keep track of their personal lexicon. As users learn and add more words they can quickly view their growing lexicon through this tool.

--- 

## Getting Started:

1. Install the dependencies

`
$ npm install
`

2. Obtain an API key from [Oxford Dictionaries](https://developer.oxforddictionaries.com/)

3. Create a [Firebase Web app](https://console.firebase.google.com/).

4. Create a `.env` file in the root folder of your project and add the following:

```
VUE_APP_FIREBASE_API_KEY=[YOUR_FIREBASE_API_KEY]

VUE_APP_FIREBASE_DB_URL=[FIREBASE_PROJECT_URL]

VUE_APP_FIREBASE_DOMAIN=[FIREBASE_PROJECT_DOMAIN]

VUE_APP_FIREBASE_PROJECT_ID=[FIREBASE_PROJECT_ID]

VUE_APP_FIREBASE_SENDER_ID=[FIREBASE_SENDER_ID]

VUE_APP_FIREBASE_STORAGE=[FIREBASE_STORAGE]

VUE_APP_OXFORD_APP_ID=[YOUR_OXFORD_APP_ID]

VUE_APP_OXFORD_APP_KEY=[YOUR_OXFORD_API_KEY]
```

5. Run the app
`
$ npm run serve
`
