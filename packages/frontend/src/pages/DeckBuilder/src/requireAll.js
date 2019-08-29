const { cards_png } = require('./information.json')

const requiredImages = []

for (let i = 0; i < cards_png.length; i++) {
    requiredImages.push(require(`../../../cards/${cards_png[i]}.png`))
}

module.exports = requiredImages
