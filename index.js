const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1gxcng8.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const libraryCollection = client.db("libraryDB").collection("team");
    const reviewCollection = client.db("libraryDB").collection("review");
    const categoryCollection = client.db("libraryDB").collection("category");


    app.post('/category', async (req, res) => {
        const category = req.body
        // console.log(product)
        const result = await categoryCollection.insertOne(category);
        res.send(result)
    })

    app.get('/category', async(req,res) => {
        const cursor = categoryCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post('/team', async (req, res) => {
        const team = req.body
        // console.log(product)
        const result = await libraryCollection.insertOne(team);
        res.send(result)
    })

    app.get('/team', async(req,res) => {
        const cursor = libraryCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post('/review', async (req, res) => {
        const review = req.body
        // console.log(product)
        const result = await reviewCollection.insertOne(review);
        res.send(result)
    })

    app.get('/review', async(req,res) => {
        const cursor = reviewCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('library-management-system server is running.....')
})

app.listen(port, () => {
    console.log(`library-management-system  Server is running on port : ${port}`)
})
