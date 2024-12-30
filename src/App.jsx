import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Map from "./Map.jsx"
// import {v4 as uuidv4} from "uuid"
import { compileDriverManagerFromPractice, compileDriverManagerToPractice, compilePassengerManagerFromPractice, compilePassengerManagerToPractice, generateCarpools } from "../utils/apiUtils.js"

function App() {
  const [drivers, setDrivers] = useState([])
  const [passengers, setPassengers] = useState([])
  const [practiceType, setPracticeType] = useState(true)
  const [driverHas8AM, setDriverHas8AM] = useState(false)
  const [passengerHas8AM, setPassengerHas8AM] = useState(false)
  const [keyCounter, setKeyCounter] = useState(0)
  const [formSubmitted, setFormSubmitted] = useState(false)
  
  const [carpoolTo, setCarpoolTo] = useState(null)
  const [carpoolFrom, setCarpoolFrom] = useState(null)
  const [carpoolAddresses, setCarpoolAddresses] = useState(null)

  /*
    Practice type indicates whether indoor or outdoor
    outdoor -> true
    indoor -> false
  */
  
  const driverFormSubmitHandler = () => {
    const driverName = document.querySelector("#driver-name-input").value
    const driverAddress = document.querySelector("#driver-address-input").value
    const parsedAddress = driverAddress.split(",").map((coord) => parseFloat(coord.trim()))
    const driverCapacity = Number(document.querySelector("#driver-capacity-input").value)

    if(parsedAddress.length === 2 && driverCapacity > 0){
      setDrivers((prevState) => [...prevState, {"id": keyCounter, "name": driverName, "address": parsedAddress, "has8AM": driverHas8AM, "capacity": driverCapacity}])
      setKeyCounter((prev) => prev+1)
    } else {
      alert("Driver entry could not be verified ensure that the address and capacity were entered correctly")
    }
  }

  const passengerFormSubmitHandler = () => {
    const passengerName = document.querySelector("#passenger-name-input").value
    const passengerAddress = document.querySelector("#passenger-address-input").value
    const parsedAddress = passengerAddress.split(",").map((coord) => parseFloat(coord.trim()))

    // Basic form validation
    if(parsedAddress.length === 2){
      setPassengers((prevState) => [...prevState, {"id": keyCounter, "name": passengerName, "address": parsedAddress, "has8AM": passengerHas8AM}])
      setKeyCounter((prev) => prev+1)
    } else {
      alert("Passenger entry could not be verified ensure that the address was entered correctly")
    }
  }

  const removeListItem = (item, type) => {
    if(type === "driver"){
      setDrivers((prev) => prev.filter((element) => element["id"] !== item["id"]))
    } else {
      setPassengers((prev) => prev.filter((element) => element["id"] !== item["id"]))
    }
  }

  return (
    <>
      <h1>Carpool Generator 🚘</h1>
      <div className="card">
        <h2>Drivers:</h2>
        <form className="wrapper-form" action={driverFormSubmitHandler}>
          <div className="form-flex">
            <div>
              <h3>Name</h3>
              <input className="text-input" id="driver-name-input" placeholder="John Doe" type="text" required />
            </div>
            <div>
              <h3>Address</h3>
              <input className="text-input" id="driver-address-input" placeholder="123 Sesame Street" type="text" required />
            </div>
          </div>
          <div className="form-flex">
            <div>
              <h3>Car Capacity</h3>
              <input className="text-input" id="driver-capacity-input" placeholder="4" type="text" required />
            </div>
            <div>
              <h3>8 AM?</h3>
              <button type="button" onClick={() => {setDriverHas8AM(!driverHas8AM)}} className={!driverHas8AM ? "practice-type-outdoor" : "practice-type-indoor"}>{driverHas8AM ? "Yes" : "No"}</button>
            </div>
          </div>
          <input type="submit" value="Add Driver" className="submission-btn" id="driver-add-btn" />
        </form>
        <h2>Passengers:</h2>
        <form className="wrapper-form" action={passengerFormSubmitHandler}>
          <div className="form-flex">
            <div>
              <h3>Name</h3>
              <input className="text-input" id="passenger-name-input" placeholder="John Doe" type="text" required />
            </div>
            <div>
              <h3>Address</h3>
              <input className="text-input" id="passenger-address-input" placeholder="123 Sesame Street" type="text" required />
            </div>
            <div>
              <h3>8 AM?</h3>
              <button type="button" onClick={() => {setPassengerHas8AM(!passengerHas8AM)}} className={!passengerHas8AM ? "practice-type-outdoor" : "practice-type-indoor"}>{passengerHas8AM ? "Yes" : "No"}</button>
            </div>
          </div>
          <input type="submit" value="Add Passenger" className="submission-btn" id="passenger-add-btn" />
        </form>
        
        <button onClick={() => {setPracticeType(!practiceType)}} className={practiceType ? "practice-type-outdoor" : "practice-type-indoor"}>{practiceType ? "Outdoor Practice" : "Indoor Practice"}</button>

        <h2>Your Roster:</h2>
        <h3>Drivers:</h3>
        <div id="driver-entries" className="member-listing">
          {
            drivers.map((driver) => (
              <h4 className="member-list-item" onClick={() => {removeListItem(driver, "driver")}} key={driver["id"]}>
                {driver["has8AM"] ? <u>{driver["name"]}</u> : driver["name"]}
              </h4>
            ))
          }
        </div>
        <h3>Passengers:</h3>
        <div id="passenger-entries" className="member-listing">
          {
            passengers.map((passenger) => (
              <h4 className="member-list-item" onClick={() => {removeListItem(passenger, "passenger")}} key={passenger["id"]}>{passenger["has8AM"] ? <u>{passenger["name"]}</u> : passenger["name"]}</h4>
            ))
          }
        </div>
        <button onClick={async() => {
          // TODO: holy god add error checking
          if(practiceType){
            // practice outdoor -> need two calls (one for to and one for from practice)
            compileDriverManagerToPractice(drivers, [-83.13193469203802, 40.169754751844344])
            compilePassengerManagerToPractice(passengers, [-83.13193469203802, 40.169754751844344])
            // carpoolTo = await generateCarpools()[0]
            let result = await generateCarpools()
            if(result){
              setCarpoolTo(result[0])
              setCarpoolAddresses(result[1])
            } else {
              alert("Exception occurred in handling API request, notify creator ASAP")
            }

            compileDriverManagerFromPractice(drivers, [-83.13193469203802, 40.169754751844344])
            compilePassengerManagerFromPractice(passengers, [-83.13193469203802, 40.169754751844344])
            result = await generateCarpools()
            if(result){
              setCarpoolFrom(result[0])
            } else {
              alert("Exception occurred in handling API request, notify creator ASAP")
            }
            // carpoolAddresses = result[1]
          } else {
            // practice indoor -> need only 1 call
            compileDriverManagerToPractice(drivers, [-83.03185150251393, 40.00290410481183])
            compilePassengerManagerToPractice(passengers, [-83.03185150251393, 40.00290410481183])
            const result = await generateCarpools()
            if(result){
              setCarpoolTo(result[0])
              setCarpoolAddresses(result[1])
            } else {
              alert("Exception occurred in handling API request, notify creator ASAP")
            }
          }
          setFormSubmitted(!formSubmitted)
        }} id="generate-btn">Generate Carpools</button>
      </div>
      { formSubmitted && 
        <>
          <h2>Carpool Pickup Visualizer</h2>
          <Map driverMapping={carpoolAddresses} />
          <h2>Carpool Listing</h2>
          <h3>Carpools to Practice:</h3>
          <table className="carpool-table">
            <thead>
              <tr>
                <th className='driver-cell'><h3>Driver</h3></th>
                <th><h4>Passengers</h4></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(carpoolTo).map(([driverName, carpoolContents]) => (
                  <tr key={`${driverName}`}>
                    <td className="driver-cell"><h3>{driverName}</h3></td>
                    <td><h4>{carpoolContents.join(", ")}</h4></td>
                  </tr>
              ))}
            </tbody>
          </table>
          {carpoolFrom && 
            <>
              <h3>Carpools from Practice:</h3>
              <table className="carpool-table">
                <thead>
                  <tr>
                    <th className='driver-cell'><h3>Driver</h3></th>
                    <th><h4>Passengers</h4></th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(carpoolFrom).map(([driverName, carpoolContents]) => (
                    <tr key={`${driverName}`}>
                      <td className="driver-cell"><h3>{driverName}</h3></td>
                      <td><h4>{carpoolContents.join(", ")}</h4></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          }
        </>
      }
    </>
  )
}

export default App
