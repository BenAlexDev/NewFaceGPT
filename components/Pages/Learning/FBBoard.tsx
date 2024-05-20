import { Box, Button, Flex, Text } from "@mantine/core";
import { FaFacebookF } from "react-icons/fa";
import FBAuthModal from "./FBAuthModal";
import FBPagesModal from "./FBPagesModal";
import { FC, useState } from "react";

interface Props {
    nextStep: () => void;
}

const FBBoard:FC<Props> = () => {
    const [openFBAuthModal, setFBAuthModal] = useState<boolean>(false);
    const [openFBPagesModal, setFBPagesModal] = useState<boolean>(false);
    return (
        <Flex
            justify={'center'}
            mt={50}
            direction={'column'}
            align={'center'}
        >
            <Box
                w={750}
                style={{
                    boxShadow: "0 4px 7px -2px rgba(0, 0, 0, 0.19)",
                }}
            >
                <Box
                    pb={15}
                    style={{
                        borderBottom: '1px solid #E5E7EB'
                    }}
                    pl={5}
                >
                    <Text weight={'bold'} size={'20px'}
                    >
                        Select Platform
                    </Text>
                </Box>

                <Flex
                    pl={20}
                    pt={30}
                    pb={20}
                    sx={(theme) => ({
                        borderBottom: '1px solid #E5E7EB'
                    })}
                >
                    <Flex
                        p={15} gap={10} justify={'center'} align={'center'} direction={'column'}
                        bg={'#919EAB52'}
                        sx={(theme) => ({
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: `1px solid ${theme.colors.gray[4]}`
                        })}
                    >
                        <FaFacebookF color='#1877F2' size={30} />
                        <Text size={14} color="#18232A" weight={600}>
                            FaceBook
                        </Text>
                    </Flex>
                </Flex>
                <Flex pt={20} pb={20} justify={'flex-end'}>
                    <Button
                        radius={30}
                        sx={(theme) => ({
                            color: '#18232A',
                            '&:hover': {
                                background: '#eded15'
                            }
                        })}
                        bg={"#E0E049"}
                        onClick={() => {
                            setFBAuthModal(true);
                        }}
                    >
                        <Text size={14} weight={'bold'} color="black">
                            Connect
                        </Text>
                    </Button>
                </Flex>
            </Box>
            <FBAuthModal open={openFBAuthModal} close={() => {setFBAuthModal(false)}}/>
            <FBAuthModal open={openFBPagesModal} close={() => {setFBPagesModal(false)}}/>
        </Flex>
    )
}

export default FBBoard;