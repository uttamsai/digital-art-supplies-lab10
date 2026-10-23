import express from 'express'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
if (!uri) throw new Error('MONGODB_URI is required')

const app = express()
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 })
const allowedOrigins = new Set([
  'https://storage.googleapis.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

app.use(express.json({ limit: '16kb' }))
app.use('/api/customers', (request, response, next) => {
  const origin = request.get('Origin')
  if (allowedOrigins.has(origin)) {
    response.set('Access-Control-Allow-Origin', origin)
    response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.set('Access-Control-Allow-Headers', 'Content-Type')
    response.vary('Origin')
  }
  if (request.method === 'OPTIONS') return response.sendStatus(204)
  next()
})

app.get('/health', (_request, response) => response.json({ ok: true }))

// Read customer names from Atlas for the Customers page.
app.get('/api/customers', async (_request, response) => {
  try {
    const collection = client.db('digital_art_supplies').collection('customers')
    const docs = await collection.find({}, { projection: { name: 1 } }).sort({ _id: 1 }).toArray()
    response.json({ customers: docs.map((doc) => ({ id: String(doc._id), name: String(doc.name ?? '') })) })
  } catch (error) {
    console.error('Customer query failed:', error)
    response.status(500).json({ error: 'Could not load customers' })
  }
})

// Validate a signup and save a new customer in Atlas.
app.post('/api/customers', async (request, response) => {
  const login = String(request.body?.login ?? '').trim()
  const email = String(request.body?.email ?? '').trim().toLowerCase()
  const password = request.body?.password
  if (login.length < 3 || login.length > 100 ||
      email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== 'string' || password.length < 6 || password.length > 128) {
    return response.status(400).json({ error: 'Enter a login, valid email, and password of at least 6 characters.' })
  }

  try {
    const collection = client.db('digital_art_supplies').collection('customers')
    const existing = await collection.findOne({ $or: [{ login }, { email }] }, { projection: { _id: 1 } })
    if (existing) return response.status(409).json({ error: 'That login or email is already registered.' })

    const result = await collection.insertOne({ name: login, login, email, password, createdAt: new Date() })
    response.status(201).json({ id: String(result.insertedId), name: login })
  } catch (error) {
    console.error('Customer signup failed:', error)
    response.status(500).json({ error: 'Could not create account.' })
  }
})

const port = Number(process.env.PORT || 8080)
app.listen(port, '0.0.0.0', () => console.log(`Customers API listening on ${port}`))
