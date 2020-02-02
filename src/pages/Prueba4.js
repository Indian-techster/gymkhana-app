import React from 'react'
import { connect } from 'react-redux'
import Prueba from '../components/Prueba'
import { addPoints } from '../js/actions/index'

function mapDispatchToProps(dispatch) {
    return {
        addPoints: points => dispatch(addPoints(points))
    }
}

class Prueba4 extends React.Component {
    
    constructor(props) {
        super(props)
        this.id = 4
        this.goToNextChallenge = this.goToNextChallenge.bind(this)
    }

    goToNextChallenge(points) {
        const nextChallengeId = this.id+1
        this.props.addPoints(points)
        this.props.history.push('/prueba'+nextChallengeId)
    }

    render() {
        return (
            <React.Fragment>
                <div className="g-app">
                    <Prueba id={this.id} onSubmit={this.goToNextChallenge} />
                </div>
            </React.Fragment>
        )
    }
}

const prueba4Connected = connect(null, mapDispatchToProps)(Prueba4)
export default prueba4Connected;