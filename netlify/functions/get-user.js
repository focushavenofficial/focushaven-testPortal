import { DataAPIClient } from "@datastax/astra-db-ts";

export default async function testingFunc(){
  try{
    const AstraClient = new DataAPIClient(import.meta.env.VITE_ASTRA_DB_TOKEN);
    const AstraDB = AstraClient.db(import.meta.env.VITE_ASTRA_DB_URL);
    
    const collection =  AstraDB.collection("notes")
    
    console.log(await collection.findOne({}))
  }catch(err){
    console.log("err : ", err)
  }
}