/*
 *
 * LoginPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Header, Button, Form, Modal, Segment } from 'semantic-ui-react';

export class LoginPage extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <Modal open size="small">
        <Segment inverted color="blue"><Modal.Header><Header as="h3" inverted>
      Login
    </Header></Modal.Header></Segment>
        <Modal.Content image>
          <Modal.Description>
            <Form>
              <Form.Field>
                <label>Usuario</label>
                <input placeholder="Usuario" />
              </Form.Field>
              <Form.Field>
                <label>Contraseña</label>
                <input type="password" placeholder="Contraseña" />
              </Form.Field>
              <Button primary href="/home">Ingresar</Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
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
