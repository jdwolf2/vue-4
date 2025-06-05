// src/composables/useAuth.js
import { ref, onMounted } from 'vue'
import { Amplify } from '@aws-amplify/core'
import { Auth } from '@aws-amplify/auth'

// ─── Configure Amplify with User-Pool / Hosted UI ───────────────────────────
Amplify.configure({
  Auth: {
    region: 'us-east-2',
    userPoolId: 'us-east-2_G2vpbtsqp',
    userPoolWebClientId: '2ps5f1adntoj56ml8ll8c7lbrg',
    identityPoolId: 'us-east-2:0aeefbe3-768a-4601-aaf6-8b74c0db2eaa',
    // (if your Identity Pool ID is different, replace the above)

    oauth: {
      domain: 'us-east-2g2vpbtsqp.auth.us-east-2.amazoncognito.com',
      scope: ['openid', 'email', 'profile'],
      redirectSignIn: 'http://localhost:3000/',
      redirectSignOut: 'http://localhost:3000/',
      responseType: 'code', // using Authorization Code Grant
    },
  },
})
// ─────────────────────────────────────────────────────────────────────────────

const user = ref(null)

/**
 * onMounted → check if there’s already an active session.
 */
onMounted(async () => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser()
    user.value = currentUser
  } catch {
    user.value = null
  }
})

/**
 * signIn() → redirect to Hosted UI (Cognito domain).
 */
function signIn() {
  Auth.federatedSignIn() // Amplify auto-constructs the correct hosted UI URL.
}

/**
 * signOut() → clear local + global session and set user to null.
 */
async function signOut() {
  try {
    await Auth.signOut({ global: true })
    user.value = null
  } catch (err) {
    console.warn('Error signing out:', err)
  }
}

export function useAuth() {
  return {
    user,
    signIn,
    signOut,
  }
}
