const { cardsPNG } = require('./information.json');

const requiredImages = [];

const enabled = JSON.parse(localStorage.getItem('cards')) || [];

/* eslint-disable */
for (let i = 0; i < cardsPNG.length; i += 1) {
   if (enabled[i] || enabled[i] === undefined) {
      requiredImages.push(require(`../../images/cards/${cardsPNG[i]}.png`));
   }
}
/* eslint-disable */

export default requiredImages;
