import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  setDoc,
  orderBy,
} from "firebase/firestore"
import { db, auth } from "../firebase/config"
import { motion } from "framer-motion"
import { Room } from "../types/types"

export const Home = () => {
  const [joinRoomCode, setJoinRoomCode] = useState("")
  const [createRoomName, setCreateRoomName] = useState("")
  const [userRooms, setUserRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  // Animation variants for the room cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const roomVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.2,
      },
    },
  }

  useEffect(() => {
    const fetchUserRooms = async () => {
      if (!auth.currentUser) return

      try {
        // Query for rooms where the user is a member
        const roomsRef = collection(db, "rooms")
        const q = query(
          roomsRef,
          where("members", "array-contains", auth.currentUser.uid),
          orderBy("createdAt", "desc")
        )
        const querySnapshot = await getDocs(q)

        const rooms: Room[] = []
        querySnapshot.forEach((doc) => {
          rooms.push({ id: doc.id, ...doc.data() } as Room)
        })

        setUserRooms(rooms)
      } catch (error) {
        console.error("Error fetching user rooms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRooms()
  }, [])

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auth.currentUser) {
      setError("You must be logged in to create a room")
      return
    }

    if (!createRoomName.trim()) {
      setError("Room name is required")
      return
    }

    try {
      // Generate a random 6-character room code
      const generateRoomId = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        let roomId = ""
        for (let i = 0; i < 6; i++) {
          roomId += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return roomId
      }

      const roomId = generateRoomId()

      // Create room document
      await setDoc(doc(db, "rooms", roomId), {
        id: roomId,
        name: createRoomName.trim(),
        createdBy: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        members: [auth.currentUser.uid],
      })

      // Navigate to the new room
      navigate(`/room/${roomId}`)
    } catch (error) {
      console.error("Error creating room:", error)
      setError("Failed to create room")
    }
  }

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!joinRoomCode.trim()) {
      setError("Room code is required")
      return
    }

    try {
      // Check if room exists
      const roomRef = doc(db, "rooms", joinRoomCode.trim())
      const roomDoc = await getDocs(
        query(collection(db, "rooms"), where("id", "==", joinRoomCode.trim()))
      )

      if (roomDoc.empty) {
        setError("Room not found")
        return
      }

      // Add user to room members if not already a member
      const roomData = roomDoc.docs[0].data()
      const roomId = roomDoc.docs[0].id

      if (!roomData.members.includes(auth.currentUser?.uid)) {
        await setDoc(
          doc(db, "rooms", roomId),
          {
            ...roomData,
            members: [...roomData.members, auth.currentUser?.uid],
          },
          { merge: true }
        )
      }

      // Navigate to the room
      navigate(`/room/${roomId}`)
    } catch (error) {
      console.error("Error joining room:", error)
      setError("Failed to join room")
    }
  }

  const navigateToGameLobby = (roomId: string) => {
    navigate(`/game/${roomId}`)
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center dark:text-white">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          Welcome to Firebase Chat & Mafia Game
        </motion.span>
      </h1>

      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Room Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Create a Room
          </h2>
          <form onSubmit={handleCreateRoom}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={createRoomName}
                onChange={(e) => setCreateRoomName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter room name"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Room
            </button>
          </form>
        </motion.div>

        {/* Join Room Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Join a Room
          </h2>
          <form onSubmit={handleJoinRoom}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter 6-digit room code"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              Join Room
            </button>
          </form>
        </motion.div>
      </div>

      {/* User's Rooms */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          Your Rooms
        </h2>

        {loading ? (
          <div className="text-center py-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"
            ></motion.div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading your rooms...
            </p>
          </div>
        ) : userRooms.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {userRooms.map((room) => (
              <motion.div
                key={room.id}
                variants={roomVariants}
                whileHover="hover"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex flex-col h-full">
                  <div onClick={() => navigate(`/room/${room.id}`)}>
                    <h3 className="font-medium dark:text-white">{room.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Room Code: {room.id}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigateToGameLobby(room.id)}
                    className="mt-3 bg-purple-500 text-white text-sm py-1 px-3 rounded-md hover:bg-purple-600 transition-colors"
                  >
                    Start Mafia Game
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            You haven't joined any rooms yet. Create or join a room to get
            started.
          </p>
        )}
      </motion.div>
    </div>
  )
}
