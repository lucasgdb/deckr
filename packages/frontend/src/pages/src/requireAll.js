const { cardsPNG } = require('./information.json');

const requiredImages = [];

/* eslint-disable */
for (let i = 0; i < cardsPNG.length; i += 1) {
   requiredImages.push(require(`../../images/cards/${cardsPNG[i]}.png`));
}
/* eslint-disable */

export default requiredImages;
