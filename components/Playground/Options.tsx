import {
    Checkbox,
    JsonInput,
    Textarea,
    Flex
} from "@mantine/core";
import { FC } from "react";

interface Props {
    commentForm: any
}

const Options:FC<Props> = ({commentForm}) => {
    
    return (
        <Flex
            direction="column"
            gap="lg"
        >
            <Checkbox
                label="Store answers"
                value={commentForm.values.store_answers}
                onChange={(event) => {commentForm.setFieldValue('store_answers', event.target.checked)}}
            />
            <Checkbox
                label="Inclue comments"
                value={commentForm.values.include_comments}
                onChange={(event) => {commentForm.setFieldValue('include_comments', event.target.checked)}}
            />
            {

                commentForm.values.include_comments&&<Flex
                    direction="column"
                    gap="lg"
                >
                    <Textarea
                        placeholder=""
                        label="Post Caption"
                        autosize
                        minRows={4}
                        maxRows={6}
                        value={commentForm.values.post_caption}
                        onChange={(event) => { commentForm.setFieldValue('post_caption', event.currentTarget.value) }}
                    />
                    <Textarea
                        label="Comment History"
                        placeholder=""
                        autosize
                        minRows={4}
                        maxRows={6}
                        value={commentForm.values.comment_history}
                        onChange={(event) => { commentForm.setFieldValue('comment_history', event.currentTarget.value) }}
                    />
                    
                </Flex>
            }
            
        </Flex>
    )
}

export default Options;