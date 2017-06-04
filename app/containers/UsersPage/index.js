/*
 *
 * UsersPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Icon, Menu, Table, Image, Segment, Loader, Dimmer } from 'semantic-ui-react';
import firebase from 'firebase';

export class UsersPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  state = {
    imageIsLoading: false,
    userDataIsLoading: false,
  };

  componentWillMount() {
    this.setState({ businessImage: this.defaultImage });
    this.loadUsers();
  }

  loadUsers() {
    this.setState({ userDataIsLoading: true });
    this.setState({ userObject: [] });
    const keys = [];
    const userRef = firebase.database().ref('users');
    userRef.on('value', (snapshot) => {
      snapshot.forEach((item) => {
        const itemVal = item.val();
        keys.push(itemVal);
      });
      this.setState({ userObject: keys });
      this.setState({ userDataIsLoading: false });
    });
  }

  generateUserList = () => {
    if (this.state.userObject.length > 0) {
      return this.state.userObject.map((user) =>
        <Table.Row key={user.userId}>
          <Table.Cell><Image src={user.userImage} size="small" /></Table.Cell>
          <Table.Cell>{user.firstName} {user.lastName}</Table.Cell>
          <Table.Cell>{user.email}</Table.Cell>
          <Table.Cell>{user.userPhone}</Table.Cell>
        </Table.Row>
      );
    }
    return null;
  };

  defaultImage = 'https://react.semantic-ui.com/assets/images/wireframe/square-image.png';
  render() {
    const userTable = this.generateUserList();
    const { userDataIsLoading } = this.state;
    return (
      <div>
        <Segment>
          <Dimmer active={userDataIsLoading} inverted>
            <Loader />
          </Dimmer>
          <Table celled color="blue">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Imagen</Table.HeaderCell>
                <Table.HeaderCell>Nombre</Table.HeaderCell>
                <Table.HeaderCell>Correo</Table.HeaderCell>
                <Table.HeaderCell>Teléfono</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              { userTable }
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan="6">
                  <Menu floated="right" pagination>
                    <Menu.Item as="a" icon>
                      <Icon name="left chevron" />
                    </Menu.Item>
                    <Menu.Item as="a">1</Menu.Item>
                    <Menu.Item as="a">2</Menu.Item>
                    <Menu.Item as="a">3</Menu.Item>
                    <Menu.Item as="a">4</Menu.Item>
                    <Menu.Item as="a" icon>
                      <Icon name="right chevron" />
                    </Menu.Item>
                  </Menu>
                </Table.HeaderCell>
              </Table.Row>

            </Table.Footer>
          </Table>
        </Segment>
      </div>
    );
  }
}

UsersPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);
