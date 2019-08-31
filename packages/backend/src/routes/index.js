const routes = require('express').Router();
const deckController = require('../controllers/deck.controller');

routes.get('/deck', deckController.getDecks);
routes.post('/deck', deckController.createDeck);
routes.delete('/deck/:_id', deckController.removeDeck);

module.exports = routes;
