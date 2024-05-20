import { THEME_COLOR, THEM_BORDER_COLOR, THEM_SPLITER_COLOR } from "@/utils/app/consts";
import { Box, Button, Flex, Grid, Loader, Modal, Text, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSend } from "@tabler/icons-react";
import { useChat } from "ai/react";
import { FC, useEffect, useState } from "react";

interface Props {
    open: boolean,
    close: () => void;
    brand_id: string
}
const TestingModal: FC<Props> = ({
    open,
    close,
    brand_id
}) => {
    const [query, setQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const form = useForm({
        initialValues: {
            post_caption: "",
            current_comment: "",
            comment_history: "",
            include_comments: true
        },
        validate: {
            post_caption: (val: string) =>
                val.length <= 8
                    ? "post caption should include at least 8 characters"
                    : null,
            current_comment: (val: string) =>
                val.length <= 8
                    ? "post caption should include at least 8 characters"
                    : null,
            comment_history: (val: string) =>
                val.length <= 8
                    ? "post caption should include at least 8 characters"
                    : null,
        },
    });

    const getSuggest = async () => {
        setMessages([]); 
        append({
            content: 'test',
            role: "user",
            createdAt: new Date()
        })
    }

    const { messages, append, setMessages, reload, isLoading } = useChat({
        api: '/api/playground/chat', initialInput: 'test',
        body: {
            brand_id,
            query: form.values.current_comment,
            options: form.values
        }
    });

    useEffect(() => {
        if (messages.length > 1) {
            if (messages?.[1]) {
                let _suggestions = ["I'm not sure", "I'm not sure","I'm not sure"]
                try{
                    const content: any = JSON.parse((messages as any)[1].content);
                    _suggestions = JSON.parse(content[0].message.content);
                    console.log("-----Prompt----")
                    console.log(content[0].text);
                }catch(e){

                }
                setSuggestions(_suggestions);
            }
        }
    }, [isLoading])
    return (
        <Modal fullScreen opened={open} onClose={close} style={{zIndex: 10000}}>
            <Box >
                <Text size={24} className="headerline">
                    Manual Testing
                </Text>
                
            </Box>
            <Flex gap={20} direction={'column'} mt={30}>
                <Textarea
                    minRows={5}
                    placeholder="Write Post Caption here..."
                    {...form.getInputProps('post_caption')}
                    onChange={(event) =>
                        form.setFieldValue("post_caption", event.currentTarget.value)
                    }
                />
                <Textarea
                    minRows={5}
                    placeholder="Write Comment History here..."
                    {...form.getInputProps('comment_history')}
                    onChange={(event) =>
                        form.setFieldValue("comment_history", event.currentTarget.value)
                    }
                />
                <Textarea
                    minRows={5}
                    placeholder="Write Current Comment here..."
                    {...form.getInputProps('current_comment')}
                    onChange={(event) =>
                        form.setFieldValue("current_comment", event.currentTarget.value)
                    }
                />
                {/* <Textarea
                    minRows={5}
                    placeholder="Write Query..."
                    value={query}
                    onChange={(event) => { setQuery(event.currentTarget.value) }}
                /> */}
            </Flex>
            <Flex mt={20} justify={'flex-end'}>
                <Button
                    variant="outline"
                    sx={(theme) => ({
                        border: `1px solid ${THEM_BORDER_COLOR}`
                    })}
                    leftIcon={<IconSend size={15} color="#1F2A37" fontWeight={500} />}
                    radius={30}
                    onClick={() => {
                        getSuggest()
                    }}
                >
                    <Text color="#1F2A37" size={12} weight={600} >Get suggested answers</Text>
                </Button>
            </Flex>
            {
                isLoading ?
                    <Flex justify={'center'} align={'center'} w={'100%'}>
                        <Loader variant="bars" color={THEME_COLOR} mt={20} />
                    </Flex> :
                    <Grid>
                        {
                            suggestions.map((item: string, key: number) =>
                                <Grid.Col md={4} lg={4} sm={1} key={key}>
                                    <Box
                                        sx={(theme) => ({
                                            boxShadow: "0 4px 7px -2px rgba(0, 0, 0, 0.19)",
                                            boder: `1px solid ${THEM_SPLITER_COLOR}`,
                                            borderRadius: 10
                                        })}
                                    >
                                        <Box pt={15} pb={15} pl={15} sx={(theme) => ({
                                            borderBottom: `1px solid ${THEM_SPLITER_COLOR}`
                                        })}>
                                            <Text>
                                                {
                                                    key == 0 ? 'Favorite answer' : `Alternative${key}`
                                                }

                                            </Text>
                                        </Box>
                                        <Box p={15}>
                                            {
                                                item
                                            }
                                        </Box>
                                    </Box>
                                </Grid.Col>
                            )
                        }
                    </Grid>

            }
        </Modal>
    )
}
export default TestingModal;