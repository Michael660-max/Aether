import { Router } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const router = Router();
const s3 = new S3Client({ region: process.env.AWS_REGION });

router.get("/presigned", async (req, res) => {
    const { filename, contentType } = req.query as {
        filename?: string,
        contentType?: string,
    }

    if (!filename || !contentType) {
        return res.status(400).json({ error: "filename & contentType required" });
    }

    const key = `${uuidv4()}_${filename}`
    const cmd = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
    });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
    console.log(url);
    res.json({ url, key })
})

export default router;