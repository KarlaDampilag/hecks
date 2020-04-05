import React from 'react';
import { Switch, Route } from 'react-router';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import Header from './Header';
import SignUp from './SignUp';
import Login from './Login';
import Products from './Products';

const CURRENT_USER_QUERY = gql`
  {
    me {
      id
      email
      verified
      permissions
    }
}
`;

const userContext = React.createContext({ user: {} });

function App() {
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);
  const user = data ? data.me : null;

  return (
    <userContext.Provider value={user}>
      <div className="App">
        <Header user={user} />
        <Switch>
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/products" component={Products} />
        </Switch>
      </div>
    </userContext.Provider>
  );
}

export default withRouter(App);
export { userContext };
export { CURRENT_USER_QUERY };