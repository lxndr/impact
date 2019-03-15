import React, { useContext } from 'react';
import { createMemoryHistory } from 'history';
import { Route } from 'react-router';

/**
 * @typedef {import('react-router').RouteChildrenProps} RouteChildrenProps
 */

const defaultHistory = createMemoryHistory();

/** @type {RouteChildrenProps} */
const defaultContext = {
  history: defaultHistory,
  location: defaultHistory.location,
  match: null,
};

const RouterContext = React.createContext(defaultContext);

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
const RouterProvider = ({ children }) => (
  <Route>
    {props => (
      <RouterContext.Provider value={props}>
        {children}
      </RouterContext.Provider>
    )}
  </Route>
);

const useRouter = () => useContext(RouterContext);

export { RouterProvider, useRouter };
