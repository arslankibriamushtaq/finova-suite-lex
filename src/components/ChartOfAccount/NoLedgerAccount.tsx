import React, { useState } from "react";
import { Modal } from "antd";
import { useTranslation } from "react-i18next";
import Coa from "./coa";

interface NoLedgerAccountModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const NoLedgerAccountModal: React.FC<NoLedgerAccountModalProps> = ({ isVisible, onClose }) => {
    const { t } = useTranslation("accountingLoans");
    const [modalVisible, setModalVisible] = useState(isVisible);

    // Function to close the modal only when API call is successful
    const handleCloseModal = () => {
        setModalVisible(false);
        onClose(); // Call parent's close function
    };
    return (
        <Modal
            title={t("noLedger.title")}
            open={modalVisible}
            onCancel={() => setModalVisible(true)}
            footer={null}
            centered
            width={600} // Adjust modal size for better layout
        ><p>{t("noLedger.body")}</p>
            <Coa onSuccess={handleCloseModal} />
        </Modal>
    );
};

export default NoLedgerAccountModal;
