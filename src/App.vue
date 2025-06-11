<template>
  <div class="card">
    <!-- DEBUG: show current user.username (or “null”) in the UI -->

    <!-- If not signed in, show Sign-in button -->
    <button v-if="!user" @click="onSignInClick">Sign-in</button>

    <!-- If signed in, show Sign-out + Query-postData -->
    <div v-else>
      <div style="margin-bottom: 1rem">
        <button @click="onSignOutClick">Sign-out</button>
        <button @click="toggleForm" style="margin-left: 1rem">
          Query-postData
        </button>
      </div>

      <!-- Query form: appears when showForm = true -->
      <div v-if="showForm" style="margin-bottom: 1.5rem; text-align: left">
        <label for="startDate">Start-Date (mm/dd/yyyy):</label>
        <input
          id="startDate"
          type="text"
          v-model="startDate"
          placeholder="MM/DD/YYYY"
          style="margin-left: 0.5rem; width: 120px"
        />

        <label for="endDate" style="margin-left: 1.5rem">
          Stop-Date (mm/dd/yyyy):
        </label>
        <input
          id="endDate"
          type="text"
          v-model="endDate"
          placeholder="MM/DD/YYYY"
          style="margin-left: 0.5rem; width: 120px"
        />

        <button @click="submitQuery" style="margin-left: 1rem">Submit</button>
      </div>

      <!-- Show Loading / Error / No-Data messages -->
      <div v-if="itemsFetched && fetchError" style="color: red">
        Error: {{ fetchError }}
      </div>
      <div v-else-if="itemsFetched && items.length === 0" style="color: gray">
        No records found in that date range.
      </div>

      <!-- List returned items in a simple table -->
      <div v-else-if="itemsFetched">
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem">
          <thead>
            <tr>
              <th style="border: 1px solid #ccc; padding: 0.5rem">uStopTime</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">device</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">duration</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">lat</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">lon</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">rate</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">sidNum</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">siteName</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">speed</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">startDate</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">statTime</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">stopTime</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">tons</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">truck</th>
              <th style="border: 1px solid #ccc; padding: 0.5rem">
                uStartTime
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in items" :key="idx">
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.uStopTime }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.device }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.duration }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.lat }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.lon }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.rate }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.sidNum }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.siteName }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.speed }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.startDate }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.statTime }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.stopTime }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.tons }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.truck }}
              </td>
              <td style="border: 1px solid #ddd; padding: 0.5rem">
                {{ item.uStartTime }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// Import from `src/useAuth.js` (since you moved it to src/)
import { useAuth } from './useAuth.js'
import { useDynamoDB } from './useDynamoDB.js'

// ─── Destructure everything you need from useAuth() ─────────────────────────────
const { user, signIn, signOut } = useAuth()
// If `user`, `signIn`, or `signOut` were missing, you’d see errors in the console.
//───────────────────────────────────────────────────────────────────────────────

// Use the DynamoDB composable just like before
const { items, fetchError, itemsFetched, fetchItems } = useDynamoDB()

// Reactive state for toggling the form and holding dates
const showForm = ref(false)
const startDate = ref('07/01/2020')
const endDate = ref('11/23/2020')

// Called when the “Query-postData” button is pressed
function toggleForm() {
  showForm.value = !showForm.value
}

// We wrap signIn()/signOut() to ensure they exist, and to log minor debug info
function onSignInClick() {
  if (typeof signIn === 'function') {
    console.log('[App.vue] signIn() called')
    signIn()
  } else {
    console.error('[App.vue] signIn is not a function')
  }
}

function onSignOutClick() {
  if (typeof signOut === 'function') {
    console.log('[App.vue] signOut() called')
    signOut()
  } else {
    console.error('[App.vue] signOut is not a function')
  }
}

// When the form is submitted, convert “MM/DD/YYYY” → Unix timestamps → query DynamoDB
async function submitQuery() {
  // 1) Parse “MM/DD/YYYY” strings
  const [m1, d1, y1] = startDate.value.split('/').map((s) => Number(s))
  const [m2, d2, y2] = endDate.value.split('/').map((s) => Number(s))

  // 2) Build JS Date → getTime() → seconds → toString()
  const startTsNum = Math.floor(new Date(y1, m1 - 1, d1).getTime() / 1000)
  const endTsNum = Math.floor(new Date(y2, m2 - 1, d2).getTime() / 1000)
  const startTs = startTsNum.toString()
  const endTs = endTsNum.toString()

  // 3) Reset any previous fetch state
  items.value = []
  fetchError.value = ''
  itemsFetched.value = false

  // 4) Call our DynamoDB composable
  await fetchItems(startTs, endTs)
}
</script>
<style>
@import url('./style.css');
</style>
<style scoped>
.card {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: var(--card-bg, #1a1a1a);
  border-radius: 8px;
  color: var(--text-color, #fff);
}

button {
  margin: 0.25rem 0;
}
table {
  background-color: #fff;
  color: #000;
}
th {
  background-color: #f0f0f0;
}
td,
th {
  font-size: 0.9rem;
}
</style>
