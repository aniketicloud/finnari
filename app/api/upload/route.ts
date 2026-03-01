// app/api/upload/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { NextRequest, NextResponse } from "next/server"

const s3 = new S3Client({
  endpoint: process.env.BACKBLAZE_ENDPOINT!,
  region: process.env.BACKBLAZE_REGION!,
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_APP_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = `uploads/${Date.now()}-${file.name}`

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    })
  )

  //   const fileUrl = `${process.env.BACKBLAZE_ENDPOINT}/${process.env.BACKBLAZE_BUCKET_NAME}/${fileName}`

  return NextResponse.json({ key: fileName })
}
