import { Pannellum } from "pannellum-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
function View({ View }) {

 const { state } = useLocation();
  console.log("states", state);
  const data = state.data;
  const [main,setMain] = useState(data[0]);
  const disMain = getPanellum(
    main.type,
    FILE_RETRIVE_ENDPOINT + main.contentID,
    main.contentID,
    main.hotspots
  );
  function handleTransition(evt,name){
    console.log("evt",evt);
    console.log("name",name);
    setMain(name); //TODO make this show the right thing
  }
  function processTransition(item)
  {
   return (
      <Pannellum.Hotspot
        type="custom"
        pitch={item.x}
        yaw={item.y}
        text={item.text}
        URL={item.link}
        name={item.tran}
        handleClick={(evt,name)=>handleTransition(evt,name)}
        clickHandlerArg={{name:item.tran}
        }
      />
    ); 
  }
  function createInfo(item) {
    console.log("info")
    return (
      <Pannellum.Hotspot
        type="info"
        pitch={item.x}
        yaw={item.y}
        text={item.text}
        URL={item.link}
      />
    );
  }
  const FILE_RETRIVE_ENDPOINT = "http://localhost:8019/get/content/";
  function processMappings(mappings) {
    console.log(mappings);
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
          autoLoad
        >
          {processMappings(mappings)}
        </Pannellum>
      );
      return <>{panel}</>;
    
  }
  
  return <>{disMain}</>;
}
export default View;
