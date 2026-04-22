<script setup>
import { ref, computed, onMounted } from 'vue'
import { callHandler, registerHandler } from 'web-bridge-gateway'

const account = ref('ABA001')
const amount = ref('1.5')
const currency = ref('USD')
const secretKey = ref('')

const showStatusDialog = ref(false)
const statusPayload = ref({})

const amountFormatted = computed(() => {
  const n = Number(amount.value || 0)
  return n.toFixed(2)
})

function stringifyValue(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

async function sha256Uppercase(text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hashHex.toUpperCase()
}

async function buildHash() {
  const raw = `${account.value}${amountFormatted.value}${currency.value}${secretKey.value}`.toUpperCase()
  return await sha256Uppercase(raw)
}

async function handlePay() {
  try {
    const hash = await buildHash()

    const payload = {
      account: account.value,
      amount: amount.value,
      currency: currency.value,
      additionalKey: {
        hash,
      },
    }

    const result = await callHandler('doPayment', payload)
    console.log('doPayment result:', result)
  } catch (error) {
    console.error('doPayment failed:', error)
  }
}

onMounted(() => {
  registerHandler('getStatus', (data, callback) => {
    statusPayload.value = data || {}
    showStatusDialog.value = true

    if (callback) {
      callback({
        success: true,
      })
    }
  })
})
</script>

<template>
  <div class="container">
    <h2>Mini App Payment</h2>

    <form @submit.prevent="handlePay">
      <input v-model="account" placeholder="Account" />
      <input v-model="amount" placeholder="Amount" />
      <input v-model="currency" placeholder="Currency" />
      <input v-model="secretKey" placeholder="Secret Key" type="password" />

      <button type="submit">Pay</button>
    </form>

    <div v-if="showStatusDialog" class="dialog-overlay" @click.self="showStatusDialog = false">
      <div class="dialog">
        <div class="success-icon">✓</div>
        <h3>Success</h3>

        <div class="status-list">
          <div
            v-for="(value, key) in statusPayload"
            :key="key"
            class="status-row"
          >
            <span class="status-key">{{ key }}</span>
            <span class="status-value">{{ stringifyValue(value) }}</span>
          </div>
        </div>

        <button class="close-btn" @click="showStatusDialog = false">Close</button>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f5f5f5;
}

.container {
  max-width: 400px;
  margin: 60px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

button {
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #007bff;
  color: white;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.dialog {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
}

h3 {
  margin: 0 0 16px;
}

.status-list {
  text-align: left;
  margin-bottom: 16px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.status-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f1f1;
}

.status-row:last-child {
  border-bottom: none;
}

.status-key {
  font-weight: 600;
  color: #333;
}

.status-value {
  color: #666;
  text-align: right;
  word-break: break-word;
}

.close-btn {
  width: 100%;
  background: #28a745;
}

.close-btn:hover {
  background: #1f8a39;
}
</style>