<template>
	<div class="word" 
		v-if="firstChar === letter" 
		@click="lookupItem(word.text)"
		:class="{ displayDef: showDef === true }"
	>
		{{ word.text }}
		<!-- <div class="delete-word" @click="deleteItem(word)">X</div> -->
	</div>
</template>

<script>
	import API from "../utils/API";

	export default {
		name: "lexicon-word",
		props: ['word','letter'],
		data() {
			return {
				firstChar: this.word.text.charAt(0),
				showDef: false,
				oxford_def: {},
				oxford_syn: {}
			}
		},
		methods: {
			deleteItem(word) {
				this.$emit('delete', word)
			},
			lookupItem(word) {
				// this.$emit('lookup', word);
				this.showDef = !this.showDef;

				API.oxfordSingleWord(word)
					.then(response => {
						// eslint-disable-next-line
						console.log('Definition:',{
							word: word,
							data: response.data,
							status: response.status,
							statusText: response.statusText
						});

						this.oxford_def = {
							word: word,
							data: response.data,
							status: response.status,
							statusText: response.statusText
						};
					})
					.catch(err => {
						if(err.response) {
							// eslint-disable-next-line
							console.log('Definition:', {
								word: word,
								data: err.response.data,
								status: err.response.status,
								statusText: err.response.statusText
							});

							this.oxford_def = {
								word: word,
								data: err.response.data,
								status: err.response.status,
								statusText: err.response.statusText
							};
						} else if (err.request) {
							// eslint-disable-next-line
							console.log('Definition (Request):', err.request);
						} else {
							// eslint-disable-next-line
							console.log('Definition (Error)',err.message);
						}
					});

				API.oxfordSynonyms(word)
					.then(response => {
						// eslint-disable-next-line
						console.log('Synonyms:',{
							word: word,
							data: response.data,
							status: response.status,
							statusText: response.statusText
						});

						this.oxford_syn = {
							word: word,
							data: response.data,
							status: response.status,
							statusText: response.statusText
						};
					})
					.catch(err => {
						if(err.response) {
							// eslint-disable-next-line
							console.log('Synonyms:', {
								word: word,
								data: err.response.data,
								status: err.response.status,
								statusText: err.response.statusText
							});

							this.oxford_syn = {
								word: word,
								data: err.response.data,
								status: err.response.status,
								statusText: err.response.statusText
							};
						} else if (err.request) {
							// eslint-disable-next-line
							console.log('Synonyms (Request):', err.request);
						} else {
							// eslint-disable-next-line
							console.log('Synonyms (Error)',err.message);
						}
					});
			}
		}
	}
</script>

<style>
	.word {
		position: relative;
    display: inline-block;
    border: 1px solid lightgrey;
		background-color: white;
		-webkit-box-shadow: 1px 1px 1px lightgrey;
    box-shadow: 1px 1px 1px lightgrey;
    border-radius: 10px;
    margin-top: 10px;
    margin-right: 10px;
    padding: 12px;
    overflow: hidden;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
	}

	.word:hover {
		box-shadow: 2px 2px 10px rgba(0,0,0,.3);
		background-color: #F2D680;
	}

	.word.displayDef {
		width: 500px;
		max-width: 80%;
		height: 200px;
		max-height: 80%;
	}

</style>
