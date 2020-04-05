import React from 'react';
import { Link } from 'react-router-dom';

import LogoutButton from './LogoutButton';

interface PropTypes {
    user: any // FIXME how to use GraphQL types on frontend?
}

const Header = (props: PropTypes) => {
    return (
        <div>
            {props.user ? (
                <LogoutButton />
            ) : (
                    <>
                        <Link to="/signup">Sign Up</Link>
                        <Link to="/login">Log In</Link>
                    </>
                )
            }
        </div>
    );
}

export default Header;