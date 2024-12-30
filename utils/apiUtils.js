const apiKey = process.env.ORS_API_KEY
const driverManager = []
const passengerManager = []

if(!apiKey){
    console.error("no api key found")
}

export function compileDriverManagerFromPractice(drivers, practiceLocation){
    for(let i = 0; i < drivers.length; i++){
        const driverProfile = {
            "id": i+1,
            "description": drivers[i]["name"],
            "profile": "driving-car",
            "skills": drivers[i]["has8AM"] ? [0, 1] : [0],
            "start": practiceLocation,
            "end": drivers[i]["address"],
            "max_tasks": 2*drivers[i]["capacity"],
            "capacity": [drivers[i]["capacity"]]
        }
        driverManager.push(driverProfile)
    }
}

export function compilePassengerManagerFromPractice(passengers, practiceLocation){
    for(let i = 0; i < passengers.length; i++){
        const passengerProfile = {
            "id": i+1,
            "description": passengers[i]["name"],
            "amount": [1],
            "skills": passengers[i]["has8AM"] ? [0, 1] : [0],
            "pickup": {"id": i+1, "location": practiceLocation},
            "delivery": {"id": i+1, "location": passengers[i]["address"]}
        }
        passengerManager.push(passengerProfile)
    }
}

export function compileDriverManagerToPractice(drivers, practiceLocation){
    for(let i = 0; i < drivers.length; i++){
        const driverProfile = {
            "id": i+1,
            "description": drivers[i]["name"],
            "profile": "driving-car",
            "skills": [0, 1],
            "start": drivers[i]["address"],
            "end": practiceLocation,
            "max_tasks": 2*drivers[i]["capacity"],
            "capacity": [drivers[i]["capacity"]]
        }
        driverManager.push(driverProfile)
    }
}

export function compilePassengerManagerToPractice(passengers, practiceLocation){
    for(let i = 0; i < passengers.length; i++){
        const passengerProfile = {
            "id": i+1,
            "description": passengers[i]["name"],
            "amount": [1],
            "skills": [0, 1],
            "pickup": {"id": i+1, "location": passengers[i]["address"]},
            "delivery": {"id": i+1, "location": practiceLocation}
        }
        passengerManager.push(passengerProfile)
    }
}

function resetManagers(){
    driverManager.length = 0
    passengerManager.length = 0
}

function findNameById(id){
    for(let i = 0; i < passengerManager.length; i++){
        if(passengerManager[i].id == id){
            return passengerManager[i]["description"]
        }
    }
}

export async function generateCarpools(){
    const generatedCarpool = {}
    const carpoolAddresses = {}

    const requestPayload = {
        "shipments": passengerManager,
        "vehicles": driverManager
    }

    console.log(requestPayload)

    const headers = {
        "Authorization": apiKey,
        "Content-Type": "application/json"
    }

    const apiResp = await fetch("https://api.openrouteservice.org/optimization", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestPayload)
    })
    
    const jsonParsedResp = await apiResp.json()

    console.log(jsonParsedResp)
    if(jsonParsedResp["code"] === 0){
        const allRoutes = jsonParsedResp["routes"]
        for(let i = 0; i < allRoutes.length; i++){
            let driverName = allRoutes[i]["description"]
            let passengerList = []
            let passengerAddresses = []
            for(let j = 0; j < allRoutes[i]["steps"].length; j++){
                if(allRoutes[i]["steps"][j]["type"] === "pickup"){
                    passengerList.push(findNameById(allRoutes[i]["steps"][j]["id"]))
                    passengerAddresses.push(allRoutes[i]["steps"][j]["location"].reverse())
                }
            }
            carpoolAddresses[driverName] = passengerAddresses
            generatedCarpool[driverName] = passengerList
        }
    } else {
        console.error("ERROR IN API RESPONSE")
    }
    
    resetManagers()

    return [generatedCarpool, carpoolAddresses]
}