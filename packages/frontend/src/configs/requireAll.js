const { cardsPNG } = require('./information.json');

const requiredImages = [];

for (let i = 0; i < cardsPNG.length; i += 1) {
   /* eslint-disable-next-line */
   requiredImages.push(require(`../images/cards/${cardsPNG[i]}.png`));
}

export default requiredImages;
