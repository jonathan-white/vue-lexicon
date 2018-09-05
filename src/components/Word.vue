<template>
	<div class="word" 
		v-if="firstChar === letter" 
		:class="{ displayDef: showDef === true }"
	>
		<div class="word-title">{{ word.text }}</div>
		<div class="word-content" v-if="oxford_def.status">
			<div v-if="oxford_def.status === 200">
				<div 
					v-for="lexicalEntry in oxford_def.data.results[0].lexicalEntries"
					:key="lexicalEntry.lexicalCategory"
				>
					<h6>{{lexicalEntry.lexicalCategory}}</h6>
					<ol class="resultsList" v-for="entry in lexicalEntry.entries" :key="entry">
						<li v-for="sense in entry.senses" v-bind:key="sense.id">{{sense.definitions[0]}}</li>
					</ol>
				</div>
			</div>
			<div class="word-content loading" v-else-if="oxford_def.status === 404">Not Found</div>
		</div>
		<div class="word-content loading" v-else>Loading...</div>
		<div class="word-close" @click="closeDef">X</div>
		<div class="word-delete" @click="deleteItem(word.text)">Delete</div>
		<div class="word-overlay" @click="lookupItem(word.text)"></div>
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
				this.$emit('delete', word);
			},
			lookupItem(word) {
				this.$emit('lookup', word);
				this.showDef = !this.showDef;
				
				// Lookup the word if no definition has been stored
				if(!this.oxford_def.status) {
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
			},
			extractSynonyms(wordId, lexicalEntryId, entryId, senseId) {
        const word = this.state.oxford_synonyms[wordId];
        if(word === undefined){
          return [];
        }

        const lexicalEntries = word.lexicalEntries[lexicalEntryId];
        const entries = (lexicalEntries !== undefined) ? lexicalEntries.entries[entryId] : undefined;
        const senses = (entries !== undefined) ? entries.senses[senseId] : undefined;
        const synonyms = (senses !== undefined) ? senses.synonyms : [];
        return synonyms;
      },
      closeDef() {
				this.showDef = !this.showDef;
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
	}

	.word:hover {
		box-shadow: 2px 2px 10px rgba(0,0,0,.3);
		background-color: #F2D680;
	}

	.word .word-content,
	.word .word-close,
	.word .word-delete {
		display: none;
	}

	.word.displayDef {
		width: 500px;
		width: 100%;
		max-width: 100%;
		height: 200px;
		max-height: 80%;
		margin-right: 0;
		position: relative;
	}

	.word.displayDef .word-close {
    display: block;
    position: absolute;
    top: 18px;
    right: 18px;
    font: 1em 'Marko One', serif;
    padding: 2px 8px;
    background-color: #ccc;
    border-radius: 5px;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
	}

	/* word-overlay is the clickable overlay that launches word lookup */
	.word .word-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		cursor: pointer;
		-webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
	}

	/* Set background to white when viewing word definition */
	.word.displayDef:hover {
		background-color: #fff;
	}

	/* Hide work-overlay when viewing word definition */
	.word.displayDef .word-overlay {
		display: none;
	}

	/* Content/Body */
	.word.displayDef .word-content {
		display: block;
    text-align: left;
    overflow-y: auto;
    width: 100%;
    height: 162px;
	}

	.word-content h6 {
		margin-bottom: .5rem;
		font: italic 500 1rem/1.2 sans-serif;
		color: inherit;
	}

	.word.displayDef .word-title {
		background-color: rgba(0,0,0,.03);
		padding: 10px;
		border-bottom: 1px solid #666;
	}

	.word.displayDef .loading {
		text-align: center;
		padding: 50px 0;
	}

	.word.displayDef .word-delete {
    display: block;
		position: absolute;
    top: 17px;
    left: 17px;
    cursor: pointer;
    color: #000;
    padding: 5px 10px;
    border-radius: 5px;
	}

	.word.displayDef .word-delete:hover {
		color: #fff;
		background-color: red;
		box-shadow: 0 0 5px rgba(0,0,0,.7);
	}

</style>
