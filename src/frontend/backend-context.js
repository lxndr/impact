import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

export const BackendContext = React.createContext();

export function withBackend(Component) {
  const C = props => {
    return (
      <BackendContext.Consumer>
        {backend => <Component {...props} backend={backend}/>}
      </BackendContext.Consumer>
    );
  };

  C.displayName = `withBackend(${Component.displayName || Component.name})`;
  return hoistNonReactStatics(C, Component);
}
