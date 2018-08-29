import Vue from 'vue';
import Lexicon from './Lexicon.vue';

Vue.config.productionTip = false;

new Vue({
  render: h => h(Lexicon)
}).$mount('#app');
