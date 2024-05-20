import { CommentType } from "@/types/new_comments";
import { Avatar, Box, Checkbox, Flex, NavLink, Text, Tabs } from "@mantine/core";
import { IconActivity, IconChevronRight } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { Badge } from '@mantine/core';

interface Props {
    comments: CommentType[],
    selComment: CommentType,
    setSelComment: (comment: CommentType) => void;
}

const Comments: FC<Props> = ({
    comments,
    selComment,
    setSelComment
}) => {

    const [openComments, setOpenComments] = useState<CommentType[]>([]);
    const [postedComments, setPostedComments] = useState<CommentType[]>([]);
    const [status, setStatus] = useState<string>("open");

    useEffect(() => {
        const open_comments: CommentType[] = [];
        const posted_comments: CommentType[] = [];

        comments.map((comment: CommentType) => {
            if (comment.posted == -1) {
                open_comments.push(comment);
            } else {
                posted_comments.push(comment);
            }
        });
        setPostedComments(posted_comments);
        setOpenComments(open_comments);
        setStatus("open");
    }, [comments])
    
    const changeStatus = (status: string) => {
        setStatus(status);
        if(status == "open") {
            if(openComments.length > 0) {   
                setSelComment(openComments[0]);
            }   
        } else {
            if(postedComments.length > 0) {
                setSelComment(postedComments[0]);
            }
        }
    }
    return (
        <Box
            sx={(theme) => ({

            })}
            p={5}
        >

            <Box>
                <Tabs value={status}>
                    <Tabs.List>
                        <Tabs.Tab value="open" onClick={() => {changeStatus('open')}} className="body-nor">
                            Open
                        </Tabs.Tab>
                        <Tabs.Tab value="posted" onClick={() => {changeStatus('posted')}} >
                            Posted/Done
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="open">
                        <CommentsList 
                            comments={openComments}
                            setSelComment={setSelComment}
                            selComment={selComment}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel value="posted">
                        <CommentsList 
                            comments={postedComments}
                            setSelComment={setSelComment}
                            selComment={selComment}
                        />
                    </Tabs.Panel>
                </Tabs>
            </Box>
        </Box >
    )
}

interface ListProps {
    comments: CommentType[]
    selComment: CommentType,
    setSelComment: (comment: CommentType) => void
}
const CommentsList: FC<ListProps> = ({
    comments,
    setSelComment,
    selComment
}) => {
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
        comments.length == 0?
        <h3>
            No Comments
        </h3>:
        comments.map((item: CommentType, key) =>
            <NavLink
                mt={20}
                key={key}
                active={selComment.comment_id == item.comment_id ? true : false}
                label={
                    <Box>
                        <Flex
                            direction={'column'}
                            gap={10}
                        >
                            <Flex
                                align={'center'}
                                justify={'space-between'}
                            >
                                <Text
                                    size={16}
                                    weight={500}
                                >
                                    {item.from_name}
                                </Text>
                                <Text
                                    color="gray"
                                    size={14}
                                    weight={400}
                                >
                                    {
                                        convertDate(item.create_time)
                                    }
                                </Text>
                            </Flex>
                        </Flex>
                        {/* {
                            item.posted > -1 ?
                                <Flex justify={'flex-end'}>
                                    <Badge>Open</Badge>
                                </Flex> : <></>
                        } */}
                    </Box>

                }
                icon={<Avatar />}
                rightSection={<IconChevronRight size="0.8rem" stroke={1.5} />}
                variant="subtle"
                onClick={() => { setSelComment(item) }}
            />
        )

    )
}

export default Comments;