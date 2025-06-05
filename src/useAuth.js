// src/useAuth.js
import { ref, onMounted } from 'vue'
import { Amplify } from '@aws-amplify/core'
import { Auth } from '@aws-amplify/auth'

// ─── 1) Configure Amplify exactly as before ───────────────────────────────
Amplify.configure({
  Auth: {
    region: 'us-east-2',
    userPoolId: 'us-east-2_G2vpbtsqp',
    userPoolWebClientId: '2ps5f1adntoj56ml8ll8c7lbrg',
    identityPoolId: 'us-east-2:0aeefbe3-768a-4601-aaf6-8b74c0db2eaa',
    oauth: {
      domain: 'us-east-2g2vpbtsqp.auth.us-east-2.amazoncognito.com',
      scope: ['openid', 'email', 'profile'],
      redirectSignIn: 'http://localhost:3000/',
      redirectSignOut: 'http://localhost:3000/',
      responseType: 'code',
    },
  },
})
// ───────────────────────────────────────────────────────────────────────────────

export function useAuth() {
  const user = ref(null)

  onMounted(async () => {
    // 1) If the URL contains "code=", Cognito just redirected here after login.
    //    We call currentAuthenticatedUser() immediately so Amplify can exchange
    //    the code for tokens and populate the user.
    if (window.location.search.includes('code=')) {
      try {
        const currentUser = await Auth.currentAuthenticatedUser()
        console.log(
          '[useAuth] after redirect: found user →',
          currentUser.username
        )
        user.value = currentUser

        // Remove the ?code=…&state=… from the URL so that future reloads are clean.
        // (We only need it on this first redirect.)
        const cleanUrl = window.location.origin + window.location.pathname
        window.history.replaceState({}, document.title, cleanUrl)
      } catch (err) {
        console.warn('[useAuth] after redirect: error obtaining user:', err)
        user.value = null
      }
    } else {
      // 2) Normal “check for existing session” on initial page load.
      try {
        const currentUser = await Auth.currentAuthenticatedUser()
        console.log(
          '[useAuth] existing session on mount →',
          currentUser.username
        )
        user.value = currentUser
      } catch (err) {
        console.log(
          '[useAuth] no existing session on mount:',
          err.message || err
        )
        user.value = null
      }
    }
  })

  /**
   * Manually redirect browser to Cognito’s Hosted Login page.
   * We still include "&prompt=login" to force credentials if a cookie exists.
   */
  function signIn() {
    console.log('[useAuth] signIn() → redirecting to Cognito Hosted UI')

    const domain = 'https://us-east-2g2vpbtsqp.auth.us-east-2.amazoncognito.com'
    const clientId = '2ps5f1adntoj56ml8ll8c7lbrg'
    const redirectUri = encodeURIComponent('http://localhost:3000/')
    const responseType = 'code'
    const scope = encodeURIComponent('openid email profile')
    const loginUrl =
      `${domain}/login?client_id=${clientId}` +
      `&response_type=${responseType}` +
      `&scope=${scope}` +
      `&redirect_uri=${redirectUri}` +
      `&prompt=login`

    window.location.href = loginUrl
  }

  /**
   * Local signOut (no global), clearing Amplify’s cached tokens.
   * After this, user.value = null and template shows Sign-in again.
   */
  async function signOut() {
    try {
      console.log('[useAuth] signOut() → clearing local session')
      await Auth.signOut() // no { global: true } to avoid scope errors
    } catch (err) {
      console.warn('[useAuth] error signing out:', err)
    } finally {
      user.value = null
    }
  }

  return { user, signIn, signOut }
}
