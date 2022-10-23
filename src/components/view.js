import { render } from "@testing-library/react"
import { Component } from "react"
import { useSearchParams } from "react-router-dom"
import queryString from 'query-string';
function View({ View}) {
 const query = new URLSearchParams(window.location.search);
 console.log(query)
        return (

            <div>
                {query.get("tour")}
            </div>
        )
}
export default View;
