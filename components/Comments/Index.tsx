import {
    Box,
    Button,
    Flex,
    Grid,
    LoadingOverlay,
    Text
} from "@mantine/core";

import Comments from './Comments';
import Board from "./Board";
import Suggestions from "./Suggestions";
import { FC, useEffect, useState } from "react";
import { CommentState, CommentType } from "@/types/new_comments";
import { comment } from "postcss";
import axios from "axios";
import { notifications } from '@mantine/notifications';

interface Props {
    brand_id: string
}

const NewComments: FC<Props> = ({
    brand_id
}) => {

    const [comments, setComments] = useState<CommentType[]>([]);
    const [selComment, setSelComment] = useState<CommentType>(CommentState);
    const [isLoad, setIsLoad] = useState<boolean>(false);
    const [status, setStatus] = useState<boolean>(false);
    const [elementsHeight, setElementHeight] = useState<number[]>([])
    const [isPosting, setIsPosting] = useState<boolean>(false);
    const getElementsHeight = () => {
        const height = window.innerHeight - 415;
    }

    const getComments = async () => {
        setIsLoad(true);
        try {
            const res = await fetch("/api/new_comments/get_comments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    brand_id
                }),
            });
            if (res.status == 200) {
                const data = sortComments(await res.json());
                setComments(data);
                for(let k=0; k<data.length; k++){
                    if(!data[k].read){
                        setSelComment(data[k]);
                        break;
                    }
                }
            } else {
                
            }
        } catch (e) {

        }
        setIsLoad(false);
    }

    function compareDates(item1: any, item2: any) {
        return (new Date(item2.create_time).getTime()) - (new Date(item1.create_time).getTime())
    }

    const sortComments = (comments: CommentType[]) => {
        const _comment: CommentType[] = [];
        for (let k = comments.length - 1; k >= 0; k--) {
            _comment.push(comments[k]);
        }
        return comments.sort(compareDates);
    }

    useEffect(() => {
        getElementsHeight();
        getComments();
    }, [brand_id])

    const getAccessToken = async (comment_id: string) => {
        let access_token = false;
        const res = await fetch("/api/train/get_access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment_id }),
        });
        if (res.ok) {
            if (res.status == 200) {
                const data = await res.json();
                access_token = data.access_token;
            }
        }
        return access_token;
    }

    const postSuggestion = async (suggestion: string, index: number) => {

        const comment_id = selComment.comment_id;
        setIsPosting(true);
        const access_token = await getAccessToken(comment_id);
        if (!access_token) {
            alert("Can't find the matched access_token. Please check comment data.");
            setIsPosting(false);
            return;
        }
        
        if(selComment.type == 'fb'){
            if (suggestion == "LIKE") {
                if(selComment.posted == 3) {
                    notifications.show({
                        message: 'Comment already like',
                    })
                    setIsPosting(false);

                    return;
                }
                await axios.post(
                    `https://graph.facebook.com/${comment_id}/likes?access_token=${access_token}`
                );
            } else if (suggestion == "HIDE") {
                if(selComment.posted == 4) {
                    notifications.show({
                        message: 'Comment already hidden',
                    })
                    setIsPosting(false);
                    return;
                }
                await axios.post(
                    `https://graph.facebook.com/${comment_id}?access_token=${access_token}&is_hidden=true`
                );
            } else {
                await axios.post(
                    `https://graph.facebook.com/${comment_id}/comments?access_token=${access_token}`,
                    {
                        message: suggestion,
                    }
                );
            }
        } else if(selComment.type == 'ig') {    
            if (suggestion == "LIKE") {
                // await axios.post(
                //   `https://graph.facebook.com/${comment_id}/likes?access_token=${access_token}`
                // );
            } else if (suggestion == "HIDE") {
                await axios.post(
                    `https://graph.facebook.com/v18.0/${comment_id}?access_token=${access_token}&hide=true`
                );
            } else {
                await axios.post(
                    `https://graph.facebook.com/v18.0/${comment_id}/replies?access_token=${access_token}&message=${suggestion}`,
                    {
                        message: suggestion,
                    }
                );
            }
        }
        

        const res = await fetch('/api/new_comments/save_suggestion/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment_id, brand_id, suggestion_id: index, suggestion, type:selComment.type}),
        });
        
        if (res.ok) {
            notifications.show({
                message: 'Posted Successfully',
            })
        }
        setIsPosting(false);
        getComments();
    };

    useEffect(() => {
        setUnreadToRead(selComment.id);
    }, [selComment])

    const setUnreadToRead = async (id: string) => {        
        const res = await fetch('/api/new_comments/set_read_comments', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id
            }),
        })
    }

    return (
        <Box
            className="new-comments"
            mt={-30}
            h={'calc(100vh - 90px)'}
        >
            
            <Grid mt={30} h={'100%'}>
                <Grid.Col md={12} lg={3} sm={12} h={'100%'}>
                    <Comments
                        comments={comments}
                        setSelComment={(comment: CommentType) => { setSelComment(comment) }}
                        selComment={selComment}
                        isLoad={isLoad}
                        getComments={getComments}
                        brand_id={brand_id}
                    />
                </Grid.Col>
                <Grid.Col md={12} lg={9} sm={12} 
                    h={'100%'}
                >
                    <Box h={'100%'}>
                        <Box
                            h={{base: 'auto',  lg: 'calc(70%)'}}
                        >
                            <Board
                                comment={selComment}
                                isLoad={isLoad}
                                postSuggestion={postSuggestion}
                                isPosting={isPosting}
                            />
                        </Box>
                        <Box
                            mt={20}
                            h={{base: 'auto',  lg: 'calc(30%)'}}
                        >
                            <Suggestions
                                comment={selComment}
                                brand_id={brand_id}
                                getComments={getComments}
                                postSuggestion={postSuggestion}
                                isPosting={isPosting}
                            />
                        </Box>
                    </Box>
                </Grid.Col>
            </Grid>
            
        </Box>
    )
}

export default NewComments;