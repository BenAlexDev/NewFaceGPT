import { Box, Flex, Loader, Text } from "@mantine/core";
import ChatInput from "@/components/Playground/ChatInput";
import ChatMessage from "@/components/Playground/ChatMessage";
import { FC, useState } from 'react';
import { useChat } from "ai/react";
import Options from "@/components/Playground/Options";
import { useForm } from '@mantine/form';

interface Props {
    brand_id: string
}

const Playground: FC<Props> = ({
    brand_id
}) => {

    const [inputContent, setInputContent] = useState<string>('');
    const [inputError, setInputError] = useState('');
    const [messageIsStreaming, setMessageIsStreaming] = useState<boolean>(false);
    const [fullPrompt, setFullPrompt] = useState<string>('');

    const commentForm = useForm({
        initialValues: {
            post_caption: '',
            current_comment: '',
            comment_history: '',
            store_answers: false,
            include_comments: false
        },
    });

    const { messages, append, setMessages, reload, isLoading } = useChat({
        api: '/api/playground/chat', initialInput: 'test',
        body: {
            brand_id,
            query: inputContent,
            options: commentForm.values
        }
    });

    const handleSend = async () => {
        setMessages([]);
        setFullPrompt("");
        getPrompt(brand_id);

        append({
            content: 'test',
            role: "user",
            createdAt: new Date()
        })
    }

    const getPrompt = async (brand_id: string) => {
        const res = await fetch('/api/playground/get_prompt_console',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    brand_id,
                    query: inputContent,
                    options: commentForm.values
                }),
            }
        )
        if(res.status == 200) {
            const data = await res.json();
            console.log(data.prompt);
            setFullPrompt(data.prompt);
        } else {

        }
    }

    const parseMessage = () => {
        try{
            console.log(messages);
            if(messages?.[1]){
                const content: any = JSON.parse((messages as any)[1].content);
                return content[0].message.content+'\n\n\n\n\n---------Prompt---------\n\n\n\n\n\n'+fullPrompt;
            } else {
                return ''
            }
        }catch(e) {
            console.log("--------------Error----------------");
            console.log(e);
            return '';
        }
    }
    return (
        <Flex
            pt={20}
            gap="lg"
            justify="flex-start"
            align="flex-start"
            direction="row"
            wrap="wrap"
        >
            <Box
                style={{ width: '30%' }}
            >
                <Options
                    commentForm={commentForm}
                />
            </Box>
            <Box
                style={{ width: '65%' }}

            >
                <ChatInput
                    onSend={handleSend}
                    input_content={inputContent}
                    inputError={inputError}
                    messageIsStreaming={isLoading}
                    setInputContent={(content: string) => { setInputContent(content) }}
                />
                {
                    isLoading && messages.length == 0 ?
                        <Flex
                            gap='sm'
                            m={15}
                        >
                            <Text>Thinking</Text>
                            <Loader variant="dots"></Loader>
                        </Flex> :
                        <ChatMessage
                            // message={messages?.[1]?.content?messages?.[1]?.content+'\n\n\n\n\n---------Prompt---------\n\n\n\n\n\n'+fullPrompt:messages?.[1]?.content}
                            message={parseMessage()}
                        />
                }

            </Box>

        </Flex>
    )
}

export default Playground;