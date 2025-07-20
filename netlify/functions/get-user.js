import dotenv from "dotenv";
import { DataAPIClient } from "@datastax/astra-db-ts";

dotenv.config()

export default async function testingFunc(){
  try{
    const AstraClient = new DataAPIClient(process.env.VITE_ASTRA_DB_TOKEN);
    const AstraDB = AstraClient.db(process.env.VITE_ASTRA_DB_URL);
    
    const collection =  AstraDB.collection("notes")
    
    console.log(await collection.findOne({}))
  }catch(err){
    console.log("err : ", err)
  }
}