import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Spinner from './components/Spinner';

const DeckBuilder = lazy(() => import('./pages/DeckBuilder'));
const SavedDecks = lazy(() => import('./pages/SavedDecks'));
const About = lazy(() => import('./pages/About'));
const Error404 = lazy(() => import('./pages/Error404'));

ReactDOM.render(
   <Suspense fallback={<Spinner center />}>
      <BrowserRouter>
         <Switch>
            <Route path='/' exact component={DeckBuilder} />
            <Route path='/about/' exact component={About} />
            <Route path='/decks' component={SavedDecks} />
            <Route path='*' component={Error404} />
         </Switch>
      </BrowserRouter>
   </Suspense>,
   document.getElementById('root'),
);
