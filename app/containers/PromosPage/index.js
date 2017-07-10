import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Icon, Menu, Table, Button, Checkbox, Image, Modal, Form, Segment, Header, Loader, Dimmer, Input, Search, Grid, Label } from 'semantic-ui-react';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import 'moment/src/locale/es';
import 'react-dates/lib/css/_datepicker.css';
import firebase from 'firebase';

export class PromosPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  state = {
    imageIsLoading: false,
    showAddModal: false,
    promoDataIsLoading: false,
    checkPromo: false,
    promoIsLoading: false,
    isEditingModal: false,
    openMessageModal: false,
    openConfirmDeleteModal: false,
    tableColumn: null,
    tableColumnDirection: null,
    promoObject: [],
    modalMessage: '',
    promoSearch: '',
    dateFormat: moment.localeData('es').longDateFormat('LL'),
  };

  componentWillMount() {
    this.setState({ imageUrl: this.defaultImage });
    this.resetComponent();
    this.setState({ promoDataIsLoading: true });
    this.loadBusiness();
    this.loadPromos();
  }

  defaultImage = 'https://react.semantic-ui.com/assets/images/wireframe/square-image.png';

  resetComponent = () => this.setState({ businessIsLoading: false, businessResults: [], businessValue: '' });

  handleBusinessResultSelect = (e, result) => this.setState({ businessValue: result.title });

  handleBusinessOnBlur = (e, value) => {
    if (value.value !== '') {
      const businessFound = this.state.businessObject.filter((businessObject) => {
        const businessName = businessObject.title;
        return businessName.toLowerCase().indexOf(value.value) !== -1;
      });

      if (businessFound.length === 0) {
        this.setState({ businessValue: '' });
      }
    }
  }

  handleBusinessSearchChange = (e, value) => {
    this.setState({ businessIsLoading: true, businessValue: value });
    setTimeout(() => {
      if (this.state.businessValue.length < 1) return this.resetComponent();
      const re = new RegExp(_.escapeRegExp(this.state.businessValue), 'i');
      const isMatch = (result) => re.test(result.title);
      this.setState({
        businessIsLoading: false,
        businessResults: _.filter(this.state.businessObject, isMatch),
      });
    }, 500);
  }

  loadBusiness() {
    const keys = [];
    const businessRef = firebase.database().ref('business');
    businessRef.on('value', (snapshot) => {
      snapshot.forEach((item) => {
        const itemVal = item.val();
        const source = {
          title: itemVal.name,
          description: itemVal.address,
          image: itemVal.photoUrl,
        };
        keys.push(source);
      });
      this.setState({ businessObject: keys });
    });
  }

  loadPromos() {
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
      this.setState({ promoDataIsLoading: false });
    });
  }

  filterPromos = () => {
    if (this.state.promoSearch !== '') {
      const promoObjectArray = this.state.promoObject;
      const filteredPromoObject = promoObjectArray.filter((promoObject) => {
        const name = promoObject.name;
        return name.toLowerCase().indexOf(this.state.promoSearch) !== -1;
      });
      this.setState({ promoObject: filteredPromoObject, tableColumn: null, tableColumnDirection: null});
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
  }

  statusLabel = (date) => {
    const expirationDate = moment(date).format();
    if (moment().format() < expirationDate) {
      return <Label color="green" key="green">Activo</Label>;
    }
    return <Label color="red" key="red">Expirado</Label>;
  };

  generatePromoList = () => {
    if (this.state.promoObject.length > 0) {
      return this.state.promoObject.map((promo) =>
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
          <Table.Cell>{moment(promo.promoCreationDate).format('LL')}</Table.Cell>
          <Table.Cell>{moment(promo.expireDate).format('LL')}</Table.Cell>
          <Table.Cell>{this.statusLabel(promo.expireDate)}</Table.Cell>
        </Table.Row>
      );
    }
    return null;
  };

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  openAddModal = () => {
    this.setState({ isEditingModal: false });
    this.setState({ modalTitle: 'Agregar Promoción' });
    this.setState({ showAddModal: true });
  }

  closeAddModal = () => {
    this.setState({ name: '' });
    this.setState({ description: '' });
    this.setState({ expireDate: null });
    this.setState({ imageUrl: this.defaultImage });
    this.setState({ showAddModal: false });
  }

  openEditModal = () => {
    this.state.promoObject.forEach((promo) => {
      if (this.state.checkPromo === promo.key) {
        this.promoObject = promo;
      }
    });

    if (this.promoObject) {
      this.setState({ name: this.promoObject.name });
      this.setState({ description: this.promoObject.description });
      this.setState({ expireDate: moment(this.promoObject.expireDate) });
      this.setState({ imageUrl: this.promoObject.imageUrl });
      this.setState({ businessValue: this.promoObject.business.name });
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
      expireDate: this.promoObject.expireDate,
      imageUrl: this.promoObject.imageUrl,
      business: { name: this.promoObject.business.name },
      isActive: false,
    };
    const updates = {};
    updates[`/promos/${key}`] = postData;
    firebase.database().ref().update(updates).then(() => {
      this.setState({ promoIsLoading: false });
      this.loadPromos();
      this.closeConfirmDeleteModal();
      this.setState({ openMessageModal: true });
      this.setState({ modalMessage: 'Promoción borrada exitosamente' });
    });
  }

  openConfirmDeleteModal = () => {
    this.setState({ openConfirmDeleteModal: true });
  }

  closeConfirmDeleteModal = () => {
    this.setState({ openConfirmDeleteModal: false });
  }

  closeMessageModal = () => {
    this.setState({ openMessageModal: false });
  }

  writePromoData = (e) => {
    e.preventDefault();
    this.setState({ promoIsLoading: true });

    const { name, description, expireDate, imageUrl, businessValue } = this.state;
    if (this.validatePromoModal(name, description, expireDate.format(), imageUrl, businessValue)) {
      if (this.state.isEditingModal) {
        const key = this.state.checkPromo;
        const postData = {
          name,
          description,
          expireDate: expireDate.format(),
          imageUrl,
          business: { name: businessValue },
          isActive: true,
        };
        const updates = {};
        updates[`/promos/${key}`] = postData;
        firebase.database().ref().update(updates).then(() => {
          this.setState({ promoIsLoading: false });
          this.setState({ checkPromo: '' });
          this.loadPromos();
          this.closeAddModal();
          this.setState({ openMessageModal: true });
          this.setState({ modalMessage: 'Promoción actualizada exitosamente' });
        });
      } else {
        const newKey = firebase.database().ref().child('promos').push().key;
        firebase.database().ref(`promos/${newKey}`).set({
          name,
          description,
          expireDate: expireDate.format(),
          imageUrl,
          business: { name: businessValue },
          promoCreationDate: moment().format(),
          isActive: true,
        }).then(() => {
          this.setState({ promoIsLoading: false });
          this.closeAddModal();
          this.setState({ openMessageModal: true });
          this.setState({ modalMessage: 'Promoción agregada exitosamente' });
        });
      }
    } else {
      this.setState({ promoIsLoading: false });
      this.setState({ openMessageModal: true });
      this.setState({ modalMessage: 'Favor llenar todos los campos requeridos' });
    }
  }

  validatePromoModal = (name, description, expireDate, imageUrl, businessName) => {
    if (name && description && expireDate && businessName) {
      if (name !== '' && description !== '' && expireDate !== '' && businessName !== '' &&
      imageUrl !== this.defaultImage) {
        return true;
      }
    }
    this.setState({ openMessageModal: true });
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
    const { promoDataIsLoading, checkPromo, showAddModal, modalTitle, imageUrl, name, description,
    expireDate, promoIsLoading, imageIsLoading, openConfirmDeleteModal, openMessageModal, modalMessage, promoSearch } = this.state;
    const { businessIsLoading, businessValue, businessResults } = this.state;
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
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Imagen</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'name' ? tableColumnDirection : null} onClick={this.handleSort('name')}>Nombre de Promoción</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'description' ? tableColumnDirection : null} onClick={this.handleSort('description')}>Descripción</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'business.name' ? tableColumnDirection : null} onClick={this.handleSort('business.name')}>Tienda</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'creationDate' ? tableColumnDirection : null} onClick={this.handleSort('creationDate')}>Fecha de Creación</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'expireDate' ? tableColumnDirection : null} onClick={this.handleSort('expireDate')}>Fecha de Expiración</Table.HeaderCell>
              <Table.HeaderCell sorted={tableColumn === 'status' ? tableColumnDirection : null} onClick={this.handleSort('status')}>Estado</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { promoTable }
          </Table.Body>
          <Table.Footer>
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
              <Table.HeaderCell colSpan="8">
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

        <Modal open={showAddModal}>
          <Segment inverted color="blue"><Modal.Header><Header as="h3" inverted>{modalTitle}</Header></Modal.Header></Segment>
          <Modal.Content image>
            <Modal.Description>
              <Form>
                <Form.Field required>
                  <label>Nombre de Promoción</label>
                  <Form.Input name="name" value={name} placeholder="Nombre de Promoción" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Descripción</label>
                  <Form.Input name="description" value={description} placeholder="Descripción" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Tienda</label>
                  <Grid>
                    <Grid.Column width={8}>
                      <Search
                        loading={businessIsLoading}
                        onResultSelect={this.handleBusinessResultSelect}
                        onSearchChange={this.handleBusinessSearchChange}
                        results={businessResults}
                        value={businessValue}
                        onBlur={this.handleBusinessOnBlur}
                      />
                    </Grid.Column>
                  </Grid>
                </Form.Field>
                <Form.Field required>
                  <label>Fecha de Expiración</label>
                  <SingleDatePicker
                    date={expireDate}
                    onDateChange={(date) => this.setState({ expireDate: date })}
                    focused={this.state.focused}
                    onFocusChange={({ focused }) => this.setState({ focused })}
                    displayFormat={this.state.dateFormat}
                    placeholder="Fecha"
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
                    <Image src={imageUrl} size="medium" shape="rounded" />
                  </Segment>
                  <input type="file" id="input" onChange={this.handleFiles} />
                </Form.Field>
                <Button primary floated="right" loading={promoIsLoading} onClick={this.writePromoData}>Guardar</Button>
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
            <p>Este seguro que desea borrar la promoción?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button color="red" loading={promoIsLoading} onClick={this.deletePromo}>Borrar</Button>
            <Button onClick={this.closeConfirmDeleteModal}>Cancelar</Button>
          </Modal.Actions>
        </Modal>

        <Modal size={'small'} open={openMessageModal}>
          <Segment inverted color="blue">
            <Modal.Header>
              <Header as="h3" inverted>Información</Header>
            </Modal.Header>
          </Segment>
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

export default connect()(PromosPage);
