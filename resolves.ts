import { InfoCity_API, Phone_API, Time_API, Weather_API } from "./types.ts";

export const validatePhone = async(phone:string):Promise<Phone_API> => {
    const API_KEY = Deno.env.get("API_KEY")
    if(!API_KEY) throw new Error("Error con la API_KEY")

    const data = await fetch(`https://api.api-ninjas.com/v1/validatephone?number=${phone}`, {
        headers: {
            'X-Api-Key': API_KEY
        },
    })
    const result:Phone_API = await data.json()
    return ({
        is_valid : result.is_valid,    
        country: result.country
    })
}

export const getLatandLon = async(city: string):Promise<InfoCity_API> => {
    const API_KEY = Deno.env.get("API_KEY")
    if(!API_KEY) throw new Error("Error con la API_KEY")

    const data = await fetch(`https://api.api-ninjas.com/v1/city?name=${city}`, {
        headers: {
            'X-Api-Key': API_KEY
        },
    })
    const result:InfoCity_API[] = await data.json()
    return ({
        latitude: result[0].latitude,
        longitude: result[0].longitude
    })
}

export const getTemperature = async(latitude: number, longitude: number):Promise<number> => {
    const API_KEY = Deno.env.get("API_KEY")
    if(!API_KEY) throw new Error("Error con la API_KEY")

    const data = await fetch(`https://api.api-ninjas.com/v1/weather?lat=${latitude}&lon=${longitude}`, {
        headers: {
            'X-Api-Key': API_KEY
        },
    })
    const result:Weather_API = await data.json()
    return result.temp
}

export const getTime = async(latitude: number, longitude: number):Promise<string> => {
    const API_KEY = Deno.env.get("API_KEY")
    if(!API_KEY) throw new Error("Error con la API_KEY")

    const data = await fetch(`https://api.api-ninjas.com/v1/worldtime?lat=${latitude}&lon=${longitude}`, {
        headers: {
            'X-Api-Key': API_KEY
        },
    })

    const result:Time_API = await data.json()
    return `${result.hour}:${result.minute}`
}