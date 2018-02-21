import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions } from 'data'
import { getData } from './selectors'
import Success from './template.success'
import { Remote } from 'blockchain-wallet-v4/src'

class BitcoinWalletsContainer extends React.Component {
  shouldComponentUpdate (nextProps) {
    return !Remote.Loading.is(nextProps.data)
  }

  render () {
    const { data, ...rest } = this.props
    return (
      data.cata({
        Success: (value) => <Success wallets={value} {...rest} />,
        Failure: (message) => <div>{message}</div>,
        Loading: () => <div />,
        NotAsked: () => <div />
      })
    )
  }
}

const mapStateToProps = (state) => ({
  data: getData(state)
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions.modules.settings, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(BitcoinWalletsContainer)
