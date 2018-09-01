import firebase from "firebase/storage";

const config = {
  apiKey: "AIzaSyAVooC4Poa_LmSR28WkK0VAOHumx3fvJPE",
  authDomain: "webscrapper-firebase.firebaseapp.com",
  databaseURL: "https://webscrapper-firebase.firebaseio.com",
  projectId: "webscrapper-firebase",
  storageBucket: "webscrapper-firebase.appspot.com",
  messagingSenderId: "780256497164"
};

firebase.initializeApp(config);

export default firebase;
