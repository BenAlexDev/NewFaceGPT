import { Box, Textarea } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { FC, useState, useEffect } from 'react';
import { LoaderIcon } from "react-hot-toast";

interface Props {
    onSend: () => void
    input_content: string,
    setInputContent: (input: string) => void,
    inputError: string,
    messageIsStreaming: boolean
}

const ChatInput:FC<Props> = ({
    input_content,
    onSend,
    setInputContent,
    inputError,
    messageIsStreaming
}) => {
    
    const [textError, setTextError] = useState<string>();
    
    useEffect(() => {
        setTextError(inputError);   
    }, [inputError]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        setInputContent(value);
    }   
    
    const handleKeyDown = (e: any) => {
        if(e.key == "Enter" && !e.shiftKey && !messageIsStreaming) {
            e.preventDefault();
            handleSend();
            setInputContent("")
        }
    }
        
    const handleSend = () => {
        if (input_content == "") {
            setTextError("Please enter a message");
            return;
        }

        setTextError("");
        onSend();
    };

    return(
        <Box>
            <Textarea
                className='w-full'
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                rightSection={
                    <Box
                        pr={20}
                    >
                        {
                            messageIsStreaming?
                            <LoaderIcon style={{width: '20px', height: '20px'}}></LoaderIcon>:
                            <IconSend size="1rem" className="opacity-[0.5] display-block cursor-pointer" onClick={() => {handleSend()}} />
                        }
                    </Box>
                }
                value={input_content}
                error={textError}
                sx={(theme) =>({
                    border: 'none',
                    background: 'transparent'
                })}
           />
        </Box>
    )
}

export default ChatInput;