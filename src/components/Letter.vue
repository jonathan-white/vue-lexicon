<template>
	<div class="letter" v-bind:class="{ expanded: isExpanded}">
		<div class="letter-header">
			<div class="letter-text" 
				:class="{ hasWords: wordlist.length > 0}"
				@click="isExpanded = !isExpanded"
			>
				{{ letter }}
			</div>
			<div class="letter-wordCount">{{ wordlist.length }}</div>
			<div class="letter-wordList">
				<Word v-for="word in wordlist"
            :word="word"
            :letter="letter"
            @delete="deleteWord"
            :key="word.id" />
			</div>
		</div>
	</div>
</template>

<script>
	import Word from './Word.vue';

	export default {
		name: "lexicon-letter",
		components: {
			Word
		},
		props: ['letter','wordlist', 'deleteWord'],
		data() {
			return {
				isExpanded: false
			}
		}
	}
</script>

<style>
	.letter {
		margin-top: 5px;
		padding: 5px;
		position: relative;
		min-height: 100px;
		min-height: 52px;
		min-width: 52px;
		overflow: hidden;
	}

	.letter.expanded {
		width: 100%;
	}

	.letter .letter-wordCount,
	.letter .letter-wordList {
		display: none;
	}

	.letter.expanded .letter-wordCount,
	.letter.expanded .letter-wordList {
		display: block;
	}

	.letter-header {
		width: 100%;
		display: 	flex;
	}

	.letter-text {
    position: absolute;
    width: 25px;
    padding: 10px;
    font-size: 20px;
    border: 4px solid black;
    background: #e297d8;
    text-transform: uppercase;
    font-weight: 800;
    border-radius: 50%;
    user-select: none;
		cursor: pointer;
		transition: background-color 750ms ease;
	}

	.letter-text.hasWords {
		background-color: rgba(255, 0, 72, 1);
	}
	.letter-text.hasWords.highlight-one {
		background-color: #ff0048;
	}
	.letter-text.hasWords.highlight-two {
		background-color: #ff001e;
	}
	.letter-text.hasWords.highlight-three {
		background-color: #e1001e;
	}
	.letter-text.hasWords.highlight-four {
		background-color: #c9001e;
	}
	.letter-text.hasWords.highlight-five {
		background-color: #99001e;
	}

	.letter-text:hover {
		background-color: rgba(26, 151, 216, .7);
	}

	.letter-wordCount {
		position: absolute;
		border: 4px solid transparent;
		width: 20px;
		padding: 10px;
		font-size: 20px;
		top: 50px;
		font-weight: 800;
		color: #aaa;
	}

	.letter-wordList {
		position: relative;
		text-align: left;
		padding: 10px;
		left: 60px;
		border-top: 2px solid rgba(0,0,0,0.3);
		width: 90%;
	}
</style>
