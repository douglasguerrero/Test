import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Icon, Menu, Table, Image, Loader, Dimmer, Segment, Input, Header, Button } from 'semantic-ui-react';
import firebase from 'firebase';
import _ from 'lodash';

export class UsersPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  state = {
    imageIsLoading: false,
    userDataIsLoading: false,
    userSearch: '',
    tableColumn: null,
    tableColumnDirection: null,
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
        itemVal.key = item.key;
        keys.push(itemVal);
      });
      this.setState({ userObject: keys });
      this.setState({ userDataIsLoading: false });
    });
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  filterUsers = () => {
    if (this.state.userSearch !== '') {
      const userObjectArray = this.state.userObject;
      const filteredUserObject = userObjectArray.filter((userObject) => {
        const name = userObject.firstName + userObject.lastName;
        return name.toLowerCase().indexOf(this.state.userSearch) !== -1;
      });
      this.setState({ userObject: filteredUserObject, tableColumn: null, tableColumnDirection: null });
    } else {
      this.loadUsers();
    }
  }

  handleSort = (clickedColumn) => () => {
    let { userObject } = this.state;
    if (this.state.tableColumn !== clickedColumn) {
      userObject = _.sortBy(userObject, [clickedColumn]);
      this.setState({ tableColumn: clickedColumn, tableColumnDirection: 'ascending' });
    } else {
      userObject = userObject.reverse();
      this.setState({ tableColumnDirection: this.state.tableColumnDirection === 'ascending' ? 'descending' : 'ascending' });
    }
    this.setState({ userObject });
  }

  generateUserList = () => {
    if (this.state.userObject.length > 0) {
      return this.state.userObject.map((user) =>
        <Table.Row key={user.key}>
          <Table.Cell><Image src={user.image} size="small" /></Table.Cell>
          <Table.Cell>{user.firstName} {user.lastName}</Table.Cell>
          <Table.Cell>{user.email}</Table.Cell>
          <Table.Cell>{user.phone}</Table.Cell>
        </Table.Row>
      );
    }
    return null;
  };

  defaultImage = 'https://react.semantic-ui.com/assets/images/wireframe/square-image.png';
  render() {
    const userTable = this.generateUserList();
    const { userDataIsLoading, userSearch } = this.state;
    const { tableColumn, tableColumnDirection } = this.state;
    return (
      <div>
        <Dimmer active={userDataIsLoading} inverted>
          <Loader />
        </Dimmer>
        <Table sortable celled color="blue">
          <Table.Header >
            <Table.Row>
              <Table.HeaderCell colSpan="8">
                <Segment inverted color="blue"><Header as="h1">Usuarios</Header></Segment></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Header >
            <Table.Row>
              <Table.HeaderCell colSpan="8">
                <Input
                  action fluid name="userSearch" value={userSearch} type="text" placeholder="Buscar Usuario..."
                  onChange={this.handleChange}
                >
                  <input />
                  <Button color="blue" onClick={this.filterUsers}>Buscar</Button>
                </Input>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Imagen</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'firstName' ? tableColumnDirection : null} onClick={this.handleSort('firstName')}>Nombre</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'email' ? tableColumnDirection : null} onClick={this.handleSort('email')}>Correo</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'phone' ? tableColumnDirection : null} onClick={this.handleSort('phone')}>Teléfono</Table.HeaderCell>
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
