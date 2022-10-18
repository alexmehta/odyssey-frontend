import React, { Component, createContext, useState, useSyncExternalStore , useRef, useReducer} from "react";
import { Pannellum, PannellumVideo} from "pannellum-react";
function AddPano({ addPano }) {
var config = {
    hfov: 100,
    minHfov: 50,
    multiResMinHfov: false,
    maxHfov: 120,
    pitch: 0,
    minPitch: undefined,
    maxPitch: undefined,
    yaw: 0,
    minYaw: -180,
    maxYaw: 180,
    roll: 0,
    haov: 360,
    vaov: 180,
    vOffset: 0,
    autoRotate: false,
    autoRotateInactivityDelay: -1,
    autoRotateStopDelay: undefined,
    type: 'equirectangular',
    northOffset: 0,
    showFullscreenCtrl: true,
    dynamic: false,
    dynamicUpdate: false,
    doubleClickZoom: true,
    keyboardZoom: true,
    mouseZoom: true,
    showZoomCtrl: true,
    autoLoad: false,
    showControls: true,
    orientationOnByDefault: false,
    hotSpotDebug: false,
    backgroundColor: [0, 0, 0],
    avoidShowingBackground: false,
    draggable: true,
    dragConfirm: false,
    disableKeyboardCtrl: false,
    crossOrigin: 'anonymous',
    targetBlank: false,
    touchPanSpeedCoeffFactor: 1,
    capturedKeyNumbers: [16, 17, 27, 37, 38, 39, 40, 61, 65, 68, 83, 87, 107, 109, 173, 187, 189],
    friction: 0.15
};
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState("");
  const [fileSize, setFileSize] = useState(true);
  const [image,setImage]= useState(null)
  const [hotspotMap,setMap] = useState(new Map());
  const [posLog,setLog]= useState(new Map());
  const [,forceUpdate] = useReducer(x=>x+1,0)
  const ref = useRef(null); 
  // for file upload progress message
  const [fileUploadProgress, setFileUploadProgress] = useState(false);
  //for displaying response message
  const [fileUploadResponse, setFileUploadResponse] = useState(null);
 const createHotspotHandler = (e)=>{
      e.preventDefault();
      e = e.target;
      saveHotspot(e.id.value,e.text.value,e.text.link,posLog.get(e.id.value)[0],posLog.get(e.id.value)[1]);
      forceUpdate()
    }
  //base end point url
  const FILE_RETRIVE_ENDPOINT = "http://localhost:8019/get/content/" 
  const FILE_UPLOAD_BASE_ENDPOINT = "http://localhost:8019/insert/";
  const [tour,setTour] = useState(null)
  const [show,setShow] = useState(true)
  const uploadFileHandler = (event) => {
    setFiles(event.target.files);
  };
  const fileSubmitHandler = (event) => {
    event.preventDefault();
    setFileSize(true);
    setFileUploadProgress(true);
    setFileUploadResponse(null);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      if (files[i].size >20000000000000) {
        setFileSize(false);
        setFileUploadProgress(false);
        setFileUploadResponse(null);
        return;
      }

      formData.append("files", files[i]);
    }

    const requestOptions = {
      method: "POST",
      body: formData,
    };
    fetch(FILE_UPLOAD_BASE_ENDPOINT + name + "/" + description, requestOptions)
      .then(async (response) => {
        const isJson = response.headers
          .get("content-type")
          ?.includes("application/json");
        const data = isJson && (await response.json());

        // check for error response
        if (!response.ok) {
          // get error message
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
        }
        
        setShow(false)
        setTour(data)
        
      })
      .catch((error) => {
        console.error("Error Retriving File", error);
      });
      

    setFileUploadProgress(false);
  };

  const form = (
    <form encType="multipart/form-data" onSubmit={fileSubmitHandler}>
      <label>Enter Name</label>
      <input
        required
        onChange={(e) => setName(e.target.value)}
        value={name}
        type="text"
      ></input>
      <label>Enter Description</label>
      <input
        required
        onChange={(e) => setDescription(e.target.value)}
        value={description}
        type="text"
      ></input>
      <input type="file" multiple onChange={uploadFileHandler}/>
      <button type="submit">Upload</button>
      {!fileSize && <p style={{ color: "red" }}>File size exceeded!!</p>}
      {fileUploadProgress && <p style={{ color: "red" }}>Uploading File(s)</p>}
      {fileUploadResponse != null && (
        <p style={{ color: "green" }}>{fileUploadResponse}</p>
      )}
    </form>
  );
  function createHotspot(text,link,yaw,pitch){

      return (
       <Pannellum.Hotspot
        type="info"
        pitch={pitch}
        yaw={yaw}
        text={text}
        URL={link}
              />
      )

  }
  function loadHotspots(link){
      return hotspotMap.get(link) ||[];
  }
  function saveHotspot(link,text,url,x,y){
    
    var a  = hotspotMap.get(link) ||[] ;
    a.push({"link":url,"text":text,"x":x,"y":y});
    hotspotMap.set(link,a);
  }
  function getPos(evt){
    console.log("Evt",evt);


    console.log(ref.current.getViewer())
    return ref.current.getViewer().mouseEventToCoords(evt);
  }

  function getPanellum(link){
          return (<>
           <div className="panellum"> 
    <Pannellum ref={ref}
        width="100%"
        height="500px"
        image={link}
        pitch={30}
        yaw={180}
        hfov={110}
        autoLoad
        onLoad={() => {
        }}
        onMousedown={
          (evt)=>{
              // console.log("click",evt)

              posLog.set(link,getPos(evt));
              
          }
        }
        
        >
          {mappings(link)}


        </Pannellum>
</div>
      <div className="panellum-form">{hotspotForm(link)}</div>
      
        </>
        )

      }

    function mappings(link){
      console.log("hotspot", hotspotMap.get(link))
      return ((hotspotMap.get(link))||[]).map(element => (createHotspot(element.text,element.link,posLog.get(link)[0]||0,posLog.get(link)[1]||0))) 
    }
    function hotspotForm(link) {
      return (
<div>
        <form onSubmit={createHotspotHandler}>

          <input hidden value={link} name="id"></input>
          <label>Text</label>
          <input type="text" name="text" required></input>
          <label>URL</label>
          <input type="text" name="link"></input>
          <input type="submit" value="Create Hotspot"></input>

        </form>
      </div>
      )

    }
   
    function listPanos(tour){
      if(!nullTour()){

      console.log("Test") 
      return tour.panoramaFrames.map((pano=>(<li>
        <div>
          {getPanellum(FILE_RETRIVE_ENDPOINT + pano.contentID)}
        </div>
      </li>)));
      }
      else return "";
    }

  function nullTour(){
      return tour === null;
  }

  
 return (<>{show&& form }
        {!show && listPanos(tour)}
 </>);
}
export default AddPano;
