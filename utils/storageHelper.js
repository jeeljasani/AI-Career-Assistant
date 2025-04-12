import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, getDocs, query, where,doc, deleteDoc ,setDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

/**
 * Store data into AsyncStorage
 * @param {string} key - The key under which the value will be stored.
 * @param {any} value - The value to store (can be string, object, array, etc.).
 * @returns {Promise<boolean>} - Returns true if storage is successful, false otherwise.
 */
export const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error("Error storing data:", error);
    return false;
  }
};

/**
 * Retrieve data from AsyncStorage
 * @param {string} key - The key of the value to retrieve.
 * @returns {Promise<any|null>} - Returns the parsed value or null if not found.
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - The key of the value to remove.
 * @returns {Promise<boolean>} - Returns true if removal is successful, false otherwise.
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error removing data:", error);
    return false;
  }
};


export const saveDraftToFirestore = async (draft) => {
  try {
    const docRef = doc(db, "coverletter", draft.id);
    await setDoc(docRef, draft);
    return docRef.id;
  } catch (error) {
    console.error("Error saving draft to Firestore:", error);
    throw error;
  }
};

// Function to get drafts only for a specific user
export const getUserDraftsFromFirestore = async (userEmail) => {
  try {
    console.log("Fetching drafts for user:", userEmail);
    const q = query(collection(db, "coverletter"), where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    const userDrafts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("User drafts:", userDrafts);
    return userDrafts;
  } catch (error) {
    console.error("Error fetching user drafts:", error);
    throw error;
  }
};

export const deleteDraftFromFirestore = async (id) => {
  try {
    await deleteDoc(doc(db, "coverletter", id));
    console.log(`Draft with ID ${id} deleted successfully`);
  } catch (error) {
    console.error("Error deleting draft from Firestore:", error);
    throw error;
  }
};
