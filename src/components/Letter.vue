<template>
	<div class="letter" :class="{ expanded: isExpanded}" :data-letter="letter">
		<div class="letter-header">
			<div class="letter-text" 
				:class="{ hasWords: wordlist.length > 0}"
				@click="isExpanded = !isExpanded"
				:data-count="wordlist.length"
			>{{ letter }}</div>
		</div>
		<Word v-for="word in wordlist"
        :word="word"
        :letter="letter"
        @delete="deleteWord"
        @lookup="lookupWord"
        :key="word.id" 
    />
	</div>
</template>

<script>
	import Word from './Word.vue';

	export default {
		name: "lexicon-letter",
		components: {
			Word
		},
		props: ['letter','wordlist', 'deleteWord', 'lookupWord'],
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
		display: flex;
    flex-flow: row wrap;
	}

	/* New */

	.letter.expanded .letter-header {
		margin-right: 15px;
	}

	.letter.expanded .letter-text::after {
    content: attr(data-count);
    position: absolute;
    top: -6px;
    left: -6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    color: #fff;
    background-color: #3b12ec;
    border: 1px solid #000;
    font: 600 12px/1.5em serif;
	}

	/* Old */

	.letter .letter-wordCount,
	.letter .word {
		display: none;
	}

	.letter.expanded .letter-wordCount,
	.letter.expanded .word {
		display: inline-block;
	}

	.letter-header {
		/*width: 100%;*/
		display: 	flex;
		flex-flow: column;
		position: relative;
		width: 53px;
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
