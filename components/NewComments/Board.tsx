import { CommentType } from "@/types/new_comments";
import { Box, Button, Flex, Text } from "@mantine/core";
import { FC, useEffect, useState } from "react";

interface Props {
    comment: CommentType
}

const Board: FC<Props> = ({
    comment
}) => {

    const [parentComment, setParentComment] = useState<any>(false);
    const [subComments, setSubComments] = useState<any>(false);
    
    useEffect(() => {
        const comment_history = comment.comment_history;
        setSubComments(comment_history);
        if (comment.parent_comment) {
            if (!Object.keys(comment.parent_comment).includes('message')) {
                setParentComment(false)
            } else {
                setParentComment(comment.parent_comment);
            }
        }
    }, [comment])

    const goFBComment = () => {
        window.open(comment.permalink_url);
    }

    const convertDate = (date: string) => {
        const inputDateTime = new Date(date);

        // Define the target timezone offset
        const targetTimezoneOffset = 0; // GMT+2

        // Apply the timezone offset to the input date and time
        inputDateTime.setHours(inputDateTime.getHours() + targetTimezoneOffset);

        // Extract the individual components
        const year = inputDateTime.getFullYear();
        const month = String(inputDateTime.getMonth() + 1).padStart(2, '0');
        const day = String(inputDateTime.getDate()).padStart(2, '0');
        const hours = String(inputDateTime.getHours()).padStart(2, '0');
        const minutes = String(inputDateTime.getMinutes()).padStart(2, '0');

        // Format the components into the desired output string
        const outputDateTime = `${day}.${month}.${year} ${hours}:${minutes}`;
        return outputDateTime;
    }

    return (
        <Box
            sx={(theme) => ({
                boxShadow: "0px 1px 2px 0px #919EAB3D"
            })}
            p={15}
        >
            <Box p={20}
                sx={(theme) => ({
                    borderBottom: `1px solid ${theme.colors.gray[3]}`
                })}
            >
                <Flex justify={'flex-end'} mt={20}>
                    <Button
                        onClick={() => { goFBComment() }}
                    >
                        View Comment on FB
                    </Button>
                </Flex>
                <Text size={15} weight={500} mt={20}>
                    <div dangerouslySetInnerHTML={{
                        __html:
                            comment.post_caption.replaceAll("\n", "<br>")
                    }}>

                    </div>
                </Text>
                
            </Box>
            <Box p={20}>
                <Box>
                    {
                        parentComment ?
                            <Box>
                                <Flex
                                    justify={'space-between'}
                                    align={'center'}
                                >
                                    <Flex
                                        gap={'md'}
                                    >
                                        <Text size={14} weight={500} pl={20}>
                                            {
                                                Object.keys(parentComment).includes("from") ? parentComment.from.name : ''
                                            }
                                        </Text>
                                        <Text size={12} weight={400} pl={20}>
                                            {convertDate(parentComment.created_time)}
                                        </Text>
                                    </Flex>

                                </Flex>
                                <Box
                                    sx={(theme) => ({
                                        background: subComments.length == 0 ? '#228be6' : 'gray',

                                        padding: '10px',
                                        borderRadius: '0px 7px 7px 7px'
                                    })}
                                    mt={10}
                                >
                                    <Text color="white">
                                        {parentComment.message}
                                    </Text>
                                </Box>
                            </Box> : <></>
                    }
                    <Box
                        pl={40}
                    >
                        {
                            !subComments ?
                                <></> :
                                subComments.length == 0 ? <Flex justify={'center'}><h4>No Sub Comments</h4></Flex> :
                                    subComments.map((item: any, key: number) =>
                                        <Box key={key} mt={20}

                                        >
                                            <Flex
                                                gap={'md'}
                                            >
                                                <Text size={14} weight={500} pl={20}>
                                                    {
                                                        Object.keys(item).includes('from') ? item.from.name : ''
                                                    }
                                                </Text>
                                                <Text size={12} weight={400} pl={20}>
                                                    {convertDate(item.created_time)}
                                                </Text>
                                            </Flex>
                                            <Box
                                                sx={(theme) => ({
                                                    padding: '10px',
                                                    background: 'gray',
                                                    borderRadius: '0px 7px 7px 7px'
                                                })}
                                                mt={10}
                                            >
                                                <Text color="white">
                                                    {item.message}
                                                </Text>
                                            </Box>
                                        </Box>
                                    )
                        }
                        <Box mt={20}

                        >
                            <Flex
                                gap={'md'}
                            >
                                <Text size={14} weight={500} pl={20}>
                                    {
                                        comment.from_name
                                    }
                                </Text>
                                <Text size={12} weight={400} pl={20}>
                                    {convertDate(comment.create_time)}
                                </Text>
                            </Flex>
                            <Box
                                sx={(theme) => ({
                                    padding: '10px',
                                    background: '#228be6',
                                    borderRadius: '0px 7px 7px 7px'
                                })}
                                mt={10}
                            >
                                <Text color="white">
                                    {comment.message}
                                </Text>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}



export default Board;