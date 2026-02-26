import React, { useState } from "react";
import { Modal } from "antd";
import Coa from "./coa";

interface NoLedgerAccountModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const NoLedgerAccountModal: React.FC<NoLedgerAccountModalProps> = ({ isVisible, onClose }) => {
    const [modalVisible, setModalVisible] = useState(isVisible);

    // Function to close the modal only when API call is successful
    const handleCloseModal = () => {
        setModalVisible(false);
        onClose(); // Call parent's close function
    };
    return (
        <Modal
            title="No Ledger Accounts Found"
            open={modalVisible}
            onCancel={() => setModalVisible(true)}
            footer={null}
            centered
            width={600} // Adjust modal size for better layout
        ><p>No ledger accounts found against this Customer ID</p>
            <Coa onSuccess={handleCloseModal} />
        </Modal>
    );
};

export default NoLedgerAccountModal;
