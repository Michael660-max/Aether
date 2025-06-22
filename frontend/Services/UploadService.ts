import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function getPresignedUrl(file: File) {
    const { data } = await axios.get<{ url: string, key: string }>(
        `${API}/s3/presigned`,
        {
            params:
            {
                filename: file.name,
                contentType: file.type
            },
        }
    );
    return data;
}