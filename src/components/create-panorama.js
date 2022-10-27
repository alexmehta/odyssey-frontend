import React, {
  useState,
  useRef,
  useReducer,
} from "react";
import { Pannellum} from "pannellum-react";
import {useNavigate} from "react-router-dom";
function AddPano({ addPano }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState("");
  const navigate = useNavigate();
  const [fileSize, setFileSize] = useState(true);
  const [image, setImage] = useState(null);
  const [hotspotMap, setMap] = useState(new Map());
  const [posLog, setLog] = useState(new Map());
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [hotType, setType] = useState("info");
  const ref = useRef(null);
  // for file upload progress message
  const [fileUploadProgress, setFileUploadProgress] = useState(false);
  //for displaying response message
  const [fileUploadResponse, setFileUploadResponse] = useState(null);
  function saveTransition(id,link,trans,x,y){
    var a = loadHotspots(id);
    a.push({ type:"transition" ,link: link, tran: trans, x: x, y: y });
    hotspotMap.set(id, a);
    console.log("saved")
    forceUpdate();

  }
  const createHotspotHandler = (e) => {
    e.preventDefault();
    e = e.target;

    console.log(hotType!="custom");
    if(hotType!="custom"){
      saveHotspot(
      e.id.value,
      e.text.value,
      e.text.link,
      posLog.get(e.id.value)[0],
      posLog.get(e.id.value)[1]
    );
    }else{
      console.log('e',e)
      console.log("creating")
     saveTransition(
      e.id.value,
      e.text.link,
      e.trans.value,
      posLog.get(e.id.value)[0],
      posLog.get(e.id.value)[1]
    );
    }
      };
  function list(e) {
    return e;
  }
  //base end point url
  const FILE_RETRIVE_ENDPOINT = "http://localhost:8019/get/content/";
  const FILE_UPLOAD_BASE_ENDPOINT = "http://localhost:8019/insert/";
  const FILE_SEND = "http://localhost:8019/process_tour/"
  const [tour, setTour] = useState(null);
  const [show, setShow] = useState(true);
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
      if (files[i].size > 20000000000) {
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

        setShow(false);
        setTour(data);
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
      <input type="file"accept=".jpg,.jpeg,.gif,.png,.heic" multiple onChange={uploadFileHandler} />
      <button type="submit">Upload</button>
      {!fileSize && <p style={{ color: "red" }}>File size exceeded!!</p>}
      {fileUploadProgress && <p style={{ color: "red" }}>Uploading File(s)</p>}
      {fileUploadResponse != null && (
        <p style={{ color: "green" }}>{fileUploadResponse}</p>
      )}
    </form>
  );
  function createHotspot(text, link, yaw, pitch) {
    return (
      <Pannellum.Hotspot
        type={hotType}
        pitch={pitch}
        yaw={yaw}
        text={text}
        URL={link}
      />
    );
  }
  function loadHotspots(link) {
    return hotspotMap.get(link) || [];
  }
  function saveHotspot(link, text, url, x, y) {
    var a = loadHotspots(link);
    a.push({type:"info" ,link: url, text: text, x: x, y: y });
    hotspotMap.set(link, a);

    forceUpdate();
  }
  function getPos(evt) {
    return ref.current.getViewer().mouseEventToCoords(evt);
  }

  function getPanellum(link, contentID) {
    const panel = (
      <Pannellum
        ref={ref}
        width="100%"
        height="500px"
        image={link}
        pitch={30}
        yaw={180}
        hfov={110}
        autoLoad
        onMousedown={(evt) => {

          posLog.set(link, getPos(evt));
        }}
      >
        {list(mappings(link))}
      </Pannellum>
    );
    return (
      <>
        {panel}
        <div className="panellum-form">{hotspotForm(link, contentID)}</div>
      </>
    );
  }
  function setT(t){
    console.log(t);
    console.log(hotType!="custom")
    setType(t);
      
  }
  function mappings(link) {
    const b = loadHotspots(link).flatMap((element) =>
      createHotspot(element.text, element.link, element.y || 0, element.x || 0)
    );
    return b;
  }
  function getType() {
    return hotType;
  }
  function hotspotForm(link, contentID) {
    return (
      <div>
        <form onSubmit={createHotspotHandler}>
          <input hidden value={link} name="id"></input>
          <label>{!(getType() == "info") ? "Transition Image" : "Name"}</label>
          <input
            hidden={!(getType() == "info") ? true : false}
            type="text"
            name="text"
            required
          ></input>
          <select name="trans" hidden={getType() == "info" ? true : false}>
            {tour.panoramaFrames.flatMap((pano) =>
              pano.contentID != contentID ? (
                <option>{pano.contentID}</option>
              ) : (
                ""
              )
            )}
          </select>
          <label hidden={!(getType() == "info") ? true : false}>URL</label>
          <input
            hidden={!(getType() == "info") ? true : false}
            type="text"
            name="link"
          ></input>
          <div onChange={(event) => setT(event.target.value)}>
            <fieldset>
              <legend>Select Hotspot Type</legend>
              <label>Info</label>
              <input type="radio" name="type" value="info" />
              <label>Transition</label>
              <input type="radio" name="type" value="custom" />
            </fieldset>
          </div>

          <input type="submit" value="Create Hotspot"></input>
        </form>
      </div>
    );
  }
  
  function giveTour(name,json){
      const requestOptions = {
        method: "POST",
        body : json
      }
      fetch(FILE_SEND+name ,requestOptions).then(async (response) => 
        console.log()
      )
      .catch((error) => {
        console.error(error);
      });
      return name;

  };


    function createObject(name,description,frames,hotspotMap){
     for (let index = 0; index < frames.length; index++) {
      const element = frames[index];
      element.hotspots = hotspotMap.get(FILE_RETRIVE_ENDPOINT + element.contentID);
      frames[index] = element;
     } 
     frames.name = name;
     frames.description = description;
     return frames;
    } 
  
  function saveTour(){
  //   var seen = [];
  //    const json =JSON.stringify( listPanos(tour),function(key, val) {
  //  if (val != null && typeof val == "object") {
  //       if (seen.indexOf(val) >= 0) {
  //           return;
  //       }
  //       seen.push(val);
  //   }
    console.log(tour.panoramaFrames);
    const serialized = createObject(tour.name,tour.description,tour.panoramaFrames,hotspotMap);
    console.log("map",hotspotMap);
    const link = giveTour(name,serialized)
    console.log(serialized)
    navigate('/show' ,{state:{data:serialized}})
} 
  const save = (<form onSubmit={saveTour}>
          <input type="submit" value="Save"></input>
      </form>)
  function listPanos(tour) {
    if (!nullTour()) {
      return (tour.panoramaFrames.map((pano) => (
        <li>
          <div>
            <h1>{pano.contentID}</h1>
            {getPanellum(
              FILE_RETRIVE_ENDPOINT + pano.contentID,
              pano.contentID
            )}
          </div>
        </li>

      )
      
      )
      
      );
    } else return "";
  }

  function nullTour() {
    return tour === null;
  }

  return (
    <>
      {show && form}
      {!show && listPanos(tour) }
      {!show && save}
    </>
  );
}
export default AddPano;
