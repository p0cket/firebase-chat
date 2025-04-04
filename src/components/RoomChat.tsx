import { useState, useEffect, useRef } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  where,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore"
import { db, auth } from "../firebase/config"
import { LocationState, Message } from "../types/types"

export const RoomChat = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [roomName, setRoomName] = useState(state?.roomName || `Room ${roomId}`)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Check if room exists and user has access
  useEffect(() => {
    const checkRoomAccess = async () => {
      if (!roomId || !auth.currentUser) {
        navigate('/')
        return
      }

      try {
        // Try to find the room in the rooms collection
        const roomRef = doc(db, "rooms", roomId)
        const roomDoc = await getDoc(roomRef)

        if (!roomDoc.exists()) {
          // Try to find it by ID field
          const roomsQuery = query(collection(db, "rooms"), where("id", "==", roomId))
          const querySnapshot = await getDocs(roomsQuery) // Using getDocs instead of .get()
          
          if (querySnapshot.empty) {
            setError("Room not found")
            setLoading(false)
            return
          }
          
          // Room exists by ID field
          const roomData = querySnapshot.docs[0].data()
          setRoomName(roomData.name || `Room ${roomId}`)
          
          // Add user to room if not already a member
          if (!roomData.members?.includes(auth.currentUser.uid)) {
            await updateDoc(doc(db, "rooms", querySnapshot.docs[0].id), {
              members: arrayUnion(auth.currentUser.uid)
            })
          }
        } else {
          // Room exists by document ID
          const roomData = roomDoc.data()
          setRoomName(roomData.name || `Room ${roomId}`)
          
          // Add user to room if not already a member
          if (!roomData.members?.includes(auth.currentUser.uid)) {
            await updateDoc(roomRef, {
              members: arrayUnion(auth.currentUser.uid)
            })
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error checking room access:", error)
        setError("Failed to access room")
        setLoading(false)
      }
    }

    // Only run if not coming from room creation
    if (!state?.isNewRoom) {
      checkRoomAccess()
    } else {
      setLoading(false)
    }
  }, [roomId, navigate, state])

  // Set up message listener
  useEffect(() => {
    if (!roomId || loading) return
    
    // Create a query for messages in this room
    const messagesQuery = query(
      collection(db, "messages"),
      where("roomId", "==", roomId),
      orderBy("createdAt")
    )

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageData: Message[] = []
      snapshot.forEach((doc) => {
        messageData.push({ id: doc.id, ...doc.data() } as Message)
      })
      setMessages(messageData)
    })

    // Cleanup subscription
    return unsubscribe
  }, [roomId, loading])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !auth.currentUser || !roomId) return

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage.trim(),
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || "Anonymous",
        roomId: roomId,
      })
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-9rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Lobby
        </button>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-[calc(100vh-9rem)] max-w-2xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 dark:text-gray-200"
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{roomName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Room Code: {roomId}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back to Lobby
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-3 flex flex-col scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 my-10">
            No messages yet. Be the first to send a message!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.uid === auth.currentUser?.uid
                  ? "justify-end"
                  : "justify-start"
              } my-2`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.uid === auth.currentUser?.uid
                    ? "bg-blue-500 text-white rounded-br-none dark:bg-blue-600"
                    : "bg-gray-200 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-200"
                }`}
              >
                <div
                  className={`text-xs mb-1 font-medium ${
                    msg.uid === auth.currentUser?.uid
                      ? "text-blue-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {msg.displayName}
                </div>
                <div className="break-words">{msg.text}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="flex space-x-2 border-t border-gray-200 dark:border-gray-700 pt-4"
      >
        <div className="flex-1 relative">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value.slice(0, 500))}
            placeholder="Type a message"
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
          />
          {newMessage.length > 0 && (
            <span className="absolute right-3 bottom-2 text-xs text-gray-500 dark:text-gray-400">
              {newMessage.length}/500
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Send
        </motion.button>
      </form>
    </motion.div>
  )
}

export default RoomChat
