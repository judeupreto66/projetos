// CONFIG FIREBASE

const firebaseConfig = {

    apiKey: "SUA_API",
  
    authDomain: "SEU_DOMINIO",
  
    projectId: "SEU_PROJECT_ID",
  
    storageBucket: "SEU_BUCKET",
  
    messagingSenderId: "SEU_ID",
  
    appId: "SEU_APP_ID"
  };
  
  // INICIAR FIREBASE
  
  firebase.initializeApp(firebaseConfig);
  
  // BANCO
  
  const db = firebase.firestore();