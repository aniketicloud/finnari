"use client"
import { useState } from "react"

export default function UploadPage() {
  const [imageKey, setImageKey] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = await res.json()
    setImageKey(data.key) // store the key, not a URL
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} />
      {imageKey && (
        <img src={`/api/image?key=${imageKey}`} alt="Uploaded" width={300} />
      )}
    </div>
  )
}
