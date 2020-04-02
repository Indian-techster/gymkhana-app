import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import axios from 'axios'
import './styles/App.css'
import Layout from './components/Layout'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Join from './pages/Join'
import Intro from './pages/Intro'
import Challenge from './components/Challenge'
import Prueba5 from './pages/Prueba5'
import Prueba6 from './pages/Prueba6'
import Prueba7 from './pages/Prueba7'
import Final from './pages/Final'
import NotFound from './pages/NotFound'
import { connect } from 'react-redux'
import { setGame, setGameInfo, setUserId, setUsername, setTeam, setTeamId, restartPoints } from './js/actions/index'
import socketIOClient from "socket.io-client";
import { SERVER_ENDPOINT  } from './api-config'

/** Redux function. Sirve para enviar (dispatch) acciones al store */
const mapDispatchToProps = (dispatch) => {
  return {
      setGame: game => dispatch(setGame(game)),
      setGameInfo: data => dispatch(setGameInfo(data)),
      setUserId: name => dispatch(setUserId(name)),
      setUsername: name => dispatch(setUsername(name)),
      setTeam: team => dispatch(setTeam(team)),
      setTeamId: teamId => dispatch(setTeamId(teamId)),
      restartPoints: points => dispatch(restartPoints())
  }
}
/** [Redux function] selecciona los datos del store que el componente "connect" necesita*/
const mapStateToProps = state => {
  return {
    game: state.game,
    gameInfo: state.gameInfo,
    userid: state.userid,
    team: state.team,
  }
}

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});

function App({ game, userid, team, setGame, setGameInfo, setUserId, setUsername, setTeam }) {
  const path = document.location.pathname

  const redirectToHomePageIfNecessary = () => {
      
    if(path !== "/" && !game) {
      document.location.href="/"
    }
    else if((path !== "/join" && path !== "/intro") && userid ) {
      //TODO mirar que hace esto y si lo necesito
      axios.post(`${SERVER_ENDPOINT}/checkPlayerInDB`, {player: userid})
      .then(res => {
        console.log(res)
        if(res === 0) {
          //TODO resetear todo, o sí estamos en la home que allí se resetee todo 
          setUsername(null)
          setTeam(null)
          document.location.href="/"
        }   
      })
      .catch(error => console.log("error en checkPlayerInDB"));
    }
  }

  const sendPosition = (socket) => {
    function geo_success(position) {
      var coordenadas = {
          playerId: userid,
          equipo: team,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
      }
      socket.emit("coordenadas", coordenadas);
    }
    function geo_error(error) {
      //TODO hacer un state con route que lo pinte en pantalla
      console.error("error "+error.message)
      return false
    }
    navigator.geolocation.getCurrentPosition(geo_success, geo_error, {timeout:10000})
  }

  const sendPositionPolling = () => {
    if (userid){
      navigator.geolocation.getCurrentPosition((success)=> {
        setInterval(sendPosition, 3000)
      }, (error)=>{
        console.log("error al intentar getCurrentPosition ")
        //alert(error.message)
      }, {timeout:10000})
    }
  }

  const socketListeners = (socket) => {
    socket.on('connect', () => {
      console.log("socket connected "+socket.id)
    })

    socket.on('connect_error', (error) => {
      console.log("connect_error "+error)
    })

    socket.on('disconnect', (reason) => {
      console.log("disconnect "+reason)
    })
  }

  const init = () => {
    console.log("entra en App en path: "+path)
    redirectToHomePageIfNecessary()
    if(!path === "/") {
      const socket = socketIOClient(SERVER_ENDPOINT);
      sendPositionPolling(socket)
      socketListeners(socket)
    }
  }

  init()

  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/join" component={Join} />
          <React.Fragment> 
            <Navbar/>
            <Switch>
              <Route exact path="/intro" component={Intro} />
              <Route exact path="/challenge/:id" component={Challenge} />
              <Route exact path="/prueba5" component={Prueba5} />
              <Route exact path="/prueba6" component={Prueba6} />
              <Route exact path="/prueba7" component={Prueba7} />
              <Route exact path="/final" component={Final} />
              <Route component={NotFound} />
            </Switch>
          </React.Fragment>
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

const appConnected = connect(mapStateToProps, mapDispatchToProps)(App)

export default appConnected;
