import React, { useState, useEffect } from 'react';
import logo from './logo_OBHESS.png'
import Dropdown from './components/dropdown/index'
import Screens from './components/screens/index'
import './App.css';
const newRecorder = React.createContext(null) 

function App() {

  const [recorder, setRecorder] = useState(null);
  const [stream, setStream] = useState();
  const [savePath, setSavePath] = useState("");
  const [volumes, setVolumes] = useState([]);
  const [inputVolume, setInputVolume] = useState(50);
  const [outputVolume, setOutputVolume] = useState(50);
  const refreshRef = React.useRef(null)
  const [screens, setScreens] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState("screen:0:0");
  const [inputAudioDevices, setInputAudioDevices] = useState([]);
  const [outputAudioDevices, setOutputAudioDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState({
    outputDevice: "",
    inputDevice: ""
  });


/*useEffect(() => {
  window.volume.getVolumes();
  window.volume.storeVolumes(setVolumes)
  setInputVolume(volumes[0])
  setOutputVolume(volumes[1])
}, []);*/

//========================================================================================================================
  const choosePath = () => {
    window.path.openDialog();
    window.path.getPath(setSavePath);
  }

  useEffect(() => {
    console.log(savePath)
  }, [savePath])
//========================================================================================================================

  const handleInputVolumeChange = (event) => {
    setInputVolume(event.target.value);
  }

  const handleOutputVolumeChange = (event) => [
    setOutputVolume(event.target.value)
  ]

//========================================================================================================================

  const getScreens = async () => {
    await window.capture.getScreens()
    window.capture.storeScreens(setScreens)
  }

//========================================================================================================================

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

  const startRecord = () => { 
    const _ = require('lodash');
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' })
    newRecorder.Provider = recorder
    console.log(newRecorder.Provider)
    newRecorder.Provider.ondataavailable = (e) => chunks.push(e.data);

    newRecorder.Provider.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const filename = `\\recorded-video-${Date.now()}.webm`;
      
      const filepath = (savePath + filename)
      const reader = new FileReader();

      //path.join(savePath,filename);
      console.log(filepath)
      console.log(blob)
      // const cloneBlob = _.cloneDeep(blob)
      // console.log(cloneBlob)
      reader.onload = () => {
        // reader.result contient l'ArrayBuffer
        window.record.saveFile(filepath,
          reader.result)
      };
      reader.readAsArrayBuffer(blob);
    
    };
    newRecorder.Provider.start();
  }

  const stopRecord = () => { 
    newRecorder.Provider.stop();
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: selectedDevice.inputDevice
        }
      },
  
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
      setStream(stream)
      const video = document.querySelector('video')
      video.srcObject = stream
      video.onloadedmetadata = (e) => video.play()
    }).catch(err => console.log(err))

  }, [selectedScreen, selectedDevice])


  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      
      <div className="App-screen">
      <video  width={900} style={{
            backgroundColor: 'grey'
          }} ></video>
      </div>
      
      <div className='App-line'> </div>
      <div className='App-options'>
        <div className="sliders">
          <div className="slider">
            <label>Volume du micro : {inputVolume}% </label>
            <input type="range" min="0" max="100" value={inputVolume} onChange={handleInputVolumeChange} />
          </div>
          <div className="slider">
            <label>Volume des haut-parleurs : {outputVolume}%</label>
          <input type="range" min="0" max="100" value={outputVolume} onChange={handleOutputVolumeChange} />
          </div>
        </div>

        <div className="App-dropdownWrapper">
          <Dropdown list={inputAudioDevices} onChange={handleDeviceChange} name="inputDevice"/>
          <Dropdown list={outputAudioDevices} onChange={handleDeviceChange} name="outputDevice"/>
          <Screens list={screens} onChange={handleScreenChange} name="screens" />
        </div>
        <div>
        <button id="select" onClick={choosePath}>Select a directory</button>
        <button id="start" onClick={startRecord}>Start recording</button>
        <button id="stop" onClick={stopRecord}>Stop recording</button>
        <p id="selected"></p>
        </div>
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