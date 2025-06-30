import { OptionalId } from "mongodb"

export type LocalModel = OptionalId<{
    name: string
    direction: string
    city: string
    phone: string
    country: string
    latitude: number
    longitude: number
}>

export type Local = {
    id: string
    name: string
    direction_full: string
    phone: string
    temperature: number
    hour: string
}

// https://api-ninjas.com/api/validatephone
export type Phone_API = {
    is_valid: boolean
    country: string
} 

// https://api-ninjas.com/api/city
export type InfoCity_API = {
    latitude: number
    longitude: number
}

// https://api-ninjas.com/api/weather
export type Weather_API = {
    temp: number
}

// https://api-ninjas.com/api/worldtime
export type Time_API = {
    hour: string
    minute: string
}