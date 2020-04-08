import React from 'react';
import { Popconfirm, Button } from 'antd';

interface PropTypes {
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
            <Button onClick={props.onClick}>Delete</Button>
        </Popconfirm>
    )
}
export default DeleteButton;