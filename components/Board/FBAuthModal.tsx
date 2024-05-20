import { Modal } from "@mantine/core";
import { FC } from "react";
interface Props {
    open: boolean,
    close: () => void
}

const FBAuthModal: FC<Props> = ({
    open,
    close
}) => {
    return (
        <Modal opened={open} onClose={close}
        >
                   
        </Modal>
    )
}

export default FBAuthModal;