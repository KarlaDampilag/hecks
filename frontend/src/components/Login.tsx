import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';

import { CURRENT_USER_QUERY } from './App';

const LOGIN_MUTATION = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            id
        }
    }
`;

const Login = () => {
    const history = useHistory();  // FIXME pass this down as react context!
    const [email, setEmail] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();

    const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION, {
        variables: { email, password },
        refetchQueries: [{ query: CURRENT_USER_QUERY }]
    });
    return (
        <>
            <Form
                initialValues={{ remember: true }}
                onFinish={async () => {
                    const result = await login();
                    if (!error) {
                        history.push('/');
                    } else {
                        message.error(error.message.replace('GraphQL error: ', ''));
                    }
                }}
            >
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Please input your email' }]}
                >
                    <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="E-mail" onChange={(e) => setEmail(e.target.value)} />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password' }]}
                >
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Item>

                <Form.Item>
                    <Button disabled={loading} loading={loading} type="primary" htmlType="submit" className="login-form-button">Log In</Button>
                    <div>Don't have an account? <a href="signup">Register</a></div>
                </Form.Item>
            </Form>
        </>
    );
}
export default Login;