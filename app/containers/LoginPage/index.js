/*
 *
 * LoginPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Header, Button, Form, Modal, Segment } from 'semantic-ui-react';
import firebase from 'firebase';

export class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  state = { openMessageModal: false, isLoading: false };

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ isLoading: true });

    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).then(() => {
      const user = firebase.auth().currentUser;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        window.location = '/home';
      } else {
        this.setState({ isLoading: false });
      }
    }, (error) => {
      this.setState({ openMessageModal: true, modalMessage: error.message, isLoading: false });
    });
  }

  closeMessageModal = () => this.setState({ openMessageModal: false, modalMessage: '' });

  render() {
    const { email, password, openMessageModal, modalMessage, isLoading } = this.state;
    return (
      <div>
        <Modal open dimmer="blurring" size="small">
          <Segment inverted color="blue"><Modal.Header><Header as="h3" inverted>
      Login
    </Header></Modal.Header></Segment>
          <Modal.Content image>
            <Modal.Description>
              <Form onSubmit={this.handleSubmit}>
                <Form.Field>
                  <label>Usuario</label>
                  <Form.Input name="email" value={email} placeholder="Usuario" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field>
                  <label>Contraseña</label>
                  <Form.Input name="password" value={password} type="password" placeholder="Contraseña" onChange={this.handleChange} />
                </Form.Field>
                <Button primary loading={isLoading}>Ingresar</Button>
              </Form>
            </Modal.Description>
          </Modal.Content>
        </Modal>

        <Modal size={'small'} open={openMessageModal} onClose={this.closeMessageModal}>
          <Segment inverted color="blue"><Modal.Header><Header as="h3" inverted>
      Error al hacer login
    </Header></Modal.Header></Segment>
          <Modal.Content>
            <p>{modalMessage}</p>
          </Modal.Content>
          <Modal.Actions>
            <Button primary content="Ok" onClick={this.closeMessageModal} />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

LoginPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  // LoginPage: makeSelectLoginPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
