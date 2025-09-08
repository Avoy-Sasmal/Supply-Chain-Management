import express from "express"
import dotenv from "dotenv"
import connectDb from "./db/db.js";
dotenv.config()

const app = express()
const port = process.env.PORT || 3000 ;

// middleware 
app.use(express.json())
// coonect db 
connectDb();

//routes 


app.listen(port,()=>{
  console.log(`surver is running in http://localhost:${port}`);
  
})
