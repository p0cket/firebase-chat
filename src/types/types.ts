import { Timestamp } from "firebase/firestore"

// Represents a member of a lobby
export type LobbyMember = {
  id: string
  displayName: string
  isHost: boolean
}

// Represents a lobby with its details
export type Lobby = {
  id: string
  name: string
  isActive: boolean
  hostId: string
  members: LobbyMember[]
  createdAt: Timestamp
  lobbyCode: string
  roomId: string | null
}

export type Message = {
  id: string
  text: string
  uid: string
  displayName: string
  roomId: string
  createdAt: Timestamp
}

export type LocationState = {
  isNewRoom?: boolean
  roomName?: string
}

export type Room = {
  id: string
  name: string
  createdAt: Timestamp
  createdBy: string
}

// interface LobbyMember {
//   id: string
//   displayName: string
//   isHost: boolean
// }

// interface Lobby {
//   id: string
//   name: string
//   isActive: boolean
//   hostId: string
//   members: LobbyMember[]
//   createdAt: Timestamp
//   lobbyCode: string
// }