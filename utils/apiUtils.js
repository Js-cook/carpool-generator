const apiKey = import.meta.env.VITE_ORS_API_KEY
const driverManager = []
const passengerManager = []

if(!apiKey){
    console.error("no api key found")
}

export function compileDriverManagerFromPractice(drivers, practiceLocation){
    for(let i = 0; i < drivers.length; i++){
        // TODO: THIS HAS BEEN UPDATED
        const driverProfile = {
            "id": drivers[i]["name"],
            "description": drivers[i]["name"],
            // "profile": "driving-car",
            "capabilities": [drivers[i]["has8AM"] ? [0, 1] : [0]],
            "start_location": practiceLocation,
            "end_location": drivers[i]["address"],
            // "max_tasks": 2*drivers[i]["capacity"],
            "pickup_capacity": drivers[i]["capacity"],
            "delivery_capacity": drivers[i]["capacity"]
        }
        driverManager.push(driverProfile)
    }
}

export function compilePassengerManagerFromPractice(passengers, practiceLocation){
    for(let i = 0; i < passengers.length; i++){
        // TODO: THIS HAS BEEN UPDATED
        const passengerProfile = {
            "id": `${passengers[i]["name"]} - ${i+1}`,
            "description": passengers[i]["name"],
            "amount": 1,
            "requirements": [passengers[i]["has8AM"] ? [0, 1] : [0]],
            "pickup": {"location": practiceLocation},
            "delivery": {"location": passengers[i]["address"]}
        }
        passengerManager.push(passengerProfile)
    }
}

export function compileDriverManagerToPractice(drivers, practiceLocation){
    for(let i = 0; i < drivers.length; i++){
        // TODO: THIS HAS BEEN UPDATED
        const driverProfile = {
            "id": drivers[i]["name"],
            "description": drivers[i]["name"],
            // "profile": "driving-car",
            "capabilities": [0, 1],
            "start_location": drivers[i]["address"],
            "end_location": practiceLocation,
            // "max_tasks": 2*drivers[i]["capacity"],
            "pickup_capacity": drivers[i]["capacity"],
            "delivery_capacity": drivers[i]["capacity"]
        }
        driverManager.push(driverProfile)
    }
}

export function compilePassengerManagerToPractice(passengers, practiceLocation){
    for(let i = 0; i < passengers.length; i++){
        // TODO: THIS HAS BEEN UPDATED
        const passengerProfile = {
            "id": `${passengers[i]["name"]} - ${i+1}`,
            "description": passengers[i]["name"],
            "amount": 1,
            "requirements": [0, 1],
            "pickup": {"location": passengers[i]["address"]},
            "delivery": {"location": practiceLocation}
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

    // const requestPayload = {
    //     "shipments": passengerManager,
    //     "vehicles": driverManager
    // }

    // TODO: THIS HAS BEEN UPDATED
    const requestPayload = {
        "mode": "drive",
        "agents": driverManager,
        "shipments": passengerManager
    }

    console.log(requestPayload)

    // TODO: THIS HAS BEEN UPDATED
    const headers = {
        // "Authorization": apiKey,
        "Content-Type": "application/json"
    }

    // https://api.openrouteservice.org/optimization
    // TODO: UPDATE URL
    const apiResp = await fetch(`https://api.geoapify.com/v1/routeplanner?apiKey=${apiKey}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestPayload)
    })
    
    const jsonParsedResp = await apiResp.json()

    // TODO: UPDATE PARSING
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