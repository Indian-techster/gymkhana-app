import React from 'react'
import { connect } from 'react-redux'
import { setUsername, setUserId, setTeam, restartPoints } from '../js/actions/index'
import JoinTeam from '../components/JoinTeam'
import JoinUser from '../components/JoinUser'
import axios from 'axios'
import Form from 'react-bootstrap/Form'
import { FaExclamationCircle} from 'react-icons/fa/'
import Button from 'react-bootstrap/Button'
import brujula from '../images/brujula.png'
import "./styles/Join.css"

const config = require('../config.json')
const endpoint = config.server

/** Redux function. Sirve para enviar (dispatch) acciones al store */
function mapDispatchToProps(dispatch) {
    return {
        setUsername: username => dispatch(setUsername(username)),
        setUserId: userid => dispatch(setUserId(userid)),
        setTeam: team => dispatch(setTeam(team)),
        restartPoints: points => dispatch(restartPoints())
    }
}

const mapStateToProps = state => {
    return { 
        game: state.game,
        username: state.username,
        team: state.team
    }
}

class Inicio extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            error: null,
            step: 1,
            duplicatedName: false,
            username: null,
            userId: null,
            teamCode: null
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleStepChange = this.handleStepChange.bind(this)

        // this.textoIntro = "Estás a punto de empezar la aventura más emocionante que ha ocurrido nunca en esta ciudad. "+
       // "Un tesoro se esconde en estas tierras. Para poder encontrarlo, antes debéis demostrar que sois verdaderos piratas."
        //"Solo el equipo que consiga demostrar mayor liderazgo, creatividad e ingenio, será digno de merecer este puesto al más valiente. "
    }

    componentWillMount() {
        if(this.props.username)  {
            this.setState({step: 2})
        }
        //Si el usuario ya se ha registrado, omitimos esta pantalla
        // if(this.props.username && this.props.team)  
        //     this.props.history.push('/intro')
        //this.props.setTeam(null)
    }
    //TODO pendiente manejar refresco pagina
    componentDidMount() {
        window.addEventListener('beforeunload', this.beforeunload.bind(this))
    }
    beforeunload(e) {
        const confirmationMessage = 'Some message'
        e.returnValue = confirmationMessage
        return confirmationMessage;  
    }
    
    handleChange(event) {
        const value = event.target.value
        const name = event.target.name
        this.setState({
          [name]: value,
          duplicatedName: false,
          emptyInput: false
        });
    }

    handleSubmit(e){
        e.preventDefault()
        this.props.restartPoints()
        const username = this.state.username
        if(!username) {
            this.setState({ emptyInput: true })
        }
        else {
            axios.post(endpoint+"/joinUser", {username: username, game_id: this.props.game })
            .then(res => {
                this.setState({ loading: false, error: false })
                if(res.data.duplicated) {
                    this.setState({ duplicatedName: true })
                }
                else {
                    this.props.setUsername(username)
                    this.props.setUserId(res.data.result.id)
                    this.setState({ userId: res.data.result.id })
                    this.setState({ step: 2 })
                }
            })
            .catch(error => this.setState({ loading: false, error: error.message })) 
        }
    }

    handleStepChange() {
        debugger
        this.setState({ step: 2 })
    }

    render() {
        const inputError = (this.state.duplicatedName || this.state.emptyInput) ? true : false
        return  <React.Fragment>
            <header className="App-header">
                <div className="inicio-content">
                    {/*<p> Bienvenido a la <code>Gymkhana de Urbanita</code>.
                    </p>
                     <p>{this.textoIntro}</p>  
                     */}
                    {/* {this.state.step===1 &&
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Control className={"g-input "+ `${inputError ? "g-input-error" : ""}`} type="text" placeholder="Nickname" name="username" value={this.state.username} onChange={this.handleChange} />
                                { this.state.duplicatedName && <Form.Text className="g-invalid-input-warning"><FaExclamationCircle/> Ups! Este nombre ya existe</Form.Text>}
                                { this.state.emptyInput && <Form.Text className="g-invalid-input-warning"><FaExclamationCircle/> Ey! No olvides poner tu nombre</Form.Text>}
                            </Form.Group>
                            <Button className="g-btn" variant="primary" type="submit">Next</Button>
                        </Form> 
                    } */}
                    {this.state.step===1 &&
                        <JoinUser gameId={this.props.game} onChangeStep={this.handleStepChange}/>
                    }
                    {this.state.step===2 &&
                        <JoinTeam gameId={this.props.game}/>
                    }
                </div>
                <div className="g-brujula"><img src={brujula} width={150} height={150} alt=""/></div>
            </header>
        </React.Fragment>
    }
}

const inicioConnected = connect(mapStateToProps, mapDispatchToProps)(Inicio)
export default inicioConnected;
