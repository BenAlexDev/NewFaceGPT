import { CommentType } from "@/types/new_comments";
import { Box, Flex, Grid, Loader, LoadingOverlay, Text, Textarea, Badge } from "@mantine/core";
import { IconPencil, IconSend } from "@tabler/icons-react";
import { useChat } from "ai/react";
import { FC, useEffect, useState } from "react";
import ChatMessage from "../Playground/ChatMessage";
import axios from "axios";
import { notifications } from '@mantine/notifications';

interface Props {
    comment: CommentType;
    brand_id: string;
    getComments: () => void;
}

const Suggestions: FC<Props> = ({ comment, brand_id, getComments }) => {
    const [suggestions, setSuggestions] = useState<string[]>(["1", "2", "3"]);
    const [isEdit, setIsEdit] = useState<boolean[]>([false, false, false]);
    const [isPosting, setIsPosting] = useState<boolean>(false);
    const { messages, append, setMessages, reload, isLoading } = useChat({
        api: "/api/playground/chat",
        initialInput: "test",
        body: {
            brand_id,
            query: `what's wunderein`,
            options: {
                post_caption: "",
                current_comment: "",
                comment_history: "",
                store_answers: false,
                include_comments: false,
            },
        },
    });

    useEffect(() => {
        const prompt = "";
        // setMessages([]);
        // append({
        //     content: 'test',
        //     role: "user",
        //     createdAt: new Date()
        // });
        setSuggestions(comment.suggestions);
    }, [comment]);

    useEffect(() => {
        /*
            if (!isLoading) {
                try {
                    console.log(messages);
                    if (messages?.[1]) {
                        const content: any = JSON.parse((messages as any)[1].content);
                        console.log(content);
                        const parsed_content = JSON.parse(content[0].message.content);
                        console.log(parsed_content);
                        setSuggestions(parsed_content);
                    } else {
                        setSuggestions([]);
                    }
                } catch (e) {
                    setSuggestions([]);
                }
            }
            */
    }, [isLoading]);

    const postSuggestion = async (index: number) => {
        const suggestion = suggestions[index];
        const comment_id = comment.comment_id;
        setIsPosting(true);

        const access_token = await getAccessToken(comment_id);
        if (!access_token) {
            alert("Can't find the matched access_token. Please check comment data.");
            setIsPosting(false);
            return;
        }
        
        if (suggestion == "LIKE") {
            await axios.post(
                `https://graph.facebook.com/${comment_id}/likes?access_token=${access_token}`
            );
        } else if (suggestion == "HIDE") {
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

        const res = await fetch('/api/new_comments/save_suggestion/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment_id, brand_id, suggestion_id: index, suggestion }),
        });

        if (res.ok) {
            notifications.show({
                message: 'Posted Successfully',
            })
        }
        setIsPosting(false);
        getComments();
    };

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
    return (
        isLoading ?
            <Flex justify={'center'} mih={100} w={'100%'}
                sx={(theme) => ({
                    boxShadow: "0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)"
                })}
                align={'center'}
            >
                <Loader />
            </Flex> :
            suggestions.length == 0 ?
                <Flex justify={'center'} mih={100} w={'100%'}
                    sx={(theme) => ({
                        boxShadow: "0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)"
                    })}
                    align={'center'}
                >
                    <Text>
                        No Generated Suggestions!
                    </Text>
                </Flex> :
                <Grid gutter={10} h={'25%'}>
                    {
                        suggestions.map((item: string, key: number) =>
                            <Grid.Col md={4} lg={4} sm={12} key={key}>
                                <Box>
                                    {
                                        isPosting ? <Flex align={'center'} justify={'center'} mt={20} p={15}
                                            sx={(theme) => ({
                                                boxShadow: "0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)"
                                            })}>
                                            <Loader />
                                        </Flex> :
                                            <Box
                                                p={15}
                                                sx={(theme) => ({
                                                    boxShadow: "0 2px 3px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19)"
                                                })}
                                            >
                                                <Flex justify={'flex-end'} gap={'md'}>
                                                    {
                                                        comment.posted == key ? <Badge>
                                                            Posted
                                                        </Badge>
                                                            : <></>
                                                    }
                                                    <IconPencil color="gray" cursor={'pointer'}
                                                        onClick={() => {
                                                            const _isEdit = JSON.parse(JSON.stringify(isEdit));
                                                            // setIsEdit((p_edit) => (p_edit[key]!=p_edit[key]))
                                                            _isEdit[key] = !_isEdit[key];
                                                            setIsEdit(_isEdit);
                                                        }}
                                                    />
                                                </Flex>
                                                <Text mt={10}>
                                                    {
                                                        isEdit[key] ?
                                                            <Textarea
                                                                value={item}
                                                                onChange={(event) => {
                                                                    const suggestions_ = JSON.parse(JSON.stringify(suggestions));
                                                                    console.log(event.currentTarget.value);
                                                                    suggestions_[key] = event.currentTarget.value;
                                                                    console.log(suggestions_);
                                                                    setSuggestions(suggestions_);
                                                                }}
                                                                minRows={10}
                                                            /> :
                                                            <ChatMessage
                                                                message={item}
                                                            />
                                                    }
                                                </Text>
                                                <Flex justify={'flex-end'} mt={15}>

                                                    <IconSend color="#109CF1" cursor={'pointer'}
                                                        onClick={() => { postSuggestion(key) }}
                                                    />
                                                </Flex>

                                            </Box>
                                    }
                                </Box>
                            </Grid.Col>
                        )
                    }
                </Grid>
    )
}

export default Suggestions;