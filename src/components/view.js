import { Pannellum } from "pannellum-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
function View({ View }) {

 const { state } = useLocation();
  console.log("states", state);
  const data = state.data;
  const [main,setMain] = useState(data[0]);
  const [k
   ,setK] = useState(3);
  const FILE_RETRIVE_ENDPOINT = "http://localhost:8019/get/content/";
  console.log("main",main)
  const disMain = getPanellum(
    main.type,
    FILE_RETRIVE_ENDPOINT + main.contentID,
    main.contentID,
    main.hotspots
  );
  function get(name){
    console.log("name",name)
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if(element.contentID == name) {
        console.log("d",data[index])
        return index;
      }
    }
    return 0;
  }
  function processTransition(item)
  {
    const name = item.tran;
    console.log("names",name)
   return (
      <Pannellum.Hotspot
        type="custom"
        pitch={item.x}
        yaw={item.y}
        text={item.text}
        URL={item.link}
        name={item.tran}
        handleClick={(evt,e)=>setMain(data[get(e.name)])}
        handleClickArg={{name:item.tran}
        }
      />
    ); 
  }
  function createInfo(item) {
    console.log("info")
    return (
      <Pannellum.Hotspot
        type="info"
        pitch={item.y}
        yaw={item.x}
        text={item.text}
        URL={item.link}
      />
    );
  }
  function processMappings(mappings) {
    console.log("mappings",mappings);
    if(mappings==undefined) {
      console.log("Returnning ");
      return [];
    }
    return mappings.flatMap((item) => (item.type=="transition" ? processTransition(item): createInfo(item)));
  }
  function getPanellum(type, link, contentID, mappings) {
      const panel = (
        <Pannellum
          width="100%"
          height="500px"
          image={link}
          pitch={30}
          yaw={180}
          hfov={110}
        >
          {processMappings(mappings)}
        </Pannellum>
      );
      return <>{panel}</>;
    
  }
  function findIdx(data,name){
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if(name===element.contentID) return index;
      }
      return null;
  }
  function handleTransition(name){
    console.log("clicked",k)
    console.log("name",data.find((e)=>e.contentID=={name}));
    if(k==0){
      setK(10);
      // setMain(data[findIdx(data,name)]);
    }else{
      setK(k-1);
    }
  }
  return <>{disMain}</>;
}
export default View;
