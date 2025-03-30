import { useState, useEffect, useRef } from "react"
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore"
import { db, auth } from "../firebase/config"

interface Message {
  id: string
  text: string
  uid: string
  displayName: string
  createdAt: any
}

// Dummy user constants
const DUMMY_USER_ID = "dummy-user-123"
const DUMMY_USER_NAME = "Test User"

export const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showDummyUser, setShowDummyUser] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Query to get messages ordered by timestamp
    const messagesQuery = query(
      collection(db, "messages"),
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
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !auth.currentUser) return

    // Store the message text before clearing the input
    const messageText = newMessage.trim()

    try {
      await addDoc(collection(db, "messages"), {
        text: messageText,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || "Anonymous",
      })
      setNewMessage("")

      // If dummy user is enabled, send a response after a short delay
      if (showDummyUser) {
        setTimeout(() => sendDummyMessage(messageText), 1000)
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const sendDummyMessage = async (originalMessage: string) => {
    try {
      await addDoc(collection(db, "messages"), {
        text: `This is a response from the dummy user to: "${originalMessage}"`,
        createdAt: serverTimestamp(),
        uid: DUMMY_USER_ID,
        displayName: DUMMY_USER_NAME,
      })
    } catch (error) {
      console.error("Error sending dummy message:", error)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] max-w-2xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Chat Room</h2>
        {/* <div className="flex items-center">
          <span className="mr-2 text-sm">Test Mode:</span>
          <button
            onClick={() => setShowDummyUser(!showDummyUser)}
            className={`px-3 py-1 rounded-md text-sm ${
              showDummyUser
                ? "bg-green-500 text-white"
                : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {showDummyUser ? "On" : "Off"}
          </button>
        </div> */}
      </div>

      <div className="flex-1 overflow-y-auto mb-4 p-3 flex flex-col scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {messages.map((msg) => (
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
                {msg.displayName} {msg.uid === DUMMY_USER_ID && "(Test User)"}
              </div>
              <div className="break-words">{msg.text}</div>
            </div>
          </div>
        ))}
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
              {newMessage.length}/256
            </span>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  )
}

// //
// import { useState, useEffect, useRef } from "react"
// import {
//   collection,
//   addDoc,
//   serverTimestamp,
//   onSnapshot,
//   query,
//   orderBy,
//   where,
// } from "firebase/firestore"
// import { db, auth } from "../firebase/config"

// interface Message {
//   id: string
//   text: string
//   uid: string
//   displayName: string
//   roomId: string
//   createdAt: any
// }

// interface Room {
//   id: string
//   name: string
// }

// // Dummy user constants
// const DUMMY_USER_ID = "dummy-user-123"
// const DUMMY_USER_NAME = "Test User"

// // Default rooms
// const DEFAULT_ROOMS: Room[] = [
//   { id: "general", name: "General" },
//   { id: "random", name: "Random" },
//   { id: "tech", name: "Technology" },
// ]

// export const ChatRoom = () => {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState("")
//   const [showDummyUser, setShowDummyUser] = useState(false)
//   const [currentRoom, setCurrentRoom] = useState<Room>(DEFAULT_ROOMS[0])
//   const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS)
//   const [newRoomName, setNewRoomName] = useState("")
//   const [showNewRoomInput, setShowNewRoomInput] = useState(false)
//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   useEffect(() => {
//     // Query to get messages ordered by timestamp for the current room
//     const messagesQuery = query(
//       collection(db, "messages"),
//       where("roomId", "==", currentRoom.id),
//       orderBy("createdAt")
//     )

//     // Subscribe to real-time updates
//     const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
//       const messageData: Message[] = []
//       snapshot.forEach((doc) => {
//         messageData.push({ id: doc.id, ...doc.data() } as Message)
//       })
//       setMessages(messageData)
//     })

//     // Cleanup subscription
//     return unsubscribe
//   }, [currentRoom.id])

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   const sendMessage = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!newMessage.trim() || !auth.currentUser) return

//     // Store the message text before clearing the input
//     const messageText = newMessage.trim();

//     try {
//       await addDoc(collection(db, "messages"), {
//         text: messageText,
//         createdAt: serverTimestamp(),
//         uid: auth.currentUser.uid,
//         displayName: auth.currentUser.displayName || "Anonymous",
//         roomId: currentRoom.id,
//       })
//       setNewMessage("")

//       // If dummy user is enabled, send a response after a short delay
//       if (showDummyUser) {
//         setTimeout(() => sendDummyMessage(messageText), 1000)
//       }
//     } catch (error) {
//       console.error("Error sending message:", error)
//     }
//   }

//   const sendDummyMessage = async (originalMessage: string) => {
//     try {
//       await addDoc(collection(db, "messages"), {
//         text: `This is a response from the dummy user to: "${originalMessage}"`,
//         createdAt: serverTimestamp(),
//         uid: DUMMY_USER_ID,
//         displayName: DUMMY_USER_NAME,
//         roomId: currentRoom.id,
//       })
//     } catch (error) {
//       console.error("Error sending dummy message:", error)
//     }
//   }

//   const createNewRoom = () => {
//     if (!newRoomName.trim()) return;

//     const roomId = newRoomName.toLowerCase().replace(/\s+/g, '-');
//     const newRoom = { id: roomId, name: newRoomName.trim() };

//     setRooms([...rooms, newRoom]);
//     setCurrentRoom(newRoom);
//     setNewRoomName("");
//     setShowNewRoomInput(false);
//   }

//   return (
//     <div className="flex flex-col h-[calc(100vh-9rem)] max-w-2xl mx-auto p-4 bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
//       <div className="flex justify-between items-center mb-2">
//         <h2 className="text-lg font-semibold">Chat Room: {currentRoom.name}</h2>
//         <div className="flex items-center">
//           <span className="mr-2 text-sm">Test Mode:</span>
//           <button
//             onClick={() => setShowDummyUser(!showDummyUser)}
//             className={`px-3 py-1 rounded-md text-sm ${
//               showDummyUser
//                 ? "bg-green-500 text-white"
//                 : "bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
//             }`}
//           >
//             {showDummyUser ? "On" : "Off"}
//           </button>
//         </div>
//       </div>

//       {/* Room selector */}
//       <div className="mb-4 flex flex-wrap items-center space-x-2">
//         {rooms.map((room) => (
//           <button
//             key={room.id}
//             onClick={() => setCurrentRoom(room)}
//             className={`px-3 py-1 mb-2 rounded-md text-sm ${
//               currentRoom.id === room.id
//                 ? "bg-blue-500 text-white"
//                 : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
//             }`}
//           >
//             {room.name}
//           </button>
//         ))}

//         {showNewRoomInput ? (
//           <div className="flex items-center space-x-2 mb-2">
//             <input
//               type="text"
//               value={newRoomName}
//               onChange={(e) => setNewRoomName(e.target.value)}
//               placeholder="Room name"
//               className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
//             />
//             <button
//               onClick={createNewRoom}
//               className="px-3 py-1 text-sm bg-green-500 text-white rounded-md"
//             >
//               Add
//             </button>
//             <button
//               onClick={() => setShowNewRoomInput(false)}
//               className="px-3 py-1 text-sm bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-md"
//             >
//               Cancel
//             </button>
//           </div>
//         ) : (
//           <button
//             onClick={() => setShowNewRoomInput(true)}
//             className="px-3 py-1 mb-2 rounded-md text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
//           >
//             + New Room
//           </button>
//         )}
//       </div>

//       <div className="flex-1 overflow-y-auto mb-4 p-3 flex flex-col scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`flex ${
//               msg.uid === auth.currentUser?.uid
//                 ? "justify-end"
//                 : "justify-start"
//             } my-2`}
//           >
//             <div
//               className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                 msg.uid === auth.currentUser?.uid
//                   ? "bg-blue-500 text-white rounded-br-none dark:bg-blue-600"
//                   : "bg-gray-200 text-gray-800 rounded-bl-none dark:bg-gray-700 dark:text-gray-200"
//               }`}
//             >
//               <div
//                 className={`text-xs mb-1 font-medium ${
//                   msg.uid === auth.currentUser?.uid
//                     ? "text-blue-100"
//                     : "text-gray-500 dark:text-gray-400"
//                 }`}
//               >
//                 {msg.displayName} {msg.uid === DUMMY_USER_ID && "(Test User)"}
//               </div>
//               <div className="break-words">{msg.text}</div>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       <form
//         onSubmit={sendMessage}
//         className="flex space-x-2 border-t border-gray-200 dark:border-gray-700 pt-4"
//       >
//         <input
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           placeholder="Type a message"
//           className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
//         />
//         <button
//           type="submit"
//           className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
//         >
//           Send
//         </button>
//       </form>
//     </div>
//   )
// }
