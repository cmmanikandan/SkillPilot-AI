import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function createCollections() {
  console.log('Connecting to Firestore to create collections automatically...');
  try {
    // We create a dummy document in each collection to force Firestore to create them!
    await setDoc(doc(db, 'users', '_schema_init'), { description: 'Schema initialized' });
    console.log('✅ Created "users" collection');
    
    await setDoc(doc(db, 'curriculums', '_schema_init'), { description: 'Schema initialized' });
    console.log('✅ Created "curriculums" collection');
    
    await setDoc(doc(db, 'curriculumProgress', '_schema_init'), { description: 'Schema initialized' });
    console.log('✅ Created "curriculumProgress" collection');
    
    await setDoc(doc(db, 'progress', '_schema_init'), { description: 'Schema initialized' });
    console.log('✅ Created "progress" collection');
    
    await setDoc(doc(db, 'friends', '_schema_init'), { description: 'Schema initialized' });
    console.log('✅ Created "friends" collection');
    
    console.log('\nAll collections created successfully! You can see them in your Firebase Console now.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating collections:', error);
    process.exit(1);
  }
}

createCollections();
