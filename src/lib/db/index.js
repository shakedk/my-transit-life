import admin from 'firebase-admin';

// Setup Google apps services account
let serviceAccount = {};
if (process.env.NODE_ENV === "development") {
  serviceAccount = require("./serviceAccountKey.json");
} else {
  serviceAccount.type= process.env.SERVICE_ACCOUNT_TYPE;
  serviceAccount.project_id= process.env.SERVICE_ACCOUNT_PROJECT_ID;
  serviceAccount.private_key_id= process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID;
  serviceAccount.private_key= process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
  serviceAccount.client_email= process.env.SERVICE_ACCOUNT_CLIENT_EMAIL;
  serviceAccount.client_id= process.env.SERVICE_ACCOUNT_CLIENT_ID;
  serviceAccount.auth_uri= process.env.SERVICE_ACCOUNT_AUTH_URI;
  serviceAccount.token_uri= process.env.SERVICE_ACCOUNT_TOKEN_URI;
  serviceAccount.auth_provider_x509_cert_url= process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL;
  serviceAccount.client_x509_cert_url= process.env.SERVICE_ACCOUNT_CLIENT_X509_CERT_URL;
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.log('Firebase admin initialization error', error.stack);
  }
}
export default admin.firestore();
