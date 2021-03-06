
import React from 'react';
import { connect } from 'react-redux';
import { Icon, Menu, Table, Button, Checkbox, Image, Modal, Form, Segment, Header, Loader, Dimmer, Input, Dropdown } from 'semantic-ui-react';
import firebase from 'firebase';
import _ from 'lodash';

export class BusinessPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  state = {
    businessObject: [],
    businessObjectForDisplay: [],
    categoriesObject: [],
    categories: [],
    imageIsLoading: false,
    showAddModal: false,
    businessIsLoading: false,
    businessDataIsLoading: false,
    checkBusiness: false,
    isEditingModal: false,
    openConfirmDeleteModal: false,
    businessSearch: '',
    businessKey: '',
    photoUrl: 'https://react.semantic-ui.com/assets/images/wireframe/square-image.png',
    paginationSize: 15,
    activePaginationButton: 1,
    firstPaginationGridNumber: 1,
    tableColumn: null,
    tableColumnDirection: null,
  };

  componentWillMount() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      window.location = '/';
    } else {
      this.loadBusiness();
      this.loadCategories();
    }
  }

  onPaginationArrowClick = (direction) => {
    if (direction === 'right') {
      const firstPaginationGridNumber = this.state.firstPaginationGridNumber + 5;
      if (this.state.businessObject[firstPaginationGridNumber * this.state.paginationSize]) {
        this.setState({ firstPaginationGridNumber });
        this.onPaginationItemClick(firstPaginationGridNumber - 1);
      }
    } else if (direction === 'left') {
      const firstPaginationGridNumber = this.state.firstPaginationGridNumber - 5;
      if (this.state.businessObject[firstPaginationGridNumber * this.state.paginationSize]) {
        this.setState({ firstPaginationGridNumber });
        this.onPaginationItemClick(firstPaginationGridNumber - 1);
      }
    }
  }

  onPaginationItemClick = (paginationNumber) => {
    this.loadItemsForDisplay(this.state.businessObject, paginationNumber);
  }

  loadBusiness() {
    this.setState({ businessDataIsLoading: true });
    this.setState({ businessObject: [] });
    const keys = [];
    const businessRef = firebase.database().ref('business');
    businessRef.on('value', (snapshot) => {
      snapshot.forEach((item) => {
        const itemVal = item.val();
        if (itemVal.isActive) {
          itemVal.key = item.key;
          keys.push(itemVal);
        }
      });
      this.setState({ businessObject: keys });
      this.loadItemsForDisplay(keys, 0);
      this.setState({ businessDataIsLoading: false });
    });
  }

  loadCategories() {
    const keys = [];
    const promoRef = firebase.database().ref('categories');
    promoRef.on('value', (snapshot) => {
      snapshot.forEach((item) => {
        const itemVal = item.val();
        const source = {
          key: item.key,
          text: itemVal.name,
          value: item.key,
        };
        keys.push(source);
      });
      this.setState({ categoriesObject: keys });
    });
  }

  loadItemsForDisplay = (businessObject, paginationNumber) => {
    const businessObjectIndex = paginationNumber * this.state.paginationSize;
    const paginationLimit = businessObjectIndex + this.state.paginationSize;
    const businessObjectForDisplay = [];
    for (let i = businessObjectIndex; i < paginationLimit; i++) {
      if (businessObject[i]) {
        businessObjectForDisplay.push(businessObject[i]);
      }
    }
    this.setState({ businessObjectForDisplay });
    this.setState({ activePaginationButton: paginationNumber + 1 });
  }

  generatePagination = () => {
    if (this.state.businessObject.length > 0) {
      const paginationHtml = [<Menu.Item key={'left'} as="a" icon onClick={() => this.onPaginationArrowClick('left')}><Icon name="angle double left" /></Menu.Item>];
      for (let i = this.state.firstPaginationGridNumber - 1; i < this.state.firstPaginationGridNumber + 4; i++) {
        const verifyObjectExist = this.state.paginationSize * i;
        if (this.state.businessObject[verifyObjectExist]) {
          paginationHtml.push(<Menu.Item key={i} as="a" active={this.state.activePaginationButton === i + 1} onClick={() => this.onPaginationItemClick(i)}>{i + 1}</Menu.Item>);
        }
      }
      paginationHtml.push(<Menu.Item key={'right'} as="a" icon onClick={() => this.onPaginationArrowClick('right')}><Icon name="angle double right" /></Menu.Item>);
      return paginationHtml;
    }
    return null;
  };

  filterBusiness = () => {
    if (this.state.businessSearch !== '') {
      const businessObjectArray = this.state.businessObject;
      const filteredBusinessObject = businessObjectArray.filter((businessObject) => {
        const name = businessObject.name;
        return name.toLowerCase().indexOf(this.state.businessSearch) !== -1;
      });
      this.setState({ businessObject: filteredBusinessObject });
      this.loadItemsForDisplay(filteredBusinessObject, 0);
    } else {
      this.loadBusiness();
    }
  }

  categories = (categories) => {
    let categoriesText = '';
    if (categories) {
      Object.keys(categories).forEach((category) => {
        this.state.categoriesObject.forEach((categoryObject) => {
          if (categoryObject.key === category) {
            categoriesText += (`${categoryObject.text}, `);
          }
        });
      });
    }
    categoriesText = categoriesText.replace(/,\s*$/, '');
    return categoriesText;
  };

  handleSort = (clickedColumn) => () => {
    let { businessObject } = this.state;
    if (this.state.tableColumn !== clickedColumn) {
      businessObject = _.sortBy(businessObject, [clickedColumn]);
      this.setState({ tableColumn: clickedColumn, tableColumnDirection: 'ascending' });
    } else {
      businessObject = businessObject.reverse();
      this.setState({ tableColumnDirection: this.state.tableColumnDirection === 'ascending' ? 'descending' : 'ascending' });
    }
    this.setState({ businessObject });
    this.loadItemsForDisplay(businessObject, this.state.activePaginationButton - 1);
  }

  generateBusinessList = () => {
    if (this.state.businessObjectForDisplay.length > 0) {
      return this.state.businessObjectForDisplay.map((business) =>
        <Table.Row>
          <Table.Cell>
            <Checkbox
              name="checkBusiness"
              value={business.key}
              checked={this.state.checkBusiness === business.key}
              onChange={this.handleChange}
            />
          </Table.Cell>
          <Table.Cell><Image src={business.photoUrl} size="small" /></Table.Cell>
          <Table.Cell>{business.name}</Table.Cell>
          <Table.Cell>{business.address}</Table.Cell>
          <Table.Cell>{business.phoneNumber}</Table.Cell>
          <Table.Cell>{business.location}</Table.Cell>
          <Table.Cell>{this.categories(business.categories)}</Table.Cell>
        </Table.Row>
      );
    }
    return null;
  };

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  OpenAddModal = () => {
    this.setState({ isEditingModal: false });
    this.setState({ modalTitle: 'Agregar Tienda' });
    this.setState({ showAddModal: true });
  }

  OpenEditModal = () => {
    this.state.businessObject.forEach((business) => {
      if (this.state.checkBusiness === business.key) {
        this.businessObject = business;
      }
    });

    if (this.businessObject) {
      this.setState({ businessKey: this.businessObject.key });
      this.setState({ name: this.businessObject.name });
      this.setState({ address: this.businessObject.address });
      this.setState({ phoneNumber: this.businessObject.phoneNumber });
      this.setState({ location: this.businessObject.location });
      this.setState({ photoUrl: this.businessObject.photoUrl });
      this.setState({ isEditingModal: true });
      this.setState({ modalTitle: 'Modificar Tienda' });
      this.setState({ showAddModal: true });
      if (this.businessObject.categories) {
        this.setState({ categories: Object.keys(this.businessObject.categories) });
      }
    }
  }

  closeAddModal = () => {
    this.setState({ businessKey: '' });
    this.setState({ name: '' });
    this.setState({ address: '' });
    this.setState({ phoneNumber: '' });
    this.setState({ location: '' });
    this.setState({ categories: [] });
    this.setState({ photoUrl: this.defaultImage });
    this.setState({ showAddModal: false });
  }

  handleFiles = (e) => {
    this.setState({ imageIsLoading: true });
    e.preventDefault();
    const storageRef = firebase.storage().ref();
    const file = e.target.files[0];

    const uploadTask = storageRef.child(`${file.name}`).put(file);

    uploadTask.on('state_changed', () => {
    }, () => {
      this.setState({ imageIsLoading: false });
    }, () => {
      const downloadURL = uploadTask.snapshot.downloadURL;
      this.setState({ photoUrl: downloadURL });
      this.setState({ imageIsLoading: false });
    });
  };

  writeBusinessData = (e) => {
    e.preventDefault();
    this.setState({ businessIsLoading: true });
    const { name, address, phoneNumber, location, photoUrl, categories } = this.state;
    const selectedCategories = [];

    if (this.validateBusinessModal(name, address, phoneNumber, location, photoUrl, categories)) {
      if (this.state.isEditingModal) {
        const key = this.state.checkBusiness;
        const promosBusinessRef = firebase.database().ref(`/promosBusiness/${key}`);
        promosBusinessRef.once('value', (snapshot) => {
          const promos = snapshot.val().promos ? snapshot.val().promos : [];
          const mappedCategories = {};
          categories.forEach((category) => {
            mappedCategories[category] = true;
          });
          const copy = Object.assign({}, mappedCategories);
          const postDataBusiness = {
            name,
            address,
            phoneNumber,
            location,
            photoUrl,
            categories: copy,
            isActive: true,
          };
          const postDataPromosBusiness = {
            businessName: name,
            isBusinessActive: true,
            promos,
          };
          const updates = {};
          updates[`/business/${key}`] = postDataBusiness;
          updates[`/promosBusiness/${key}`] = postDataPromosBusiness;
          firebase.database().ref().update(updates).then(() => {
            this.setState({ businessIsLoading: false });
            this.setState({ checkBusiness: '' });
            this.loadBusiness();
            this.closeAddModal();
          });
        });
      } else {
        const updates = {};
        const newKey = firebase.database().ref().child('business').push().key;

        updates[`business/${newKey}/name`] = name;
        updates[`business/${newKey}/address`] = address;
        updates[`business/${newKey}/phoneNumber`] = phoneNumber;
        updates[`business/${newKey}/location`] = location;
        updates[`business/${newKey}/photoUrl`] = photoUrl;
        updates[`business/${newKey}/isActive`] = true;
        updates[`promosBusiness/${newKey}`] = { businessName: name, isBusinessActive: true, promos: [] };

        selectedCategories.forEach((categ) => {
          updates[`business/${newKey}/categories/${categ.key}`] = true;

          updates[`businessCategories/${categ.key}/categoryName`] = categ.name;
          updates[`businessCategories/${categ.key}/businesses/${newKey}`] = { name, address, phoneNumber, location, photoUrl };
        });
        firebase.database().ref().update(updates).then(() => {
          this.setState({ businessIsLoading: false });
          this.loadBusiness();
          this.closeAddModal();
        }).catch((err) => {
          this.setState({ businessIsLoading: false });
          console.log('error saving biz', err);
        });
      }
    } else {
      this.setState({ businessIsLoading: false });
    }
  }

  deleteBusiness = (e) => {
    e.preventDefault();
    this.setState({ businessIsLoading: true });
    const key = this.state.checkBusiness;
    const promosBusinessRef = firebase.database().ref(`/promosBusiness/${key}`);
    promosBusinessRef.once('value', (snapshot) => {
      const promos = snapshot.val().promos ? snapshot.val().promos : [];
      this.state.businessObject.forEach((business) => {
        if (key === business.key) {
          this.businessObject = business;
        }
      });
      const postDataBusiness = {
        name: this.businessObject.name,
        address: this.businessObject.address,
        phoneNumber: this.businessObject.phoneNumber,
        location: this.businessObject.location,
        photoUrl: this.businessObject.photoUrl,
        isActive: false,
      };
      const postDataPromosBusiness = {
        businessName: this.businessObject.name,
        isBusinessActive: false,
        promos,
      };
      const updates = {};
      updates[`/business/${key}`] = postDataBusiness;
      updates[`/promosBusiness/${key}`] = postDataPromosBusiness;
      firebase.database().ref().update(updates).then(() => {
        this.setState({ businessIsLoading: false });
        this.setState({ checkBusiness: '' });
        this.loadBusiness();
        this.closeConfirmDeleteModal();
      });
    });
  }

  closeConfirmDeleteModal = () => {
    this.setState({ openConfirmDeleteModal: false });
  }

  OpenConfirmDeleteModal = () => {
    this.setState({ openConfirmDeleteModal: true });
  }

  validateBusinessModal = (name, address, phoneNumber, location, photoUrl, categories) => {
    if (name && address && phoneNumber && location && categories) {
      if (name !== '' && address !== '' && phoneNumber !== '' && location !== '' && photoUrl !== this.defaultImage
      && categories !== []) {
        return true;
      }
    }
    return false;
  }

  render() {
    const businessTable = this.generateBusinessList();
    const businessPagination = this.generatePagination();
    const { businessKey, photoUrl, imageIsLoading, showAddModal, businessIsLoading, name, openConfirmDeleteModal, categories,
      address, phoneNumber, location, checkBusiness, modalTitle, businessDataIsLoading, businessSearch } = this.state;
    const { tableColumn, tableColumnDirection } = this.state;
    return (
      <div>
        <Dimmer active={businessDataIsLoading} inverted>
          <Loader />
        </Dimmer>
        <Table sortable celled color="blue">
          <Table.Header >
            <Table.Row>
              <Table.HeaderCell colSpan="7">
                <Segment inverted color="blue"><Header as="h1">Tiendas</Header></Segment></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Header >
            <Table.Row>
              <Table.HeaderCell colSpan="7">
                <Input
                  action fluid name="businessSearch" value={businessSearch} type="text" placeholder="Buscar Tienda..."
                  onChange={this.handleChange}
                >
                  <input />
                  <Button color="blue" onClick={this.filterBusiness}>Buscar</Button>
                </Input>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell colSpan="7">
                <Button floated="right" icon size="small" color="red" disabled={!checkBusiness} onClick={this.OpenConfirmDeleteModal}>
                  <Icon name="delete" /> Borrar Tienda
              </Button>
                <Button floated="right" icon size="small" color="yellow" disabled={!checkBusiness} onClick={this.OpenEditModal}>
                  <Icon name="edit" /> Editar Tienda
              </Button>
                <Button floated="right" icon size="small" color="green" onClick={this.OpenAddModal}>
                  <Icon name="add" /> Agregar Tienda
              </Button>
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Imagen</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'name' ? tableColumnDirection : null} onClick={this.handleSort('name')}>Nombre</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'address' ? tableColumnDirection : null} onClick={this.handleSort('address')}>Dirección</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'phoneNumber' ? tableColumnDirection : null} onClick={this.handleSort('phoneNumber')}>Teléfono</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'location' ? tableColumnDirection : null} onClick={this.handleSort('location')}>Ciudad</Table.HeaderCell>
              <Table.HeaderCell width={4}>Categorias</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { businessTable }
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="7">
                <Menu floated="right" pagination pointing secondary>
                  { businessPagination }
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>

        <Modal open={showAddModal} size="large">
          <Segment inverted color="blue"><Modal.Header><Header as="h3" inverted>{modalTitle}</Header></Modal.Header></Segment>
          <Modal.Content image>
            <Modal.Description>
              <Form>
                <Form.Field>
                  <label>Identificador</label>
                  <label>{businessKey}</label>
                </Form.Field>
                <Form.Field required>
                  <label>Nombre de Tienda</label>
                  <Form.Input name="name" value={name} placeholder="Nombre de Tienda" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Dirección</label>
                  <Form.Input name="address" value={address} placeholder="Dirección" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Teléfono</label>
                  <Form.Input name="phoneNumber" value={phoneNumber} placeholder="Teléfono" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Ciudad</label>
                  <Form.Input name="location" value={location} placeholder="Ciudad" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Categoria</label>
                  <Dropdown name="categories" value={categories} placeholder="Categorias" fluid multiple selection onChange={this.handleChange} options={this.state.categoriesObject} />
                </Form.Field>
                <Form.Field required>
                  <label>Imagen</label>
                  <Segment>
                    <Dimmer active={imageIsLoading}>
                      <Loader indeterminate>Cargando Imagen</Loader>
                    </Dimmer>
                    <Image src={photoUrl} centered size="medium" shape="rounded" />
                  </Segment>
                  <input type="file" id="input" onChange={this.handleFiles} />
                </Form.Field>
                <Button primary floated="right" loading={businessIsLoading} onClick={this.writeBusinessData}>Guardar</Button>
                <Button floated="right" color="red" onClick={this.closeAddModal}>Cancelar</Button>
              </Form>
            </Modal.Description>
          </Modal.Content>
        </Modal>

        <Modal size={'small'} open={openConfirmDeleteModal}>
          <Segment inverted color="blue">
            <Modal.Header>
              <Header as="h3" inverted>Confirmación</Header>
            </Modal.Header>
          </Segment>
          <Modal.Content>
            <p>Este seguro que desea borrar la tienda?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button color="red" loading={businessIsLoading} onClick={this.deleteBusiness}>Borrar</Button>
            <Button onClick={this.closeConfirmDeleteModal}>Cancelar</Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default connect()(BusinessPage);
