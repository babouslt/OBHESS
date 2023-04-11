import React, { useState, useEffect } from 'react';
import logo from './logo_OBHESS.png'
import Dropdown from './components/dropdown/index'
import Screens from './components/screens/index'
import styled from 'styled-components'
import './App.css';
const newRecorder = React.createContext(null) 

function App() {

//Déclaration de toute nos variables
//========================================================================================================================
  const [isButtonStartClickable, setIsButtonStartClickable] = useState(false);
  const [isButtonStopClickable, setIsButtonStopClickable] = useState(false);
  const [stream, setStream] = useState();
  const [micStream, setMicStream] = useState();
  const [screenStream, setScreenStream] = useState();
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

//Fonctions pour choisir le dossier d'enregistrement
//========================================================================================================================
  const choosePath = () => {
    setIsButtonStartClickable(true);
    setIsButtonStopClickable(false);
    window.path.openDialog();
    window.path.getPath(setSavePath);
  }

  useEffect(() => {
    console.log(savePath)
  }, [savePath])

//Fonctions pour contrôler le volume (non fonctionnel)
//========================================================================================================================

  const handleInputVolumeChange = (event) => {
    setInputVolume(event.target.value);
  }

  const handleOutputVolumeChange = (event) => [
    setOutputVolume(event.target.value)
  ]

//Fonction pour récupérer les écrans et applications ouvertes
//========================================================================================================================

  const getScreens = async () => {
    await window.capture.getScreens()
    window.capture.storeScreens(setScreens)
  }

//Fonction pour récupérer les différents périphériques audio
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

//Fonction pour raffraichir les écrans détectés tout les x temps
//========================================================================================================================
  useEffect(() => {
    clearInterval(refreshRef.current)
    window.capture.removeEventListener()
    refreshRef.current = setInterval(() => {
    getScreens()
    window.capture.removeEventListener()

    }, 1000)
    return () => clearInterval(refreshRef.current)
  }, [])
  
//Fonctions pour choisir les écrans et périphériques audio souhaités
//========================================================================================================================
  const handleDeviceChange = (event) => {
    setSelectedDevice({
      ...selectedDevice,
      [event.target.name]: event.target.value
    })
  }

  const handleScreenChange = (event) => {
    setSelectedScreen(event.target.value)
  }

//Fonctions pour lancer et stopper le record
//========================================================================================================================
  const startRecord = () => { 
    setIsButtonStartClickable(false);
    setIsButtonStopClickable(true);

    const chunks = [];

    //Tentative d'assembler pistes audio du bureau et du microphone
    const combinedStream = new MediaStream();
    combinedStream.addTrack(screenStream.getVideoTracks()[0]);
    combinedStream.addTrack(screenStream.getAudioTracks()[0]);
    combinedStream.addTrack(micStream.getAudioTracks()[0]);
    const recorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp9' })
    newRecorder.Provider = recorder
    newRecorder.Provider.ondataavailable = (e) => chunks.push(e.data);

    newRecorder.Provider.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const filename = `\\recorded-video-${Date.now()}.webm`;
      const filepath = (savePath + filename)
      const reader = new FileReader();
      reader.onload = () => {
        window.record.saveFile(filepath,
          reader.result)
      };
      reader.readAsArrayBuffer(blob);
    
    };
    newRecorder.Provider.start();
  }

  const stopRecord = () => { 
    setIsButtonStartClickable(true);
    setIsButtonStopClickable(false);
    newRecorder.Provider.stop();
  }

//Fonction pour récupérer les flux vidéo et audio
//========================================================================================================================
  useEffect(() => {

    //Capture du microphone
    navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: selectedDevice.inputDevice,
      }
    })
    .then(micStream => {
      setMicStream(micStream)
    })

    //Capture de la vidéo et du son du bureau
    navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'desktop',
        }  
      },
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: selectedScreen,
          minWidth: 1280,
          maxWidth: 1920,
          minHeight: 720,
          maxHeight: 1080
        }
      }
    })
    .then(screenStream => { 
      setScreenStream(screenStream)
      const video = document.querySelector('video')
      video.srcObject = screenStream
      video.onloadedmetadata = (e) => video.play()
    }).catch(err => console.log(err))
  }, [selectedScreen, selectedDevice])

  return (
    <ContainerApp>
      
      <Logo src={logo} alt="logo"></Logo>

      <ContainerScreen>
        <video muted width={1200}></video>
      </ContainerScreen>
      
      <ContainerAll>
        <ContainerLeftRight>
          <div >
            <label>Volume du micro : {inputVolume}% </label>
            <input type="range" min="0" max="100" value={inputVolume} onChange={handleInputVolumeChange} />
          </div>
          <div >
            <label>Volume des haut-parleurs : {outputVolume}%</label>
          <input type="range" min="0" max="100" value={outputVolume} onChange={handleOutputVolumeChange} />
          </div>
        </ContainerLeftRight>

        <ContainerDropdown>
          <Dropdown list={inputAudioDevices} onChange={handleDeviceChange} name="inputDevice"/>
          <Screens list={screens} onChange={handleScreenChange} name="screens" />
        </ContainerDropdown>
        
        <ContainerLeftRight>
          <Button id="select" onClick={choosePath}> Select a directory </Button>
          <Button id="start" onClick={startRecord} disabled={!isButtonStartClickable}> Start recording </Button>
          <Button id="stop" onClick={stopRecord} disabled={!isButtonStopClickable}> Stop recording </Button>
        </ContainerLeftRight>
      </ContainerAll>
    </ContainerApp>
  );

}

const ContainerScreen = styled.div`
  align-items: center;
  text-align: center;
  flex-direction: column;
`
const ContainerApp = styled.div`
  background: linear-gradient(180deg, #50D2EA 0%, #28516B 100%);
  width: 100vw;
  height: 100vh;
`
const ContainerAll = styled.div`
  display: flex;
`

const Logo = styled.img`
  animation: App-logo-spin infinite 20s linear;
  height: 15vmin;
  pointer-events: none;
`
const Button = styled.button`
  background-color: white;
  color: black;
  border: none;
  font-size: 1.2em;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out; // Ajout de la transition sur la propriété background-color

  &:hover {
    background-color: #0056b3; // Nouvelle couleur de fond au survol
  }
  &:disabled:hover {
    cursor: default;
    opacity: 0.5;
  }
`

const ContainerLeftRight = styled.div`
  border-top: 4px solid white;
  width: 25%;
  align-items: center;
  text-align: center;
  padding-left:5px;
  display: flex;
  justify-content: space-between;
`
const ContainerDropdown = styled.div`
  border-left: 4px solid white;
  border-right: 4px solid white;
  border-top: 4px solid white;
  width: 50%;
  align-items: center;
  text-align: center;
  flex-direction: column;
`

export default App;
