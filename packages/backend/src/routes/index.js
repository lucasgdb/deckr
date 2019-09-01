const routes = require('express').Router();
const deckController = require('../controllers/decks.controller');
const playerController = require('../controllers/chests.controller');

// Deck information
routes.get('/decks', deckController.getDecks);
routes.post('/decks', deckController.createDeck);
routes.delete('/decks/:_id', deckController.removeDeck);

// RoyaleAPI
routes.get('/chests/:id', playerController.getInformation);

module.exports = routes;
