import React from 'react';
import { Popconfirm, Button } from 'antd';

interface PropTypes {
    deleteIsLoading: boolean;
    onDelete: () => void;
    onClick: () => void;
}
const DeleteButton = (props: PropTypes) => {
    return (
        <Popconfirm
            title="Are you sure to delete? This action is irreversible!"
            okText="Delete"
            cancelText="Cancel"
            onConfirm={props.onDelete}
        >
            <Button onClick={props.onClick} loading={props.deleteIsLoading}>Delet{props.deleteIsLoading ? "ing" : "e"}</Button>
        </Popconfirm>
    )
}
export default DeleteButton;