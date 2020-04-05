import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router-dom';

import ErrorMessage from './ErrorMessage';
import { CURRENT_USER_QUERY } from './App';

const SIGNUP_MUTATION = gql`
    mutation signup($email: String!, $password: String!, $confirmPassword: String!) {
        signup(email: $email, password: $password, confirmPassword: $confirmPassword) {
            id
        }
    }
`;

const SignUp = () => {
    const history = useHistory();  // FIXME pass this down as react context!
    const [email, setEmail] = React.useState<string>();
    const [password, setPassword] = React.useState<string>();
    const [confirmPassword, setConfirmPassword] = React.useState<string>();

    const [signup, { loading, error }] = useMutation(SIGNUP_MUTATION, {
        variables: { email, password, confirmPassword },
        refetchQueries: [{ query: CURRENT_USER_QUERY }]
    });
    return (
        <>
            <Form
                initialValues={{ remember: true }}
                onFinish={async () => {
                    if (password != confirmPassword) {
                        message.error('Passwords did not match');
                    } else {
                        const result = await signup();
                        if (!error) {
                            history.push('/');
                        }
                        console.log(result)
                    }
                }}
            >
                {error && <ErrorMessage error={error} />}
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

                <Form.Item
                    name="confirmPassword"
                    rules={[{ required: true, message: 'Please input your password' }]}
                >
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Confirm Password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Form.Item>

                <Form.Item>
                    <Button disabled={loading} type="primary" htmlType="submit" className="login-form-button">Sign Up</Button>
                    <div>Have an account? <a href="login">Log In</a></div>
                </Form.Item>
            </Form>
        </>
    );
}
export default SignUp;