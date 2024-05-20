
import { EMBEDDING_MODEL } from '@/utils/server/consts';

export const createEmbedding = async(
    input: string
) => {
    
    const res = await fetch('https://api.openai.com/v1/embeddings', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY_3}`,
            },
            method: 'POST',
                body: JSON.stringify({
                model: EMBEDDING_MODEL,
                input: input.trim().replaceAll('\n', ' '),
            }),
    }).then((r) => r.json());
    
    return {embedding: res, content: input};
    
}
