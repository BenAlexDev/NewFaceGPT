import { CommentState, CommentType } from "@/types/new_comments";
import { Avatar, Box, Flex, NavLink, Text, Tabs, Loader, ScrollArea, Indicator } from "@mantine/core";
import { IconCheck, IconChevronRight, IconEye, IconEyeFilled, IconEyeOff, IconRefresh } from "@tabler/icons-react";
import { FC, useEffect, useState } from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { MOBILE_MODE_SIZE, THEME_COLOR, THEM_BORDER_COLOR } from "@/utils/app/consts";
import { useMediaQuery } from '@mantine/hooks';
interface Props {
    comments: CommentType[],
    selComment: CommentType,
    setSelComment: (comment: CommentType) => void;
    isLoad: boolean,
    getComments: () => void;
    brand_id: string
}

const Comments: FC<Props> = ({
    comments,
    selComment,
    setSelComment,
    isLoad,
    getComments,
    brand_id
}) => {

    const isMobile = useMediaQuery(`(max-width: ${MOBILE_MODE_SIZE}px)`);
    const [readComments, setReadComments] = useState<CommentType[]>([]);
    const [unreadComments, setUnreadComments] = useState<CommentType[]>([]);
    const [postedComments, setPostedComments] = useState<CommentType[]>([]);

    const [status, setStatus] = useState<string>("unread");

    useEffect(() => {
        const posted_comments: CommentType[] = [];
        const read_comments: CommentType[] = [];
        const unread_comments: CommentType[] = [];

        comments.map((comment: CommentType) => {
            if (comment.read && comment.posted == -1) {
                read_comments.push(comment);
            } else if (!comment.read) {
                unread_comments.push(comment);
            } else if (comment.posted > -1) {
                posted_comments.push(comment);
            }
        });
        setPostedComments(posted_comments);
        setReadComments(read_comments);
        setUnreadComments(unread_comments);
        setStatus("unread");
    }, [comments])

    const changeStatus = (status: string) => {
        setStatus(status);
        if (status == "unread") {
            if (unreadComments.length > 0) {
                setSelComment(unreadComments[0]);
            } else {
                setSelComment(CommentState);
            }
        } else if (status == "read") {
            if (readComments.length > 0) {
                setSelComment(readComments[0]);
            } else {
                setSelComment(CommentState);
            }
        } else {
            if (postedComments.length > 0) {
                setSelComment(postedComments[0]);
            } else {
                setSelComment(CommentState);
            }
        }
    }

    return (
        <Box
            sx={(theme) => ({
                boxShadow: "0px 16px 32px -4px #919EAB3D",
                borderRadius: 16,
                border: `1px  solid ${isMobile?THEM_BORDER_COLOR:'white'}`
            })}
            bg={'white'}
            h={'100%'}
        >
            <Box
                pt={0}
                h={'100%'}
            >
                <Tabs value={status} className="comments-tabs" h={'100%'}>
                    <Tabs.List position="apart">
                        <Tabs.Tab value="unread" onClick={() => { changeStatus('unread') }}>
                            <Flex gap={5} align={'center'}>
                                <AiFillEyeInvisible size={17} fontWeight={600} color={status == "unread" ? "#18232A" : "#637381"} />
                                <Text size={14} weight={600} className="body-normal" color={status == "unread" ? "#18232A" : "#637381"}>
                                    Unread
                                </Text>
                            </Flex>
                        </Tabs.Tab>
                        <Tabs.Tab value="read" onClick={() => { changeStatus('read') }}>
                            <Flex gap={5} align={'center'}>
                                <AiFillEye size={20} fontWeight={600} color={status == "read" ? "#18232A" : "#637381"} />
                                <Text size={14} weight={600} color={status == "read" ? "#18232A" : "#637381"}>
                                    Read
                                </Text>
                            </Flex>
                        </Tabs.Tab>
                        <Tabs.Tab value="posted" onClick={() => { changeStatus('posted') }} >
                            <Flex gap={5} align={'center'}>
                                <Flex align={'center'} justify={'center'}
                                    sx={(theme) => ({
                                        width: 16,
                                        height: 16,
                                        borderRadius: 16,
                                        border: `1px solid ${status == "posted" ? "#18232A" : "#637381"}`
                                    })}
                                >
                                    <IconCheck size={14} color={status == "posted" ? "#18232A" : "#637381"} />
                                </Flex>
                                <Text size={14} weight={600} color={status == "posted" ? "#18232A" : "#637381"}>
                                    Posted
                                </Text>
                            </Flex>
                        </Tabs.Tab>
                    </Tabs.List>
                    <Tabs.Panel value="unread" h={'calc(100% - 50px)'}>
                        <CommentsList
                            comments={unreadComments}
                            setSelComment={setSelComment}
                            selComment={selComment}
                            isLoad={isLoad}
                            getComments={getComments}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="read" h={'calc(100% - 50px)'}>
                        <CommentsList
                            comments={readComments}
                            setSelComment={setSelComment}
                            selComment={selComment}
                            isLoad={isLoad}
                            getComments={getComments}
                        />
                    </Tabs.Panel>
                    <Tabs.Panel value="posted" style={{ padding: 0 }} pt={15} h={'calc(100% - 50px)'}>
                        {

                            <CommentsList
                                comments={postedComments}
                                setSelComment={setSelComment}
                                selComment={selComment}
                                isLoad={isLoad}
                                getComments={getComments}
                            />
                        }
                    </Tabs.Panel>
                </Tabs>
            </Box>
        </Box >
    )
}

interface ListProps {
    comments: CommentType[]
    selComment: CommentType,
    setSelComment: (comment: CommentType) => void,
    isLoad: boolean,
    getComments: () => void
}
const CommentsList: FC<ListProps> = ({
    comments,
    setSelComment,
    selComment,
    isLoad,
    getComments
}) => {
    const convertDate = (date: string) => {

        const now: any = new Date();
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

        const formatted_date: any = new Date(`${year}-${month}.${day} ${hours}:${minutes}`);
        const difMilisec: any = now - formatted_date;
        const diffInHour = Math.ceil(difMilisec / (60 * 60 * 1000));
        if (diffInHour < 25) {
            return `${diffInHour}hours`
        } else {
            return `${day}.${month}.${year}`;
        }

    }
    const renderIcon = (type: string) => {
        if(type == 'ig') {
            return <FaInstagram style={{ color: '#cd4343', background: 'white', borderRadius: 20 }} size={20} />
        } else if(type == 'fb') {
            return  <FaFacebook style={{ color: '#1877F2', background: 'white', borderRadius: 20 }} size={20} />
        }
    }
    return (
        isLoad ? <Flex justify={'center'} pt={20} mih={400}>
            <Loader color="#E0E049" variant="bars" />
        </Flex> :

            <Box
                h={'100%'}
            >
                <Flex
                    pt={10}
                    pb={10}
                    gap={5}
                    align={'center'}
                    justify={'center'}
                    onClick={() => { getComments() }}
                    sx={(theme) => ({
                        cursor: 'pointer'
                    })}
                >
                    <IconRefresh />
                    <Text size={14} className="body-bold">
                        Load new comments...
                    </Text>
                </Flex>
                {
                    comments.length == 0 ?
                        <Box
                            h={'100%'}
                        >
                            <h4 style={{ padding: '15px' }}>
                                No Comments
                            </h4>
                        </Box>
                        :
                        <ScrollArea h={'calc(100% - 50px)'} type="auto" scrollHideDelay={2000} w={'100%'}>
                            <Flex
                                direction={'column'}
                            >
                                {
                                    comments.map((item: CommentType, key) =>
                                        <NavLink
                                            key={key}
                                            sx={(theme) => ({
                                                background: selComment.comment_id == item.comment_id ? '#ECEDE7 !important' : 'transparent',
                                                zIndex: 0
                                            })}
                                            label={
                                                <Box w={'100%'}>
                                                    <Flex
                                                        direction={'column'}
                                                        gap={10}
                                                        maw={'100%'}
                                                        sx={(theme) => ({
                                                        })}
                                                    >
                                                        <Flex
                                                            align={'center'}
                                                            justify={'space-between'}

                                                        >
                                                            <Text
                                                                size={14}
                                                                color="#18232A"
                                                                weight={600}
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
                                                        {/* <Box>
                                                        <Text size={14} 
                                                            sx={(theme) => ({
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            })}
                                                            w={'100%'}
                                                        >
                                                            {item.message}
                                                        </Text>
                                                    </Box> */}
                                                    </Flex>
                                                </Box>
                                            }
                                            icon={
                                                <Indicator label={
                                                    <Box>
                                                        {renderIcon(item.type)}
                                                    </Box>
                                                } position="bottom-end" color="transparent" inline size={20} offset={5}>
                                                    <Avatar size={40} src={item.picture} radius={'100%'} />
                                                </Indicator>
                                            }
                                            variant="subtle"
                                            onClick={() => { setSelComment(item) }}
                                        />
                                    )
                                }
                            </Flex>
                        </ScrollArea>
                }

            </Box>
    )
}

export default Comments;