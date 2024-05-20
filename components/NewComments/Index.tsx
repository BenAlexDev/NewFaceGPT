import {
    Box,
    Button,
    Flex,
    Grid
} from "@mantine/core";

import Comments from './Comments';
import Board from "./Board";
import Suggestions from "./Suggestions";
import { FC, useEffect, useState } from "react";
import { CommentState, CommentType } from "@/types/new_comments";
import { comment } from "postcss";
import { IconLoader, IconRefresh } from "@tabler/icons-react";
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
                if (data.length > 0) {
                    setSelComment(data[0]);
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
        for(let k=comments.length-1; k>=0; k--){
            _comment.push(comments[k]);
        }
        return comments.sort(compareDates);
    }
    useEffect(() => {
        getComments();
    }, [])
    
    return (
        <Box
            className="new-comments"
            sx={(theme) => ({
                height: '100%'
            })}
            p={15}
        >
            <Flex justify={'flex-end'}>
                <Button color="green" 
                disabled={isLoad}
                leftIcon={
                    isLoad?<IconLoader />:<IconRefresh size={16} />
                }
                    onClick={() => {getComments()}}
                >
                    Reload
                </Button>
            </Flex> 
            <Grid mt={30}>
                <Grid.Col md={3} lg={3} sm={12}>
                    <Comments
                        comments={comments}
                        setSelComment={(comment: CommentType) => { setSelComment(comment) }}
                        selComment={selComment}
                    />
                </Grid.Col>
                <Grid.Col md={9} lg={9} sm={12}
                    sx={(theme) => ({

                    })}
                >
                    <Box>
                        <Board
                            comment={selComment}
                        />
                        <Box
                            mt={20}
                        >
                            <Suggestions
                                comment={selComment}
                                brand_id={brand_id}
                                getComments={getComments}
                            />
                        </Box>
                    </Box>
                </Grid.Col>
            </Grid>
            <Box mt={20}>
                {
                    selComment.prompt
                }
            </Box>
        </Box>
    )
}

export default NewComments;