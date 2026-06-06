// Mock Firebase config
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "electro-book-mock.firebaseapp.com",
  databaseURL: "https://electro-book-mock.firebaseio.com",
  projectId: "electro-book-mock",
  storageBucket: "electro-book-mock.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
