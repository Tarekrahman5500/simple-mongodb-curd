import express from 'express'
import cors from 'cors'
import {MongoClient, ObjectId, ServerApiVersion} from 'mongodb'
import 'dotenv/config'


const app = express()
const port = process.env.PORT || 5000


//handle cors policy
app.use(cors())

// work done as middle ware body parser
app.use(express.json())


//handle mongodb

const client = new MongoClient(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

// connect to the db
const run = async () => {
    try {
        await client.connect();
        // collection name if not present then create
        const database = client.db("test");
        const productCollection = database.collection("product");


        app.get('/product', async (req, res) => {


            //set connection with collection
            const cursor = productCollection.find({})
            const product = await cursor.toArray()
            res.send(product)
        })


        app.get('/product/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await productCollection.findOne(query)

            //  console.log('product id', id)
            res.send(result)

        })

        app.post('/product', async (req, res) => {
            // get the product from UI
            const product = req.body
            console.log(product)
            const result = await productCollection.insertOne(product)
            console.log(`A document was inserted with the _id: ${result.insertedId}`)
            console.log(result)
            res.json(result)
        })

        //update

        app.put('/product/:id', async (req, res) => {

            const id = req.params.id
            const updateProduct = req.body
            //set query of update
            const query = {_id: ObjectId(id)}
            // update plus inset
            const options = {upsert: true}

            // create new product to update
            const updateDoc = {
                $set: {
                    name: updateProduct.name,
                    size: updateProduct.size,
                    quantity: updateProduct.quantity
                },
            }

            // show that db has updated
            const result = await productCollection.updateOne(query, updateDoc, options);

            // console.log(updateProduct)
            console.log('hitting id', id)
            res.json(result)
        })

        //delete api

        app.delete('/product/:id', async (req, res) => {

            const id = req.params.id
            console.log('delete is id', id)
            //set query of delete
            const query = {_id: ObjectId(id)}

            const result = await productCollection.deleteOne(query)
            console.log(`A document was deleted was ${result.deletedCount}`)
            res.json(result)
        })

        // order

        app.post('/order/:id', async (req, res) => {

            const id = req.params.id
            //console.log('order is id', id)
            const qty = req.body
            //   console.log( typeof  qty)
            const query = {_id: ObjectId(id)}
           // console.log(query)
            // get the specific data
            const total = await productCollection.findOne(query)
            //destruct  element
            const {quantity} = total
            // convert to number from string
            const number_qty = Number(quantity)
            // convert object to number
            const user_need = Number(Object.values(qty))

            if (user_need > number_qty || number_qty <= 0) {
                res.send('we do not have enough Number of product ')
            } else {
                const result = await productCollection.updateOne(
                    {_id: ObjectId(id)},
                    {$set: {"quantity": (number_qty - user_need)}})

                res.json(result)
            }

            //  if ()

        })
    } finally {
        // await client.close();
    }
};

run().catch(console.dir);

// make a simple get request
app.get('/', (req, res) => {
    res.send('simple curd server')
})

//run the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
