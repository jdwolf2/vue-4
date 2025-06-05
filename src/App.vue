<template>
  <div id="app">
    <h1>Welcome to Your Vue App</h1>

    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <div v-if="user">
        <p>Hello, {{ user?.attributes?.email || 'User' }}</p>
        <button @click="signOut">Sign Out</button>

        <!-- Only visible when user is non-null -->
        <section class="db-section">
          <h2>DynamoDB Data</h2>
          <!-- … your DynamoDB inputs/buttons … -->
        </section>
      </div>
      <div v-else>
        <button @click="signIn">Sign In</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from './useAuth'
import { useDynamoDB } from './useDynamoDB'

const { user, isLoading, signIn, signOut } = useAuth()

// DynamoDB logic (unchanged)
const { items, fetchError, itemsFetched, fetchItems } = useDynamoDB()
const customerName = ref('')
const skLow = ref('')
const skHigh = ref('')
const fetching = ref(false)

async function loadItems() {
  if (!customerName.value || !skLow.value || !skHigh.value) {
    fetchError.value = 'Please fill in Customer Name, Start TS, and End TS.'
    itemsFetched.value = true
    return
  }
  fetching.value = true
  fetchError.value = ''
  itemsFetched.value = false
  items.value = []
  await fetchItems(customerName.value, skLow.value, skHigh.value)
  fetching.value = false
  itemsFetched.value = true
}
</script>

<style src="./style.css"></style>
