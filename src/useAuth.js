// src/useAuth.js
import { ref, onMounted } from 'vue'
import { Amplify, Hub } from '@aws-amplify/core'
import { Auth } from '@aws-amplify/auth'

// ─── Configure Amplify with your Cognito User Pool / Hosted UI ────────────
Amplify.configure({
  Auth: {
    region: 'us-east-2',
    userPoolId: 'us-east-2_G2vpbtsqp',
    userPoolWebClientId: '2ps5f1adntoj56ml8ll8c7lbrg',
    identityPoolId: 'us-east-2:0aeefbe3-768a-4601-aaf6-8b74c0db2eaa',
    oauth: {
      // THIS must match exactly the “Domain” you see under App client → Hosted UI in the AWS Console
      domain: 'g2vpbtsqp.auth.us-east-2.amazoncognito.com',

      // These URLs must also match exactly what you have in AWS Console → App client settings
      redirectSignIn: 'http://localhost:3000/',
      redirectSignOut: 'http://localhost:3000/',

      // “responseType: 'code'” tells Cognito we want an authorization code
      responseType: 'code',
      scope: ['openid', 'email', 'profile'],
    },
  },
})

const user = ref(null)
const isLoading = ref(true)

export function useAuth() {
  // Listen for Amplify Auth events (signIn, signOut, token refresh, etc.)
  Hub.listen('auth', async ({ payload: { event } }) => {
    console.log('Auth event:', event)
    if (event === 'signIn') {
      try {
        user.value = await Auth.currentAuthenticatedUser()
      } catch {
        user.value = null
      }
      isLoading.value = false
    }

    if (event === 'signOut') {
      user.value = null
      isLoading.value = false
    }
  })

  onMounted(async () => {
    // As soon as the component mounts, check for an existing session (or a newly returned code).
    // If the URL contains ?code=…, Amplify will automatically parse it, exchange it, and set the session.
    try {
      await Auth.currentSession()
      // If that succeeded, fetch the logged‐in user
      user.value = await Auth.currentAuthenticatedUser()
    } catch {
      // No valid session → user remains null
      user.value = null
    } finally {
      isLoading.value = false
    }
  })

  function signIn() {
    // Simply call federatedSignIn; Amplify knows how to build:
    //   https://{domain}/oauth2/authorize?response_type=code&client_id=...&redirect_uri=...
    // and then it will handle the callback automatically.
    Auth.federatedSignIn()
  }

  async function signOut() {
    // This does two things under the hood:
    // 1) Revokes tokens on Cognito’s side and redirects to the logout URL
    // 2) Clears local storage of Amplify/Cognito tokens
    try {
      await Auth.signOut({ global: true })
    } catch {
      // even if signOut throws, we still clear user locally
    }
    user.value = null
  }

  return { user, isLoading, signIn, signOut }
}
