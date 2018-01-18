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
    userObject: [],
    userObjectForDisplay: [],
    userSearch: '',
    defaultImage: 'https://react.semantic-ui.com/assets/images/wireframe/square-image.png',
    paginationSize: 20,
    activePaginationButton: 15,
    firstPaginationGridNumber: 1,
    tableColumn: null,
    tableColumnDirection: null,
  };

  componentWillMount() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      window.location = '/';
    } else {
      this.loadUsers();
    }
  }

  onPaginationArrowClick = (direction) => {
    if (direction === 'right') {
      const firstPaginationGridNumber = this.state.firstPaginationGridNumber + 5;
      if (this.state.userObject[firstPaginationGridNumber * this.paginationSize]) {
        this.setState({ firstPaginationGridNumber });
        this.onPaginationItemClick(firstPaginationGridNumber - 1);
      }
    } else if (direction === 'left') {
      const firstPaginationGridNumber = this.state.firstPaginationGridNumber - 5;
      if (this.state.userObject[firstPaginationGridNumber * this.paginationSize]) {
        this.setState({ firstPaginationGridNumber });
        this.onPaginationItemClick(firstPaginationGridNumber - 1);
      }
    }
  }

  onPaginationItemClick = (paginationNumber) => {
    this.loadItemsForDisplay(this.state.userObject, paginationNumber);
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
      this.loadItemsForDisplay(keys, 0);
    });
  }

  loadItemsForDisplay = (userObject, paginationNumber) => {
    const userObjectIndex = paginationNumber * this.state.paginationSize;
    const paginationLimit = userObjectIndex + this.state.paginationSize;
    const userObjectForDisplay = [];
    for (let i = userObjectIndex; i < paginationLimit; i++) {
      if (userObject[i]) {
        userObjectForDisplay.push(userObject[i]);
      }
    }
    this.setState({ userObjectForDisplay });
    this.setState({ activePaginationButton: paginationNumber + 1 });
  }

  generatePagination = () => {
    if (this.state.userObject.length > 0) {
      const paginationHtml = [<Menu.Item key={'left'} as="a" icon onClick={() => this.onPaginationArrowClick('left')}><Icon name="angle double left" /></Menu.Item>];
      for (let i = this.state.firstPaginationGridNumber - 1; i < this.state.firstPaginationGridNumber + 4; i++) {
        const verifyObjectExist = this.state.paginationSize * i;
        if (this.state.userObject[verifyObjectExist]) {
          paginationHtml.push(<Menu.Item key={i} as="a" active={this.state.activePaginationButton === i + 1} onClick={() => this.onPaginationItemClick(i)}>{i + 1}</Menu.Item>);
        }
      }
      paginationHtml.push(<Menu.Item key={'right'} as="a" icon onClick={() => this.onPaginationArrowClick('right')}><Icon name="angle double right" /></Menu.Item>);
      return paginationHtml;
    }
    return null;
  };

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  filterUsers = () => {
    if (this.state.userSearch !== '') {
      const userObjectArray = this.state.userObject;
      const filteredUserObject = userObjectArray.filter((userObject) => {
        const name = userObject.firstName + userObject.lastName;
        return name.toLowerCase().indexOf(this.state.userSearch) !== -1;
      });
      this.setState({ userObject: filteredUserObject, tableColumn: null, tableColumnDirection: null });
      this.loadItemsForDisplay(filteredUserObject, 0);
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
    this.loadItemsForDisplay(userObject, this.state.activePaginationButton - 1);
  }

  generateUserList = () => {
    if (this.state.userObjectForDisplay.length > 0) {
      return this.state.userObjectForDisplay.map((user) =>
        <Table.Row key={user.key}>
          <Table.Cell><Image src={this.state.defaultImage} size="small" /></Table.Cell>
          <Table.Cell>{user.firstName} {user.lastName}</Table.Cell>
          <Table.Cell>{user.email}</Table.Cell>
          <Table.Cell>{user.phone}</Table.Cell>
        </Table.Row>
      );
    }
    return null;
  };

  render() {
    const userTable = this.generateUserList();
    const userPagination = this.generatePagination();
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
              <Table.HeaderCell colSpan="4">
                <Segment inverted color="blue"><Header as="h1">Usuarios</Header></Segment></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Header >
            <Table.Row>
              <Table.HeaderCell colSpan="4">
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
              <Table.HeaderCell colSpan="4">
                <Menu floated="right" pagination pointing secondary>
                  { userPagination }
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
