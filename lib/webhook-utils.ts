import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function dispatchWebhooks(post: any) {
  try {
    // Fetch active integrations
    const q = query(collection(db, 'integrations'), where('isActive', '==', true));
    const snapshot = await getDocs(q);
    const integrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (integrations.length === 0) return;

    // Call the API route to dispatch
    const response = await fetch('/api/webhooks/dispatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post, integrations }),
    });

    if (!response.ok) {
      console.error('Failed to dispatch webhooks:', await response.text());
    }
  } catch (error) {
    console.error('Error dispatching webhooks:', error);
  }
}
