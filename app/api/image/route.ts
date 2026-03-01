// app/api/image/route.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { NextRequest, NextResponse } from "next/server"

const s3 = new S3Client({
  endpoint: process.env.BACKBLAZE_ENDPOINT!,
  region: process.env.BACKBLAZE_REGION!,
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_APP_KEY!,
  },
})

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key")

  if (!key) {
    return NextResponse.json({ error: "No key provided" }, { status: 400 })
  }

  const command = new GetObjectCommand({
    Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
    Key: key, // e.g. "uploads/1772385156980-download.jpg"
  })

  // URL expires in 60 seconds — useless after that
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 })

  // Redirect directly to the signed URL
  return NextResponse.redirect(signedUrl)
}
