import React, { useState, useEffect } from 'react';
import logo from './logo_OBHESS.png'
import './App.css';



function App() {

  const [inputDevices, setInputDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  

  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputDevices = devices.filter(device => device.kind === 'audioinput');
      setInputDevices(inputDevices);
      setSelectedDevice(inputDevices[0]?.deviceId);
    };
    getDevices();
  }, []);

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  }
  
  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <div className="App-screen"></div>
      <div className='App-line'> </div>
      <div className="App-dropdownWrapper">
      <label >Select Audio Input: </label>
      <select className='App-dropdown' id="audio-input-select" value={selectedDevice} onChange={handleDeviceChange}>
        {inputDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId}`}
          </option>
        ))}
      </select> 
      </div>
      
    </div>
  );
}

export default App;
