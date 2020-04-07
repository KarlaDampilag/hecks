import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'antd';

import LogoutButton from './LogoutButton';

interface PropTypes {
    user: any // FIXME how to use GraphQL types on frontend?
}

const Header = (props: PropTypes) => {
    const [selectedKey, setSelectedKey] = React.useState<string>('');
    return (
        <div>
            <Menu
                mode='horizontal'
                selectedKeys={[selectedKey]}
                onClick={(e) => setSelectedKey(e.key)}
            >
                <Menu.Item key='products'><Link to="/products">Products</Link></Menu.Item>
                <Menu.Item key='sales'><Link to="/sales">Sales</Link></Menu.Item>
                {props.user && <Menu.Item><LogoutButton /></Menu.Item>}
                {!props.user && <Menu.Item><Link to="/signup">Sign Up</Link></Menu.Item>}
                {!props.user && <Menu.Item><Link to="/login">Log In</Link></Menu.Item>}
            </Menu>
        </div>
    );
}

export default Header;