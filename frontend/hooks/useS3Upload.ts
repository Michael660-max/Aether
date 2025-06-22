import { getPresignedUrl } from '../Services/UploadService'

export async function useS3Upload(file: File) {
    console.log(file);
    // Do not need key now but that is a param
    const { url: presignedUrl } = await getPresignedUrl(file);

    await fetch(presignedUrl, {
        method: "PUT",
        body: file,
    });

    const publicUrl = presignedUrl.split("?", 1)[0];
    return publicUrl;
}