import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
const DeckBuilder = lazy(() => import('./pages/DeckBuilder'))
const About = lazy(() => import('./pages/About'))
const Error404 = lazy(() => import('./pages/Error404'))

ReactDOM.render(
    <Suspense fallback={<div>Carregando...</div>}>
        <BrowserRouter>
            <Switch>
                <Route path="/" exact={true} component={DeckBuilder} />
                <Route path="/sobre/" exact={true} component={About} />
                <Route path="*" component={Error404} />
            </Switch>
        </BrowserRouter>
    </Suspense>,
    document.getElementById('root')
);
