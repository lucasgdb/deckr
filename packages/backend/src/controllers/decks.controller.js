const deck = require('mongoose').model('decks');

module.exports = {
   async getDecks(_, res) {
      const decks = await deck.find();

      return res.status(200).json(decks);
   },

   async createDeck(req, res) {
      const createdDeck = await deck.create(req.body);

      return res.status(201).json(createdDeck);
   },

   async removeDeck(req, res) {
      await deck.findByIdAndRemove(req.params._id);

      return res.status(204).json({});
   },
};
