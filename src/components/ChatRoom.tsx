import { useState, useRef, FormEvent } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, orderBy, limit, query, serverTimestamp } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import ChatMessage from "./ChatMessage";

function ChatRoom() {
  const auth = getAuth();
  const firestore = getFirestore();
  
  const dummy = useRef<HTMLDivElement>(null);
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));
  
  const [messages] = useCollectionData(q, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) return;
    
    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input 
          value={formValue} 
          onChange={(e) => setFormValue(e.target.value)} 
          placeholder="say something nice" 
        />
        <button type="submit" disabled={!formValue}>🕊️</button>
      </form>
    </>
  );
}

export default ChatRoom;
