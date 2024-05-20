import { CommentType } from "@/types/new_comments";
import { MOBILE_MODE_SIZE, THEME_COLOR, THEM_BORDER_COLOR } from "@/utils/app/consts";
import { Box, Button, Flex, Grid, Loader, ScrollArea, Text, Image } from "@mantine/core";
import { IconBrandFacebook } from "@tabler/icons-react";
import { FC, useEffect, useRef, useState } from "react";
import { IoHeart } from "react-icons/io5";
import { AiFillEyeInvisible } from "react-icons/ai";
import { convertTime } from "@/utils/app/global";
import { FaInstagram } from "react-icons/fa";
import { useMediaQuery } from '@mantine/hooks';
interface Props {
    comment: CommentType,
    isLoad: boolean
    isPosting: boolean;
    postSuggestion: (suggestion: string, index: number) => void
}

const Board: FC<Props> = ({
    comment,
    isLoad,
    postSuggestion,
    isPosting
}) => {

    const [parentComment, setParentComment] = useState<any>(false);
    const [subComments, setSubComments] = useState<any>(false);
    const [readCaption, setReadCaption] = useState<boolean>(false);
    const isMobile = useMediaQuery(`(max-width: ${MOBILE_MODE_SIZE}px)`);
    const [videoUrl, setVideoUrl] = useState<string>('');
    
    const playerRef:any = useRef(null);
    useEffect(() => {
        const comment_history = sortCommentHistory(comment.comment_history);
        setSubComments(comment_history);
        if (comment.parent_comment) {
            if (!Object.keys(comment.parent_comment).includes('message')) {
                setParentComment(false)
            } else {
                setParentComment(comment.parent_comment);
            }
        }
    }, [comment])

    const sortCommentHistory = (comment_history:any) => {
        return comment_history.sort(function(a:any, b:any) {
            let dateA = new Date((a.created_time as string));
            let dateB = new Date((b.created_time as string));
            return dateA.getTime() - dateB.getTime();      
        })
    }
    
    const goFBComment = () => {
        window.open(comment.permalink_url);
    }
    
    useEffect(() => {
        playerRef.current?.load();
    }, [comment])

    const renderMedia = () => {
        if (!Object.keys(comment.attachments).includes("media_type")) {
            return <></>
        }
        if (comment.attachments.media_type == "photo" ||
            comment.attachments.media_type == "alburm"
        ) {
            console.log(comment.attachments);
            return <Image src={comment.attachments.media.image.src} alt="post_photo" width='90%' radius='10px' />
        } else if (comment.attachments.media_type == "video") {
            return <video controls width="100%" style={{ borderRadius: '10px' }} ref={playerRef}>
                    <source src={comment.attachments.media.source} />
                </video>
        }
    }
    
    return (
        <Grid h={'100%'}>
            <Grid.Col md={6} lg={6} sm={12} h={'100%'}>
                <Box
                    sx={(theme) => ({
                        boxShadow: "0px 16px 32px -4px #919EAB3D",
                        borderRadius: 16,
                        height: '100%',
                        background: 'white',
                        border: `1px  solid ${isMobile?THEM_BORDER_COLOR:'white'}`
                    })}
                    p={13}
                >
                    <Text 
                        align={isMobile?'left':'center'} 
                        color={!isMobile?`#637381`:'#18232A'} size={14}
                        weight={isMobile?700:''}
                    >
                        New Comment Thread
                    </Text>
                    <Box h={'calc(100% - 0px)'}>
                        <ScrollArea
                            h={'100%'} type="auto" scrollHideDelay={2000}
                            p={24}
                        >
                            {
                                parentComment || Object.keys(parentComment).includes('from') ?
                                    <Box
                                        bg='#F5F4F0'
                                        p={5}
                                        style={{
                                            borderRadius: '8px'
                                        }}
                                    >
                                        <Flex
                                            justify={'space-between'}
                                            align={'center'}
                                        >
                                            <Flex
                                                gap={'md'}
                                            >
                                                <Text size={14} weight={600} pl={20}>
                                                    {
                                                        Object.keys(parentComment).includes("from") ? parentComment.from.name : ''
                                                    }
                                                </Text>
                                                <Text size={12} weight={400} pl={20}>
                                                    {convertTime(parentComment.created_time)}
                                                </Text>
                                            </Flex>
                                        </Flex>
                                        <Box
                                            sx={(theme) => ({
                                                borderRadius: '0px 7px 7px 7px'
                                            })}

                                            mt={10}
                                        >
                                            <Text color="#637381" size={14}>
                                                {parentComment.message}
                                            </Text>
                                        </Box>
                                    </Box> : <></>
                            }
                            <Box
                            >
                                {
                                    !subComments ?
                                        <></> :
                                        subComments.length == 0 ? <Flex justify={'center'}>
                                            {/* <h4>No Sub Comments</h4> */}
                                        </Flex> :
                                            subComments.map((item: any, key: number) =>
                                                <Box key={key}
                                                    mt={20}
                                                    bg='#F5F4F0'
                                                    p={10}
                                                    style={{
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    <Flex
                                                        gap={'md'}
                                                        justify={'space-between'}
                                                    >
                                                        <Text size={14} weight={600} pl={20}>
                                                            {
                                                                Object.keys(item).includes('from') ? item.from.name : ''
                                                            }
                                                        </Text>
                                                        <Text size={12} weight={400} pl={20} color="#919EAB">
                                                            {convertTime(item.created_time)}
                                                        </Text>
                                                    </Flex>
                                                    <Box
                                                        sx={(theme) => ({
                                                            borderRadius: '0px 7px 7px 7px'
                                                        })}
                                                        mt={10}
                                                    >
                                                        <Text color="#637381" size={14}>
                                                            {item.message}
                                                        </Text>
                                                    </Box>
                                                </Box>
                                            )
                                }
                                {
                                    isLoad ?
                                        <Flex align={'center'} justify={'center'}><Loader variant="bars"
                                            color={THEME_COLOR}
                                        /></Flex> :
                                        comment.from_name != "" ?
                                            <Box mt={20}
                                                p={10}
                                                style={{
                                                    borderRadius: '8px',
                                                    background: '#ECEDE7',
                                                }}
                                            >
                                                <Flex
                                                    gap={'md'}
                                                    justify={'space-between'}
                                                >
                                                    <Text size={14} weight={600}>
                                                        {
                                                            comment.from_name
                                                        }
                                                    </Text>
                                                    <Text size={12} weight={400} pl={20} color="#919EAB">
                                                        {convertTime(comment.create_time)}
                                                    </Text>
                                                </Flex>
                                                <Flex gap={10} justify={'space-between'}>
                                                    <Box
                                                        sx={(theme) => ({
                                                            borderRadius: '0px 7px 7px 7px'
                                                        })}
                                                        mt={10}
                                                    >
                                                        <Text color="#637381" size={14}>
                                                            {comment.message}
                                                        </Text>
                                                    </Box>
                                                    <Flex justify={'flex-end'} mt={5} gap={5}>
                                                        <AiFillEyeInvisible
                                                            color={comment.posted == 4 ? THEME_COLOR : '#919EAB'}
                                                            size={20} cursor={'pointer'} onClick={() => { postSuggestion('HIDE', 4) }} />
                                                        <IoHeart
                                                            color={comment.posted == 3 ? THEME_COLOR : '#919EAB'}
                                                            size={20} cursor={'pointer'} onClick={() => { postSuggestion('LIKE', 3) }}
                                                        />
                                                    </Flex>
                                                </Flex>
                                            </Box> : <h4>Select a comment</h4>
                                }
                            </Box>
                        </ScrollArea>
                    </Box>
                    {/* <LoadingOverlay visible={isLoad}  loaderProps={{ color: THEME_COLOR, type: 'bars' }} /> */}
                </Box>
            </Grid.Col>
            <Grid.Col md={6} lg={6} sm={12} h={'100%'}>
                <Box
                    sx={(theme) => ({
                        boxShadow: "0px 1px 2px 0px #919EAB3D",
                        borderRadius: 16,
                        background: 'white',
                        height: '100%',
                        border: `1px  solid ${isMobile?THEM_BORDER_COLOR:'white'}`
                    })}
                >
                    <ScrollArea
                        h={'100%'} type="auto" scrollHideDelay={2000}
                        p={15}
                    >
                        {
                            isLoad ?
                                <Flex align={'center'} justify={'center'}><Loader variant="bars"
                                    color={THEME_COLOR}
                                /></Flex> :
                                comment.post_caption == "" || !comment.post_caption ? <Text align="center">No Post Caption</Text> :
                                    <Box>
                                        {/* <ReactPlayer ref={playerRef} url={''} controls={true} /> */}
                                        <Flex justify={'center'} sx={(theme) => ({
                                            borderRadius: '10px'
                                        })}>
                                            {
                                                renderMedia()
                                            }
                                        </Flex>
                                        {
                                            
                                        }
                                        <Text mt={15} size={12} weight={500}
                                        >
                                            {
                                                !readCaption ? comment.post_caption.slice(0, 100) : comment.post_caption
                                            }
                                        </Text>
                                        {
                                            comment.post_caption.length < 100 ? <></> :
                                                <Flex justify={'flex-end'}>
                                                    <Button
                                                        sx={(theme) => ({
                                                            border: `1px solid  ${THEM_BORDER_COLOR}`,
                                                            borderRadius: 30
                                                        })}
                                                        onClick={() => { setReadCaption(p => !p) }}
                                                        className="transparent-button"
                                                    >
                                                        <Text size={12} weight={'bold'} color="black" className="body-normal">
                                                            {readCaption ? 'less' : 'read more'}
                                                        </Text>
                                                    </Button>
                                                </Flex>
                                        }
                                        <Flex align={'center'} justify={'center'} mt={30}>
                                            <Button
                                                variant="outline"
                                                sx={(theme) => ({
                                                    border: `1px solid  ${THEM_BORDER_COLOR}`,
                                                    borderRadius: 30,
                                                    background: comment.type == 'fb'?'white !important':'#E02D69 !important',
                                                    color: comment.type == 'fb'?'#1877F2 !important':'white !important'
                                                })}
                                                leftIcon={comment.type == 'fb'?<IconBrandFacebook />:<FaInstagram />}
                                                onClick={() => { goFBComment() }}
                                            >
                                                <Text size={12} className="body-normal">
                                                    Open with {comment.type == 'fb' ? 'Facebook' : 'Instagram'}
                                                </Text>
                                            </Button>
                                        </Flex>
                                    </Box>

                        }
                    </ScrollArea>
                </Box>
            </Grid.Col>
        </Grid>

    )
}



export default Board;