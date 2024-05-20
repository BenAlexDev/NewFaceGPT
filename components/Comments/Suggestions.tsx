import { CommentType } from "@/types/new_comments";
import { Box, Flex, Grid, Loader, LoadingOverlay, Text, Textarea, Badge, Button, ScrollArea } from "@mantine/core";
import { IconPencil, IconSend } from "@tabler/icons-react";
import { FaPen } from "react-icons/fa";
import { useChat } from "ai/react";
import { FC, useEffect, useState } from "react";
import axios from "axios";
import { MOBILE_MODE_SIZE, THEME_COLOR, THEM_BORDER_COLOR } from "@/utils/app/consts";
import { IoSendSharp } from "react-icons/io5";
import { useMediaQuery } from '@mantine/hooks';

interface Props {
    comment: CommentType;
    brand_id: string;
    getComments: () => void;
    isPosting: boolean;
    postSuggestion: (suggestion: string, index: number) => void
}

const Suggestions: FC<Props> = ({ comment, brand_id, getComments, isPosting, postSuggestion }) => {
    const [suggestions, setSuggestions] = useState<string[]>(["1", "2", "3"]);
    const [isEdit, setIsEdit] = useState<boolean[]>([false, false, false]);
    const isMobile = useMediaQuery(`(max-width: ${MOBILE_MODE_SIZE}px)`);

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
        if (isEdit.filter(item => !item).length == 3 && suggestions[0] != "1") {
            editSuggestions();
        }
    }, [isEdit])

    const editSuggestions = async () => {
        const res = await fetch('/api/new_comments/edit_suggestions', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id:comment.id,
                suggestions: suggestions
            }),
        })
    }

    useEffect(() => {
        setSuggestions(comment.suggestions);
        setIsEdit([false, false, false])
    }, [comment]);

    useEffect(() => {
    }, [isLoading]);

    return (
        isLoading ?
            <Flex justify={'center'} mih={100} w={'100%'}
                sx={(theme) => ({
                    boxShadow: "0px 1px 2px 0px #919EAB3D",
                })}
                align={'center'}
            >
                <Loader color={THEME_COLOR} />
            </Flex> :
            suggestions.length == 0 ?
                <Flex justify={'center'} mih={100} w={'100%'}
                    sx={(theme) => ({
                        boxShadow: "0px 1px 2px 0px #919EAB3D",
                        border: `1px  solid ${isMobile ? THEM_BORDER_COLOR : 'white'}`

                    })}
                    align={'center'}
                >
                    <Text>
                        No Generated Suggestions!
                    </Text>
                </Flex> :
                <Box h={'100%'}>
                    <Grid gutter={10} h={{ base: 'auto', md: 'calc(100%)' }}>
                        {
                            suggestions.map((item: string, key: number) =>
                                <Grid.Col md={4} lg={4} sm={12} key={key} h={'100%'}>
                                    <Box h={'100%'}>
                                        {
                                            isPosting ? <Flex align={'center'} justify={'center'} mt={20} p={15}
                                                sx={(theme) => ({
                                                    boxShadow: "0px 1px 2px 0px #919EAB3D",
                                                    borderRadius: 10
                                                })}>
                                                <Loader color={THEME_COLOR} />
                                            </Flex> :
                                                <Box
                                                    sx={(theme) => ({
                                                        boxShadow: "0px 1px 2px 0px #919EAB3D",
                                                        borderRadius: 10,
                                                        background: 'white'
                                                    })}
                                                    h={'100%'}
                                                >
                                                    <Box sx={(theme) => ({
                                                        position: 'relative',
                                                        top: '10px',
                                                        right: '10px'
                                                    })}>
                                                        <Flex justify={'flex-end'} gap={'md'}>
                                                            {
                                                                comment.posted == key ? <Badge size="lg">
                                                                    Posted
                                                                </Badge>
                                                                    : <></>
                                                            }
                                                        </Flex>
                                                    </Box>
                                                    <Box h={`calc(100% - ${comment.posted == key ? 95 : 70}px)`}>
                                                        <ScrollArea
                                                            type="auto" scrollHideDelay={2000}
                                                            p={15}
                                                            h={'100%'}
                                                        >
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
                                                                    <Text size={14} color="#637381" className="headline">
                                                                        {
                                                                            item
                                                                        }
                                                                    </Text>
                                                            }
                                                        </ScrollArea>
                                                    </Box>
                                                    <Flex justify={'flex-start'} p={15} gap={15}
                                                        sx={(theme) => ({
                                                            borderTop: `1px solid ${THEM_BORDER_COLOR}`
                                                        })}
                                                    >
                                                        <Button
                                                            radius={32}
                                                            sx={(theme) => ({
                                                                border: `1px solid ${THEM_BORDER_COLOR}`
                                                            })}
                                                            variant="outline"
                                                            onClick={() => {
                                                                const _isEdit = JSON.parse(JSON.stringify(isEdit));
                                                                _isEdit[key] = !_isEdit[key];
                                                                setIsEdit(_isEdit);
                                                            }}
                                                            className="transparent-button"
                                                        >
                                                            <Flex gap={8} align={'center'}>
                                                                <FaPen color="#1F2A37" size={12} />
                                                                <Text size={12} className="body-normal" color="#18232A">
                                                                    Edit
                                                                </Text>
                                                            </Flex>
                                                        </Button>
                                                        <Button
                                                            sx={(theme) => ({
                                                                color: '#18232A',
                                                                '&:hover': {
                                                                    background: '#eded15'
                                                                }
                                                            })}
                                                            bg={"#E0E049"}
                                                            radius={32}
                                                            onClick={() => { postSuggestion(suggestions[key], key) }}
                                                            className="button-background"
                                                        >
                                                            <Flex gap={8} align={'center'}>
                                                                <IoSendSharp color="#1F2A37" size={12} />
                                                                <Text size={12} className="body-normal" color="#18232A">
                                                                    Send
                                                                </Text>
                                                            </Flex>
                                                        </Button>
                                                    </Flex>
                                                </Box>
                                        }
                                    </Box>
                                </Grid.Col>
                            )
                        }
                    </Grid>
                </Box>

    )
}

export default Suggestions;