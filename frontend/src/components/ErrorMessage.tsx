import React from 'react';

const ErrorMessage = (props: any) => {
    const { error, customMessage } = props;
    if (customMessage) {
        return (
            <div>
                <p data-test="graphql-error">{customMessage}</p>
            </div>
        );
    } else {
        if (!error || !error.message) return null;
        if (error.networkError && error.networkError.result && error.networkError.result.errors.length) {
            return error.networkError.result.errors.map((error: any, i: any) => (
                <div key={i}>
                    <p data-test="graphql-error">
                        {error.message.replace('GraphQL error: ', '')}
                    </p>
                </div>
            ));
        }

        return (
            <div>
                <p data-test="graphql-error">
                    {error.message.replace('GraphQL error: ', '')}
                </p>
            </div>
        );
    }
};

export default ErrorMessage;