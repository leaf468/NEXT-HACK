import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { 
  addDoc, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  orderBy,
  setDoc
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

// Festival API functions
export const getAllFestivals = async () => {
  try {
    const festivalsRef = collection(db, "festivals");
    const festivalSnapshot = await getDocs(festivalsRef);
    const festivals = [];
    
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();
      
      // Get university data
      const universityRef = doc(db, "universities", festivalData.university_id);
      const universitySnap = await getDoc(universityRef);
      
      // Get artists data
      const artistsData = [];
      for (const artistId of festivalData.artist_ids) {
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          artistsData.push({ id: artistId, ...artistSnap.data() });
        }
      }
      
      festivals.push({
        id: festivalDoc.id,
        ...festivalData,
        university: universitySnap.exists() ? { id: universitySnap.id, ...universitySnap.data() } : null,
        artists: artistsData
      });
    }
    
    return festivals;
  } catch (error) {
    console.error("Error getting festivals:", error);
    throw error;
  }
};

export const getFestivalById = async (festivalId) => {
  try {
    const festivalRef = doc(db, "festivals", festivalId);
    const festivalSnap = await getDoc(festivalRef);
    
    if (!festivalSnap.exists()) {
      return null;
    }
    
    const festivalData = festivalSnap.data();
    
    // Get university data
    const universityRef = doc(db, "universities", festivalData.university_id);
    const universitySnap = await getDoc(universityRef);
    
    // Get artists data
    const artistsData = [];
    for (const artistId of festivalData.artist_ids) {
      const artistRef = doc(db, "artists", artistId);
      const artistSnap = await getDoc(artistRef);
      if (artistSnap.exists()) {
        artistsData.push({ id: artistId, ...artistSnap.data() });
      }
    }
    
    return {
      id: festivalSnap.id,
      ...festivalData,
      university: universitySnap.exists() ? { id: universitySnap.id, ...universitySnap.data() } : null,
      artists: artistsData
    };
  } catch (error) {
    console.error("Error getting festival:", error);
    throw error;
  }
};

export const getFestivalsByDate = async (date) => {
  try {
    const festivalsRef = collection(db, "festivals");
    const q = query(festivalsRef, where("date", "==", date));
    const festivalSnapshot = await getDocs(q);
    
    const festivals = [];
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();
      
      // Get university data
      const universityRef = doc(db, "universities", festivalData.university_id);
      const universitySnap = await getDoc(universityRef);
      
      // Get artists data
      const artistsData = [];
      for (const artistId of festivalData.artist_ids) {
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          artistsData.push({ id: artistId, ...artistSnap.data() });
        }
      }
      
      festivals.push({
        id: festivalDoc.id,
        ...festivalData,
        university: universitySnap.exists() ? { id: universitySnap.id, ...universitySnap.data() } : null,
        artists: artistsData
      });
    }
    
    return festivals;
  } catch (error) {
    console.error("Error getting festivals by date:", error);
    throw error;
  }
};

// User API functions
export const loginUser = async (username) => {
  try {
    // Check if user already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("name", "==", username));
    const userSnapshot = await getDocs(q);
    
    // If user exists, return user data
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      return { id: userSnapshot.docs[0].id, ...userData };
    }
    
    // Create new user if not exists
    const newUserData = {
      name: username,
      faves: []
    };
    
    const newUserRef = await addDoc(collection(db, "users"), newUserData);
    return { id: newUserRef.id, ...newUserData };
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return { id: userSnap.id, ...userSnap.data() };
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

// Favorites API functions
export const addFavorite = async (userId, festivalId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      faves: arrayUnion(festivalId)
    });
    
    return true;
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

export const removeFavorite = async (userId, festivalId) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      faves: arrayRemove(festivalId)
    });
    
    return true;
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

export const getFavorites = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return [];
    }
    
    const userData = userSnap.data();
    const favoriteIds = userData.faves || [];
    
    // Get festival data for each favorite
    const favorites = [];
    for (const festivalId of favoriteIds) {
      const festival = await getFestivalById(festivalId);
      if (festival) {
        favorites.push(festival);
      }
    }
    
    return favorites;
  } catch (error) {
    console.error("Error getting favorites:", error);
    throw error;
  }
};

// University and Artist helper functions
export const getAllUniversities = async () => {
  try {
    const universitiesRef = collection(db, "universities");
    const universitySnapshot = await getDocs(universitiesRef);
    
    return universitySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting universities:", error);
    throw error;
  }
};

export const getAllArtists = async () => {
  try {
    const artistsRef = collection(db, "artists");
    const artistSnapshot = await getDocs(artistsRef);
    
    return artistSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting artists:", error);
    throw error;
  }
};

// Search and filter functions
export const searchFestivalsByUniversity = async (universityName) => {
  try {
    // First get the university ID
    const universitiesRef = collection(db, "universities");
    const q = query(universitiesRef, where("name", "==", universityName));
    const universitySnapshot = await getDocs(q);
    
    if (universitySnapshot.empty) {
      return [];
    }
    
    const universityId = universitySnapshot.docs[0].id;
    
    // Then get festivals with that university ID
    const festivalsRef = collection(db, "festivals");
    const festivalQuery = query(festivalsRef, where("university_id", "==", universityId));
    const festivalSnapshot = await getDocs(festivalQuery);
    
    // Process festivals same as getAllFestivals
    const festivals = [];
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();
      
      // Get university data (we already have it)
      const universityData = universitySnapshot.docs[0].data();
      
      // Get artists data
      const artistsData = [];
      for (const artistId of festivalData.artist_ids) {
        const artistRef = doc(db, "artists", artistId);
        const artistSnap = await getDoc(artistRef);
        if (artistSnap.exists()) {
          artistsData.push({ id: artistId, ...artistSnap.data() });
        }
      }
      
      festivals.push({
        id: festivalDoc.id,
        ...festivalData,
        university: { id: universitySnapshot.docs[0].id, ...universityData },
        artists: artistsData
      });
    }
    
    return festivals;
  } catch (error) {
    console.error("Error searching festivals by university:", error);
    throw error;
  }
};

export const searchFestivalsByArtist = async (artistName) => {
  try {
    // First get the artist ID
    const artistsRef = collection(db, "artists");
    const q = query(artistsRef, where("name", "==", artistName));
    const artistSnapshot = await getDocs(q);
    
    if (artistSnapshot.empty) {
      return [];
    }
    
    const artistId = artistSnapshot.docs[0].id;
    
    // Then get festivals with that artist ID in artist_ids array
    const festivalsRef = collection(db, "festivals");
    const festivalQuery = query(festivalsRef, where("artist_ids", "array-contains", artistId));
    const festivalSnapshot = await getDocs(festivalQuery);
    
    // Process festivals
    const festivals = [];
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();
      
      // Get university data
      const universityRef = doc(db, "universities", festivalData.university_id);
      const universitySnap = await getDoc(universityRef);
      
      // Get artists data
      const artistsData = [];
      for (const festArtistId of festivalData.artist_ids) {
        if (festArtistId === artistId) {
          // We already have this artist data
          artistsData.push({ id: artistId, ...artistSnapshot.docs[0].data() });
        } else {
          const artistRef = doc(db, "artists", festArtistId);
          const artistSnap = await getDoc(artistRef);
          if (artistSnap.exists()) {
            artistsData.push({ id: festArtistId, ...artistSnap.data() });
          }
        }
      }
      
      festivals.push({
        id: festivalDoc.id,
        ...festivalData,
        university: universitySnap.exists() ? { id: universitySnap.id, ...universitySnap.data() } : null,
        artists: artistsData
      });
    }
    
    return festivals;
  } catch (error) {
    console.error("Error searching festivals by artist:", error);
    throw error;
  }
};

export const filterFestivalsByLocation = async (location) => {
  try {
    // First get universities in this location
    const universitiesRef = collection(db, "universities");
    const q = query(universitiesRef, where("location", "==", location));
    const universitySnapshot = await getDocs(q);
    
    if (universitySnapshot.empty) {
      return [];
    }
    
    // Get university IDs
    const universityIds = universitySnapshot.docs.map(doc => doc.id);
    
    // Get all festivals
    const festivalsRef = collection(db, "festivals");
    const festivalSnapshot = await getDocs(festivalsRef);
    
    // Filter festivals manually (Firestore doesn't support OR queries easily)
    const festivals = [];
    for (const festivalDoc of festivalSnapshot.docs) {
      const festivalData = festivalDoc.data();
      
      if (universityIds.includes(festivalData.university_id)) {
        // Get university data
        const universityDoc = universitySnapshot.docs.find(doc => doc.id === festivalData.university_id);
        
        // Get artists data
        const artistsData = [];
        for (const artistId of festivalData.artist_ids) {
          const artistRef = doc(db, "artists", artistId);
          const artistSnap = await getDoc(artistRef);
          if (artistSnap.exists()) {
            artistsData.push({ id: artistId, ...artistSnap.data() });
          }
        }
        
        festivals.push({
          id: festivalDoc.id,
          ...festivalData,
          university: { id: universityDoc.id, ...universityDoc.data() },
          artists: artistsData
        });
      }
    }
    
    return festivals;
  } catch (error) {
    console.error("Error filtering festivals by location:", error);
    throw error;
  }
};