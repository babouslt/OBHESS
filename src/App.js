import React, { useState, useEffect } from 'react';
import logo from './logo_OBHESS.png'
import Dropdown from './components/dropdown/index'
import Screens from './components/screens/index'
import './App.css';



function App() {
  const refreshRef = React.useRef(null)
  const [screens, setScreens] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState("screen:0:0");
  const [inputAudioDevices, setInputAudioDevices] = useState([]);
  const [outputAudioDevices, setOutputAudioDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState({
    outputDevice: "",
    inputDevice: ""
  });


  const getScreens = async () => {
    await window.capture.getScreens()
    window.capture.storeScreens(setScreens)
  }

  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputDevices = devices.filter(device => device.kind === 'audioinput');
      const outputDevices = devices.filter(device => device.kind === 'audiooutput');
      setInputAudioDevices(inputDevices);
      setOutputAudioDevices(outputDevices)
      setSelectedDevice({"inputDevice":inputAudioDevices[0]?.deviceId, "outputDevice":outputAudioDevices[0]?.deviceId})
    };
    getDevices();
  }, []);

  useEffect(() => {
    clearInterval(refreshRef.current)
    window.capture.removeEventListener()
    refreshRef.current = setInterval(() => {
    getScreens()
    window.capture.removeEventListener()

    }, 1000)
    return () => clearInterval(refreshRef.current)
  }, [])
  

  const handleDeviceChange = (event) => {
    setSelectedDevice({
      ...selectedDevice,
      [event.target.name]: event.target.value
    })
  }

  const handleScreenChange = (event) => {
    setSelectedScreen(event.target.value)
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: selectedScreen,
          minWidth: 1280,
          maxWidth: 1280,
          minHeight: 720,
          maxHeight: 720
        }
      }
    })
    .then(stream => { 
      const video = document.querySelector('video')
      video.srcObject = stream
      video.onloadedmetadata = (e) => video.play()
    }).catch(err => console.log(err))

  }, [selectedScreen])

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      
      <div className="App-screen">
      <video  width={900} style={{
            backgroundColor: 'grey'
          }} ></video>
      </div>
      
      <div className='App-line'> </div>
      <div className="App-dropdownWrapper">
        <Dropdown list={inputAudioDevices} onChange={handleDeviceChange} name="inputDevice"/>
        <Dropdown list={outputAudioDevices} onChange={handleDeviceChange} name="outputDevice"/>
        <Screens list={screens} onChange={handleScreenChange} name="screens" />
      </div>
    </div>

  );

}

 

export default App;

 

/*<label >Select Audio Input: </label>

      <select className='App-dropdown' id="audio-input-select" value={selectedDevice} onChange={handleDeviceChange}>

        {inputDevices.map(device => (

          <option key={device.deviceId} value={device.deviceId}>

            {device.label || `Microphone ${device.deviceId}`}

          </option>

        ))}

      </select>

      <select value={selectedDevice} onChange={handleDeviceChange}>  </select>

      <Dropdown list={inputDevices} onChange={handleDeviceChange} device={selectedDevice}/> */