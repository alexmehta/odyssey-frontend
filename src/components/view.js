import { render } from "@testing-library/react"
import { Component } from "react"
import { useSearchParams } from "react-router-dom"
import queryString from 'query-string';
import {serialize,deserialize} from 'react-serialize'
import {useLocation} from 'react-router-dom'
function View({ View}) {
    const {state}= useLocation();
    console.log("states",state);
    return (
       <>{}</> 
    )
}
export default View;
