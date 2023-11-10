const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: ['https://library-management-syste-d2072.firebaseapp.com','https://library-management-syste-d2072.web.app'],
    credentials: true 
}));



const verifyToken = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.user = decoded;
        next();
    })
}




app.use(express.json());
app.use(cookieparser());



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
    // await client.connect();

    const libraryCollection = client.db("libraryDB").collection("team");
    const reviewCollection = client.db("libraryDB").collection("review");
    const categoryCollection = client.db("libraryDB").collection("category");
    const booksCollection = client.db("libraryDB").collection("Books");
    const borrowCollection = client.db("libraryDB").collection("borrow");

// auth related api
app.post('/jwt', async(req,res)=>{
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
    res
    .cookie('token', token, {
        httpOnly: false,
        secure:true,
        sameSite: 'none'
       
    })
    .send({success: true})
})

app.post('/logout', async (req, res) => {
    const user = req.body;
    console.log('logging out', user);
    res.clearCookie('token', { maxAge: 0 }).send({ success: true })
})


// books related api
    app.post('/books', async (req, res) => {
        const books = req.body
        const result = await booksCollection.insertOne(books);
        res.send(result)
    })

// Post borrowes books information
    app.post('/borrow', async (req, res) => {
        const borrow = req.body
        const result = await borrowCollection.insertOne(borrow);
        res.send(result)
    })


    // get borrowed books information
    app.get('/borrow', async(req,res) => {
        const cursor = borrowCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })

// get books
    app.get('/books', async(req,res) => {
        const cursor = booksCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })
    // get books id
    app.get('/books/:id', async(req,res) => {
        const id= req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await booksCollection.findOne(query);

        res.send(result);
    })

    // delete borrowed book id
    app.delete('/borrow/:id', async(req,res) => {
        const id= req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await borrowCollection.deleteOne(query);

        res.send(result);
    })

// update books data id
    app.patch('/books/:id', async(req,res) => {
        const id= req.params.id
        const book = req.body
        const filter = { _id: new ObjectId(id) }
        console.log(id,book)
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            quantity: book.quantity
          },
        };
        const result = await booksCollection.updateOne(filter, updateDoc,options);
        res.send(result);
    })

    app.put('/books/:id', async (req, res) => {
       
            const id = req.params.id;
            const updatebooks = req.body;
            
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    book: updatebooks.book,
                    photo: updatebooks.photo,
                    author: updatebooks.author,
                    category: updatebooks.category,
                    rating: updatebooks.rating
                },
            };
    
            const result = await booksCollection.updateOne(filter, updateDoc,options);
            res.send(result)
    
           
    });

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
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
