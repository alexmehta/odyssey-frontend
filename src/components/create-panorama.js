import React, { Component, createContext, useState, useSyncExternalStore , useRef, useReducer} from "react";
import { Pannellum, PannellumVideo} from "pannellum-react";
function AddPano({ addPano }) {
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
    }
    function list(e){

      console.log("what should be inserted", e)
      return e;

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
    
    var a  = loadHotspots(link);
    a.push({"link":url,"text":text,"x":x,"y":y});
    hotspotMap.set(link,a);

    forceUpdate();
  }
  function getPos(evt){
    console.log("Evt",evt);


    console.log(ref.current.getViewer())
    return ref.current.getViewer().mouseEventToCoords(evt);
  }

  function getPanellum(link){
    const panel =(
      <Pannellum  ref={ref}
        width="100%"
        height="500px"
        image={link}
        pitch={30}
        yaw={180}
        hfov={110}
        autoLoad

        onMousedown={
          (evt)=>{
              // console.log("click",evt)

              posLog.set(link,getPos(evt));
              
          }
        }>

        {list(mappings(link))}
</Pannellum>

    ); 
    console.log("panel",panel);
          return (
            <>
           {panel} 
            <div className="panellum-form">{hotspotForm(link)}</div>
            </>
      
        );

      }

    function mappings(link){
      console.log("hotspot", hotspotMap.get(link))
      const b = ((loadHotspots(link)).flatMap(element => (createHotspot(element.text,element.link,element.y||0,element.x||0))));
      console.log("hotspots array",b);
      return b;
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
