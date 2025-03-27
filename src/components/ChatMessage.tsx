import React from "react"
import { getAuth } from "firebase/auth"
import { ChatMessageType } from "../types"

function ChatMessage(props: ChatMessageType) {
  const auth = getAuth()
  const { text, uid, photoURL, displayName } = props.message

  const messageClass = uid === auth.currentUser?.uid ? "sent" : "received"

  // Function to generate avatar based on photoURL or initials
  const getAvatar = () => {
    if (photoURL) {
      return <img src={photoURL} alt="User avatar" className="h-10 w-10 rounded-full object-cover" />
    } else if (displayName) {
      const initials = displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
      const dicebearUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        initials
      )}`
      return <img src={dicebearUrl} alt={`${initials} avatar`} className="h-10 w-10 rounded-full" />
    } else {
      const randomAvatarUrl = "https://api.dicebear.com/7.x/avataaars/svg"
      return <img src={randomAvatarUrl} alt="Random user avatar" className="h-10 w-10 rounded-full" />
    }
  }

  return (
    <div className={`flex items-start gap-2 my-2 ${messageClass === "sent" ? "flex-row-reverse ml-auto" : ""}`}>
      <div className="flex-shrink-0">
        {getAvatar()}
      </div>
      <div className={`flex flex-col max-w-[70%] ${messageClass === "sent" ? "items-end" : "items-start"}`}>
        {displayName && <span className="text-xs text-gray-500 mb-1">{displayName}</span>}
        <div className={`px-4 py-2 rounded-lg ${
          messageClass === "sent" 
            ? "bg-blue-500 text-white rounded-tr-none" 
            : "bg-gray-200 text-gray-800 rounded-tl-none"
        }`}>
          <p className="text-sm break-words">{text}</p>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage
