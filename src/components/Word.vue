<template>
	<div v-if="firstChar === letter" class="word">
		{{ word.text }}
		<div class="delete-word" @click="deleteItem(word)">X</div>
	</div>
</template>

<script>
	export default {
		name: "lexicon-word",
		props: ['word','letter'],
		data() {
			return {
				firstChar: this.word.text.charAt(0)
			}
		},
		methods: {
			deleteItem(word) {
				this.$emit('delete', word)
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

	.delete-word {
		font-family: 'Andika', sans-serif;
		position: absolute;
		color: rgba(0,0,0,.3);
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: none;
		background-color: rgba(255,0,0,.5);
		text-align: center;
    font-size: 40px;
    line-height: 1em;
	}

	.word:hover .delete-word {
		display: block;
		cursor: pointer;
	}
</style>
