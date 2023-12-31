require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oattrlg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const collegesCollection = client
      .db("anuBooking-college")
      .collection("colleges");
    const researchCollection = client
      .db("anuBooking-college")
      .collection("research");
    const applyCollection = client.db("anuBooking-college").collection("apply");
    const reviewsCollection = client
      .db("anuBooking-college")
      .collection("reviews");
    const usersCollection = client.db("anuBooking-college").collection("users");
    // user post
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    // my user
    app.get("/user/:email", async (req, res) => {
      const jobs = await usersCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(jobs);
    });
    //user update
    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: body.name,
          email: body.email,
          university: body.university,
          address: body.address,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // colleges
    app.get("/colleges", async (req, res) => {
      const result = await collegesCollection.find().toArray();
      res.send(result);
    });
    // college search
    app.get("/collegeSearch/:text", async (req, res) => {
      const text = req.params.text;
      const result = await collegesCollection
        .find({
          college_name: { $regex: text, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    // research
    app.get("/research", async (req, res) => {
      const result = await researchCollection.find().toArray();
      res.send(result);
    });
    // post data
    app.post("/applyForm", async (req, res) => {
      const body = req.body;
      const result = await applyCollection.insertOne(body);
      res.send(result);
    });
    // view details
    app.get("/college/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await collegesCollection.findOne(filter);
      res.send(result);
    });

    // my college
    app.get("/apply-college/:email", async (req, res) => {
      const jobs = await applyCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(jobs);
    });

    // post review
    app.post("/review", async (req, res) => {
      const body = req.body;
      const result = await reviewsCollection.insertOne(body);
      res.send(result);
    });
    // colleges
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("anuBooking is running...");
});

app.listen(port, () => {
  console.log(`anuDesign is running on port ${port}`);
});
