import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, or, and } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';

export const useFriends = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'friends'),
      or(
        where('userId1', '==', user.uid),
        where('userId2', '==', user.uid)
      )
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const friendsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriends(friendsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addFriend = async (friendId: string) => {
    if (!user) return;
    await addDoc(collection(db, 'friends'), {
      userId1: user.uid,
      userId2: friendId,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  };

  const acceptFriend = async (friendshipId: string) => {
    await updateDoc(doc(db, 'friends', friendshipId), { status: 'accepted' });
  };

  const removeFriend = async (friendshipId: string) => {
    await deleteDoc(doc(db, 'friends', friendshipId));
  };

  return { friends, loading, addFriend, acceptFriend, removeFriend };
};
