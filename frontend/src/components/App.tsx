import React from 'react';
import { Switch, Route } from 'react-router';
import { withRouter } from 'react-router';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

import Header from './Header';
import SignUp from './SignUp';
import Login from './Login';

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

function App() {
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY);
  console.log(data);
  const user = data ? data.me : null;

  return (
    <div className="App">
      <Header user={user} />
      Hi where is my hi
      <Switch>
        <Route exact path="/signup" component={SignUp} />
        <Route exact path="/login" component={Login} />
      </Switch>
    </div>
  );
}

export default withRouter(App);
export { CURRENT_USER_QUERY };