import axios from "axios";
const CORS = "https://cors-anywhere.herokuapp.com/";
const OXFORD_ENDPOINT = "https://od-api.oxforddictionaries.com:443/api/v1/entries/en/";
// const URBAN_ENDPOINT = "https://mashape-community-urban-dictionary.p.mashape.com/define?term=";

export default {
  oxfordSingleWord: function(wordId) {
    return axios.get(`${CORS}${OXFORD_ENDPOINT}${wordId}`,{
      headers: {
        "Accept": "application/json",
        "app_id": process.env.VUE_APP_OXFORD_APP_ID,
        "app_key": process.env.VUE_APP_OXFORD_APP_KEY
      }
    });
  },
  oxfordSynonyms: function(wordId) {
    return axios.get(`${CORS}${OXFORD_ENDPOINT}${wordId}/synonyms`, {
      headers: {
        "Accept": "application/json",
        "app_id": process.env.VUE_APP_OXFORD_APP_ID,
        "app_key": process.env.VUE_APP_OXFORD_APP_KEY
      }
    });
  }
};