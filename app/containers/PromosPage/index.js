import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Dropdown, Icon, Menu, Table, Button, Checkbox, Image, Modal, Form, Segment, Header, Loader, Dimmer, Input, Grid, Label } from 'semantic-ui-react';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import 'moment/src/locale/es';
import 'react-dates/lib/css/_datepicker.css';
import firebase from 'firebase';

export class PromosPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  state = {
    promoObject: [],
    promoObjectForDisplay: [],
    businessObject: [],
    imageIsLoading: false,
    promoIsLoading: false,
    promoDataIsLoading: false,
    businessIsLoading: false,
    showAddModal: false,
    checkPromo: false,
    isEditingModal: false,
    openConfirmDeleteModal: false,
    promoName: '',
    promoDescription: '',
    promoSearch: '',
    imageUrl: 'https://react.semantic-ui.com/assets/images/wireframe/square-image.png',
    dateFormat: moment.localeData('es').longDateFormat('LL'),
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
      this.loadPromos();
      this.loadBusiness();
    }
  }

  defaultImage = 'https://react.semantic-ui.com/assets/images/wireframe/square-image.png';

  onPaginationArrowClick = (direction) => {
    if (direction === 'right') {
      const firstPaginationGridNumber = this.state.firstPaginationGridNumber + 5;
      if (this.state.promoObject[firstPaginationGridNumber * this.paginationSize]) {
        this.setState({ firstPaginationGridNumber });
        this.onPaginationItemClick(firstPaginationGridNumber - 1);
      }
    } else if (direction === 'left') {
      const firstPaginationGridNumber = this.state.firstPaginationGridNumber - 5;
      if (this.state.promoObject[firstPaginationGridNumber * this.paginationSize]) {
        this.setState({ firstPaginationGridNumber });
        this.onPaginationItemClick(firstPaginationGridNumber - 1);
      }
    }
  }

  onPaginationItemClick = (paginationNumber) => {
    this.loadItemsForDisplay(this.state.promoObject, paginationNumber);
  }

  loadPromos() {
    this.setState({ promoDataIsLoading: true });
    this.setState({ promoObject: [] });
    const keys = [];
    const promoRef = firebase.database().ref('promos');
    promoRef.on('value', (snapshot) => {
      snapshot.forEach((item) => {
        const itemVal = item.val();
        if (itemVal.isActive) {
          itemVal.key = item.key;
          keys.push(itemVal);
        }
      });
      this.setState({ promoObject: keys });
      this.loadItemsForDisplay(keys, 0);
      this.setState({ promoDataIsLoading: false });
    });
  }

  loadBusiness() {
    const keys = [];
    const businessRef = firebase.database().ref('business');
    businessRef.on('value', (snapshot) => {
      snapshot.forEach((item) => {
        const itemVal = item.val();
        if (itemVal.isActive) {
          const source = {
            key: item.key,
            text: itemVal.name,
            value: item.key,
          };
          keys.push(source);
        }
      });
      this.setState({ businessObject: keys });
    });
  }

  loadItemsForDisplay = (promoObject, paginationNumber) => {
    const promoObjectIndex = paginationNumber * this.state.paginationSize;
    const paginationLimit = promoObjectIndex + this.state.paginationSize;
    const promoObjectForDisplay = [];
    for (let i = promoObjectIndex; i < paginationLimit; i++) {
      if (promoObject[i]) {
        promoObjectForDisplay.push(promoObject[i]);
      }
    }
    this.setState({ promoObjectForDisplay });
    this.setState({ activePaginationButton: paginationNumber + 1 });
  }

  generatePagination = () => {
    if (this.state.promoObject.length > 0) {
      const paginationHtml = [<Menu.Item key={'left'} as="a" icon onClick={() => this.onPaginationArrowClick('left')}><Icon name="angle double left" /></Menu.Item>];
      for (let i = this.state.firstPaginationGridNumber - 1; i < this.state.firstPaginationGridNumber + 4; i++) {
        const verifyObjectExist = this.state.paginationSize * i;
        if (this.state.promoObject[verifyObjectExist]) {
          paginationHtml.push(<Menu.Item key={i} as="a" active={this.state.activePaginationButton === i + 1} onClick={() => this.onPaginationItemClick(i)}>{i + 1}</Menu.Item>);
        }
      }
      paginationHtml.push(<Menu.Item key={'right'} as="a" icon onClick={() => this.onPaginationArrowClick('right')}><Icon name="angle double right" /></Menu.Item>);
      return paginationHtml;
    }
    return null;
  };

  filterPromos = () => {
    if (this.state.promoSearch !== '') {
      const promoObjectArray = this.state.promoObject;
      const filteredPromoObject = promoObjectArray.filter((promoObject) => {
        const name = promoObject.name;
        return name.toLowerCase().indexOf(this.state.promoSearch) !== -1;
      });
      this.setState({ promoObject: filteredPromoObject, tableColumn: null, tableColumnDirection: null });
      this.loadItemsForDisplay(filteredPromoObject, 0);
    } else {
      this.loadPromos();
    }
  }

  handleSort = (clickedColumn) => () => {
    let { promoObject } = this.state;
    if (this.state.tableColumn !== clickedColumn) {
      promoObject = _.sortBy(promoObject, [clickedColumn]);
      this.setState({ tableColumn: clickedColumn, tableColumnDirection: 'ascending' });
    } else {
      promoObject = promoObject.reverse();
      this.setState({ tableColumnDirection: this.state.tableColumnDirection === 'ascending' ? 'descending' : 'ascending' });
    }
    this.setState({ promoObject });
    this.loadItemsForDisplay(promoObject, this.state.activePaginationButton - 1);
  }

  statusLabel = (initDate, expireDate) => {
    const initialDate = moment(initDate).format('MM/DD/YYYY');
    const expirationDate = moment(expireDate).format('MM/DD/YYYY');
    const today = moment().format('MM/DD/YYYY');
    if (today >= initialDate && today <= expirationDate) {
      return <Label color="green" key="green">Activo</Label>;
    } else if (today > expirationDate) {
      return <Label color="red" key="red">Expirado</Label>;
    }

    return <Label color="yellow" key="yellow">Pendiente</Label>;
  };

  generatePromoList = () => {
    if (this.state.promoObjectForDisplay.length > 0) {
      return this.state.promoObjectForDisplay.map((promo) =>
        <Table.Row key={promo.key}>
          <Table.Cell>
            <Checkbox
              name="checkPromo"
              value={promo.key}
              checked={this.state.checkPromo === promo.key}
              onChange={this.handleChange}
            />
          </Table.Cell>
          <Table.Cell><Image src={promo.imageUrl} size="small" /></Table.Cell>
          <Table.Cell>{promo.name}</Table.Cell>
          <Table.Cell>{promo.description}</Table.Cell>
          <Table.Cell>{promo.business.name}</Table.Cell>
          <Table.Cell>{moment(promo.initialDate).format('LL')}</Table.Cell>
          <Table.Cell>{moment(promo.expireDate).format('LL')}</Table.Cell>
          <Table.Cell>{this.statusLabel(promo.initialDate, promo.expireDate)}</Table.Cell>
        </Table.Row>
      );
    }
    return null;
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };

  openAddModal = () => {
    this.setState({ isEditingModal: false });
    this.setState({ modalTitle: 'Agregar Promoción' });
    this.setState({ showAddModal: true });
  }

  closeAddModal = () => {
    this.setState({ imageUrl: this.defaultImage });
    this.setState({ showAddModal: false });
  }

  cleanAddModal = () => {
    this.setState({ promoName: '' });
    this.setState({ promoDescription: '' });
    this.setState({ businessId: null });
    this.setState({ initialDate: null });
    this.setState({ expireDate: null });
    this.setState({ imageUrl: this.defaultImage });
  }

  openEditModal = () => {
    this.state.promoObject.forEach((promo) => {
      if (this.state.checkPromo === promo.key) {
        this.promoObject = promo;
      }
    });

    if (this.promoObject) {
      this.setState({ promoName: this.promoObject.name });
      this.setState({ promoDescription: this.promoObject.description });
      this.setState({ initialDate: moment(this.promoObject.initialDate) });
      this.setState({ expireDate: moment(this.promoObject.expireDate) });
      this.setState({ imageUrl: this.promoObject.imageUrl });
      this.setState({ businessId: this.promoObject.business.id });
      this.setState({ isEditingModal: true });
      this.setState({ modalTitle: 'Modificar Promoción' });
      this.setState({ showAddModal: true });
    }
  }

  deletePromo = (e) => {
    e.preventDefault();
    this.setState({ promoIsLoading: true });
    const key = this.state.checkPromo;

    this.state.promoObject.forEach((promo) => {
      if (key === promo.key) {
        this.promoObject = promo;
      }
    });
    const postData = {
      name: this.promoObject.name,
      description: this.promoObject.description,
      initialDate: this.promoObject.initialDate,
      expireDate: this.promoObject.expireDate,
      imageUrl: this.promoObject.imageUrl,
      business: { id: this.promoObject.business.id, name: this.promoObject.business.name },
      isActive: false,
    };
    const updates = {};
    updates[`/promos/${key}`] = postData;
    updates[`promosBusiness/${this.promoObject.business.id}/promos/${key}`] = postData;
    firebase.database().ref().update(updates).then(() => {
      this.setState({ promoIsLoading: false });
      this.loadPromos();
      this.closeConfirmDeleteModal();
    });
  }

  openConfirmDeleteModal = () => {
    this.setState({ openConfirmDeleteModal: true });
  }

  closeConfirmDeleteModal = () => {
    this.setState({ openConfirmDeleteModal: false });
  }

  findBusiness(business) {
    return business.key === this;
  }

  writePromoData = (e) => {
    e.preventDefault();
    const { promoName, promoDescription, initialDate, expireDate, imageUrl, businessId } = this.state;
    if (this.validatePromoModal(promoName, promoDescription, initialDate.format(), expireDate.format(), imageUrl, businessId)) {
      const businessObject = this.state.businessObject.find(this.findBusiness, businessId);
      const promosBusinessRef = firebase.database().ref(`/promosBusiness/${businessId}`);
      promosBusinessRef.once('value', (snapshot) => {
        if (this.state.isEditingModal) {
          const key = this.state.checkPromo;
          const postData = {
            name: promoName,
            description: promoDescription,
            initialDate: initialDate.format(),
            expireDate: expireDate.format(),
            imageUrl,
            business: { id: businessObject.key, name: businessObject.text },
            isActive: true,
          };
          const updates = {};
          updates[`/promos/${key}`] = postData;
          updates[`promosBusiness/${businessId}/promos/${key}`] = postData;
          firebase.database().ref().update(updates).then(() => {
            this.setState({ promoIsLoading: false });
            this.setState({ checkPromo: '' });
            this.loadPromos();
            this.closeAddModal();
          });
        } else {
          const newKey = firebase.database().ref().child('promos').push().key;
          const postDataPromo = {
            name: promoName,
            description: promoDescription,
            initialDate: initialDate.format(),
            expireDate: expireDate.format(),
            imageUrl,
            business: { id: businessObject.key, name: businessObject.text },
            isActive: true,
          };
          firebase.database().ref(`promos/${newKey}`).set(postDataPromo).then(() => {
            firebase.database().ref(`promosBusiness/${businessId}/promos/${newKey}`).set(postDataPromo).then(() => {
              this.setState({ promoIsLoading: false });
              this.loadPromos();
              this.closeAddModal();
            });
          });
        }
      });
    } else {
      this.setState({ promoIsLoading: false });
    }
  }

  validatePromoModal = (promoName, promoDescription, initialDate, expireDate, imageUrl, businessId) => {
    if (promoName && promoDescription && initialDate && expireDate && businessId) {
      if (promoName !== '' && promoDescription !== '' && initialDate !== '' && expireDate !== '' && businessId !== '' &&
      imageUrl !== this.defaultImage) {
        return true;
      }
    }
    return false;
  }

  handleFiles = (e) => {
    this.setState({ imageIsLoading: true });
    e.preventDefault();
    const storageRef = firebase.storage().ref();
    const file = e.target.files[0];

    const uploadTask = storageRef.child(`${file.name}`).put(file);

    uploadTask.on('state_changed', (snapshot) => {
    }, (error) => {
      this.setState({ imageIsLoading: false });
    }, () => {
      const downloadURL = uploadTask.snapshot.downloadURL;
      this.setState({ imageUrl: downloadURL });
      this.setState({ imageIsLoading: false });
    });
  };

  render() {
    const promoTable = this.generatePromoList();
    const promoPagination = this.generatePagination();
    const { promoDataIsLoading, checkPromo, showAddModal, modalTitle, imageUrl, promoName, promoDescription,
    initialDate, expireDate, promoIsLoading, imageIsLoading, openConfirmDeleteModal,
    businessId, promoSearch } = this.state;
    const { businessIsLoading, businessObject } = this.state;
    const { tableColumn, tableColumnDirection } = this.state;
    return (
      <div>
        <Dimmer active={promoDataIsLoading} inverted>
          <Loader />
        </Dimmer>
        <Table sortable celled color="blue">
          <Table.Header >
            <Table.Row>
              <Table.HeaderCell colSpan="8">
                <Segment inverted color="blue"><Header as="h1">Promociones</Header></Segment></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Header >
            <Table.Row>
              <Table.HeaderCell colSpan="8">
                <Input
                  action fluid name="promoSearch" value={promoSearch} type="text" placeholder="Buscar Promoción..."
                  onChange={this.handleChange}
                >
                  <input />
                  <Button color="blue" onClick={this.filterPromos}>Buscar</Button>
                </Input>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell colSpan="8">
                <Button floated="right" icon size="small" color="red" disabled={!checkPromo} onClick={this.openConfirmDeleteModal}>
                  <Icon name="delete" /> Borrar Promoción
              </Button>
                <Button floated="right" icon size="small" color="yellow" disabled={!checkPromo} onClick={this.openEditModal}>
                  <Icon name="edit" /> Editar Promoción
              </Button>
                <Button floated="right" icon size="small" color="green" onClick={this.openAddModal}>
                  <Icon name="add" /> Agregar Promoción
              </Button>
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Imagen</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'promoName' ? tableColumnDirection : null} onClick={this.handleSort('promoName')}>Nombre de Promoción</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'promoDescription' ? tableColumnDirection : null} onClick={this.handleSort('promoDescription')}>Descripción</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'business.name' ? tableColumnDirection : null} onClick={this.handleSort('business.name')}>Tienda</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'initialDate' ? tableColumnDirection : null} onClick={this.handleSort('initialDate')}>Fecha de Inicio</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'expireDate' ? tableColumnDirection : null} onClick={this.handleSort('expireDate')}>Fecha de Expiración</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'status' ? tableColumnDirection : null} onClick={this.handleSort('status')}>Estado</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { promoTable }
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="8">
                <Menu floated="right" pagination pointing secondary>
                  { promoPagination }
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>

        <Modal open={showAddModal}>
          <Segment inverted color="blue"><Modal.Header><Header as="h3" inverted>{modalTitle}</Header></Modal.Header></Segment>
          <Modal.Content image>
            <Modal.Description>
              <Form onSubmit={this.writePromoData}>
                <Form.Field required>
                  <label>Nombre de Promoción</label>
                  <Form.Input name="promoName" value={promoName} placeholder="Nombre de Promoción" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Descripción</label>
                  <Form.Input name="promoDescription" value={promoDescription} placeholder="Descripción" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Tienda</label>
                  <Grid>
                    <Grid.Column width={8}>
                      <Dropdown
                        selection
                        search
                        name="businessId"
                        loading={businessIsLoading}
                        onChange={this.handleChange}
                        options={businessObject}
                        value={businessId}
                      />
                    </Grid.Column>
                  </Grid>
                </Form.Field>
                <Form.Field required>
                  <label>Fecha de Inicio</label>
                  <SingleDatePicker
                    date={initialDate}
                    onDateChange={(date) => this.setState({ initialDate: date })}
                    focused={this.state.focusedInitial}
                    onFocusChange={({ focused }) => this.setState({ focusedInitial: focused })}
                    displayFormat={this.state.dateFormat}
                    placeholder="Fecha Inicial"
                    numberOfMonths={1}
                    showClearDate
                  />
                </Form.Field>
                <Form.Field required>
                  <label>Fecha de Expiración</label>
                  <SingleDatePicker
                    date={expireDate}
                    onDateChange={(date) => this.setState({ expireDate: date })}
                    focused={this.state.focusedExpired}
                    onFocusChange={({ focused }) => this.setState({ focusedExpired: focused })}
                    displayFormat={this.state.dateFormat}
                    placeholder="Fecha Expiración"
                    numberOfMonths={1}
                    showClearDate
                  />
                </Form.Field>
                <Form.Field required>
                  <label>Imagen</label>
                  <Segment>
                    <Dimmer active={imageIsLoading}>
                      <Loader indeterminate>Cargando Imagen</Loader>
                    </Dimmer>
                    <Image src={imageUrl} centered size="medium" shape="rounded" />
                  </Segment>
                  <input type="file" id="input" onChange={this.handleFiles} />
                </Form.Field>
                <Button primary floated="right" loading={promoIsLoading} >Guardar</Button>
                <Button floated="right" color="red" onClick={this.closeAddModal}>Cancelar</Button>
                <Button floated="right" color="grey" onClick={this.cleanAddModal}>Limpiar</Button>
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
            <p>Este seguro que desea borrar la promoción?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button color="red" loading={promoIsLoading} onClick={this.deletePromo}>Borrar</Button>
            <Button onClick={this.closeConfirmDeleteModal}>Cancelar</Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

export default connect()(PromosPage);
