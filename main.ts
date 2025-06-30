import { MongoClient, ObjectId } from "mongodb"
import { Local, LocalModel } from "./types.ts";
import { getLatandLon, getTemperature, getTime, validatePhone } from "./resolves.ts";

const MONGO_URL = Deno.env.get("MONGO_URL")

if(!MONGO_URL) throw new Error("Error con MONGO_URL")

const client = new MongoClient(MONGO_URL)
await client.connect()
console.log("Conectado a MONGO_URL")

const db = client.db("Restaurantes")
const LocalCollection = db.collection<LocalModel>("local")

const handler = async(req:Request):Promise<Response> => {
  const url = new URL(req.url)
  const method = req.method
  const path = url.pathname
  const searchParams = url.searchParams

  if(method === "GET") {
    if(path === "/restaurant") {
      const id = searchParams.get("id")
      if(!id) return new Response("Especifique un id", {status:404})
      const local = await LocalCollection.findOne({_id: new ObjectId(id)})
      if(!local) return new Response("No hay un restaurante con ese id", {status:404})
      return new Response(JSON.stringify({
        id: local._id?.toString(),
        name: local.name,
        direction_full: `${local.direction}, ${local.city}, ${local.country}`,
        phone: local.phone,
        temperature: await getTemperature(local.latitude, local.longitude),
        hour: await getTime(local.latitude, local.longitude)
      }))
    } 
    else if(path === "/restaurants") {
      const city = searchParams.get("city") 
      if(!city) return new Response("Seleccione una ciudad específica", {status:404})
      const locales = await LocalCollection.find({city}).toArray()
      if(locales.length === 0) return new Response("No hay restaurantes en esa ciudad", {status:404})
      const localesFinales:Local[] = await Promise.all(locales.map(async(e) => ({
        id: e._id?.toString(),
        name: e.name,
        direction_full: `${e.direction}, ${e.city}, ${e.country}`,
        phone: e.phone,
        temperature: await getTemperature(e.latitude, e.longitude),
        hour: await getTime(e.latitude, e.longitude)
      })))
      return new Response(JSON.stringify(localesFinales))
    }
  } else if(method === "POST") {
    const body:LocalModel= await req.json()
    const requiredField: (keyof LocalModel)[]  = ["name", "direction", "city", "phone"]
    const missing = requiredField.filter(e => !body[e])
    if(missing.length > 0) return new Response(`Falta el dato ${missing}` , {status:404})
    const { is_valid, country } = await validatePhone(body.phone)
    if(!is_valid) return new Response("El número de telefono no es valido", {status: 404})
    
    const local = await LocalCollection.findOne({phone: body.phone})
    if(local) return new Response("Ya hay un restaurante con ese número de telefono", {status:404})

    const { latitude, longitude } = await getLatandLon(body.city)

    const { insertedId } = await LocalCollection.insertOne({
      name: body.name,
      direction: body.direction,
      city: body.city,
      phone: body.phone,
      country,
      latitude,
      longitude
    })

    return new Response(JSON.stringify({
      id: insertedId,
      name: body.name,
      direction: body.direction,
      city: body.city,
      phone: body.phone
    }))
    
  } else if(method === "DELETE") {
    const id = searchParams.get("id")
    if(!id) return new Response("Especifique un id", {status:404})
    const { deletedCount } = await LocalCollection.deleteOne({_id: new ObjectId(id)})
    if(deletedCount === 0 ) return new Response(JSON.stringify(false))
    return new Response(JSON.stringify(true))
  }



  return new Response("Bad request", {status:400})
}

Deno.serve({port:3000}, handler)