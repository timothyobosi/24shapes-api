// get-token.js
const { OAuth2Client } = require('google-auth-library');
const readline = require('readline');

const CLIENT_ID = '1002605239911-lo410prfgv3ratu9ha8tlljtknns6j40.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
});

console.log('OPEN THIS URL IN YOUR BROWSER:');
console.log(authUrl);
console.log('\n--- AFTER ALLOWING, COPY THE CODE FROM URL ---');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nPASTE THE CODE HERE: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oAuth2Client.getToken(code.trim());
    console.log('\nSUCCESS! SAVE THESE:\n');
    console.log('REFRESH TOKEN (USE THIS FOREVER):');
    console.log(tokens.refresh_token);
    console.log('\nACCESS TOKEN (expires in 1 hour):');
    console.log(tokens.access_token);
  } catch (err) {
    console.error('Error:', err.message);
  }
});