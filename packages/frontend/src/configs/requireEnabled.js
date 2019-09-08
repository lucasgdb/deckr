const { cardsPNG } = require('./information.json');

const requiredImages = [];

const enabled = JSON.parse(localStorage.getItem('cards')) || [];

for (let i = 0; i < cardsPNG.length; i += 1) {
   if (enabled[i] || enabled[i] === undefined) {
      /* eslint-disable-next-line */
      requiredImages.push(require(`../images/cards/${cardsPNG[i]}.png`));
   }
}

export default requiredImages;
