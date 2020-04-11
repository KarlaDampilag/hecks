import React from 'react';
import { Switch, Route } from 'react-router';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import Header from './Header';
import SignUp from './SignUp';
import Login from './Login';
import Products from './Products';
import Inventories from './Inventories';
import Customers from './Customers';
import Sales from './Sales';

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

const Page404 = () => (
  <p>Page not found.</p>
);

const userContext = React.createContext({ user: {} });

function App() {
  const { data } = useQuery(CURRENT_USER_QUERY);
  const user = data ? data.me : null;

  return (
    <userContext.Provider value={user}>
      <div className='app-wrapper'>
        <div className="App">
          <Header user={user} />
          <div className='page-wrapper'>
            <Switch>
              <Route exact path="/signup" component={SignUp} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/products" component={Products} />
              <Route exact path="/inventories" component={Inventories} />
              <Route exact path="/customers" component={Customers} />
              <Route exact path="/sales" component={Sales} />
              <Route component={Page404} />
            </Switch>
          </div>
        </div>
      </div>
    </userContext.Provider>
  );
}

export default withRouter(App);
export { userContext };
export { CURRENT_USER_QUERY };