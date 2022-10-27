import './App.css';
import AddPano from './components/create-panorama' 
import View from './components/view';
import { Route, Routes,Navigate,BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
       <Routes>
        <Route path='/' element={<Navigate push to={"../home.html"}></Navigate>}>
          
        </Route>
          <Route path='/create' element={<AddPano/>}></Route>
          <Route path="/show/" element={<View></View>}/> 
        </Routes>


    </Router>
   );
}

export default App;
