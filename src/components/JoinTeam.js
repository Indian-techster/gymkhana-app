import React from 'react'
import { connect } from 'react-redux'
import { setTeam, setTeamId } from '../js/actions/index'
import { Redirect } from 'react-router-dom'
import axios from 'axios'
import Form from 'react-bootstrap/Form'
import { FaExclamationCircle} from 'react-icons/fa/'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Loading from '../components/Loading'
import { SERVER_ENDPOINT  } from '../api-config'

/** Redux function. Sirve para enviar (dispatch) acciones al store */
function mapDispatchToProps(dispatch) {
    return {
        setTeam: team => dispatch(setTeam(team)),
        setTeamId: teamId => dispatch(setTeamId(teamId)),
    }
}

const mapStateToProps = state => {
    return { 
        game: state.game,
        username: state.username,
        userid: state.userid,
        team: state.team
    }
}

class Inicio extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            error: null,
            invalidKeyTeam: false,
            teamKey: "",
            redirect: false
        }
        this.userid = this.props.userid
        this.username = this.props.username
        this.gameId = this.props.game
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleChange(event) {
        const value = event.target.value
        const name = event.target.name
        this.setState({
          [name]: value,
          invalidKeyTeam: false,
          emptyInput: false,
          error: null,
        });
    }

    handleSubmit(e){
        e.preventDefault()
        const teamKey = this.state.teamKey
        if(!teamKey) {
            this.setState({ emptyInput: true })
        }
        else {
            this.setState({ loading: true })
            axios.post(`${SERVER_ENDPOINT}/joinTeam`, {userid: this.userid, key: teamKey, gameId: this.gameId })
            .then(res => {
                this.setState({ loading: false, error: false })
                if(res.data.error) {
                    this.setState({ error: res.data.error.message ? res.data.error.message : "error"})
                }
                else if(res.data.invalidKey) {
                    this.setState({ invalidKeyTeam: true })
                }
                else if(res.data.result) {
                    const teamName = res.data.result.name
                    const teamId = res.data.result.id
                    this.props.setTeam(teamName)
                    this.props.setTeamId(teamId)
                    this.setState({ redirect: true })
                }
            })
            .catch(error => this.setState({ loading: false, error: error.message })) 
        }
    }
    render() {
        const inputError = (this.state.invalidKeyTeam || this.state.emptyInput) ? true : false
        const inputErrorClassName = inputError ? "g-input-error" : ""

        if(this.state.redirect) {
            return <Redirect to='/intro' />
        }
        return  <React.Fragment>
                {this.state.loading && <Loading/>}
                {this.state.error && <Alert variant="danger">Error: {this.state.error}</Alert>}
                <div className="join-team-message">
                    <h1>¡Hola {this.username}!</h1>
                    <p>{this.props.message}</p>
                </div>
                {/* <p className="join-team-message"></p>
                <p className="g-message">{this.props.message}</p> */}
                <Form onSubmit={this.handleSubmit}>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Control className={"g-input "+ inputErrorClassName} type="text" placeholder="Clave de tu equipo" name="teamKey" value={this.state.teamKey} onChange={this.handleChange} />
                        { this.state.invalidKeyTeam && <Form.Text className="g-invalid-input-warning"><FaExclamationCircle/> Ups! Esta clave no existe</Form.Text>}
                        { this.state.emptyInput && <Form.Text className="g-invalid-input-warning"><FaExclamationCircle/> Ey! Necesitas indicar la clave</Form.Text>}
                        </Form.Group>
                    <Button className="g-btn" variant="primary" type="submit">OK, go!</Button>
                </Form>
        </React.Fragment>
    }
}

const inicioConnected = connect(mapStateToProps, mapDispatchToProps)(Inicio)
export default inicioConnected;
