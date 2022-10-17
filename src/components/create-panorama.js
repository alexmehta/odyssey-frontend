import React, { Component, createContext, useState } from "react";
function AddPano({ addPano }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState("");
  const [fileSize, setFileSize] = useState(true);
  const [image,setImage]= useState(null)
  // for file upload progress message
  const [fileUploadProgress, setFileUploadProgress] = useState(false);
  //for displaying response message
  const [fileUploadResponse, setFileUploadResponse] = useState(null);
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
      if (files[i].size >200000) {
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
  
  const panoList = (<p>
    {listPanos(tour)}
  </p>)
            
    function listPanos(tour){
      if(!nullTour()){

        
      console.log(tour)
      return tour.panoramaFrames.map((pano=>(<li>
        <p>#{pano.id}</p>
        <img src={FILE_RETRIVE_ENDPOINT + pano.contentID}></img>
              </li>)));
      }
      else return "";
    }

  function nullTour(){
      return tour === null;
  }

  
 return (<>{show&& form }
        {!show && panoList}
 
 </>);
}
export default AddPano;
