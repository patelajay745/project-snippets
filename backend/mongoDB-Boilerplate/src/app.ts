import express, { Express } from "express";
const app: Express = express()

app.use(express.json())
app.get("/", (req, res) => {
    res.status(200).json("It is up and running...")
})

export default app