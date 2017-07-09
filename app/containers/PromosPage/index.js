/*
 *
 * PromosPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import _ from 'lodash';
import { Icon, Menu, Table, Button, Checkbox, Image, Modal, Form, Segment, Header, Loader, Dimmer, Input, Search, Grid, Label } from 'semantic-ui-react';
import { SingleDatePicker } from 'react-dates';
import moment from 'moment';
import 'moment/src/locale/es';
import 'react-dates/lib/css/_datepicker.css';
import firebase from 'firebase';
import { generateGUID } from '../../utils/guidGenerator';

export class PromosPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  state = {
    imageIsLoading: false,
    showAddModal: false,
    advertDataIsLoading: false,
    checkAdvert: false,
    advertIsLoading: false,
    isEditingModal: false,
    openMessageModal: false,
    openConfirmDeleteModal: false,
    advertObject: [],
    modalMessage: '',
    advertSearch: '',
    dateFormat: moment.localeData('es').longDateFormat('LL'),
  };

  componentWillMount() {
    this.setState({ advertImageUrl: this.defaultImage });
    this.resetComponent();
    this.setState({ advertDataIsLoading: true });
    this.loadBusiness();
    this.loadAdverts();
    this.loadCategories();
  }

  defaultImage = 'https://react.semantic-ui.com/assets/images/wireframe/square-image.png';

  resetComponent = () => this.setState({ businessIsLoading: false, businessResults: [], businessValue: '', categoryIsLoading: false, categoryResults: [], categoryValue: '' });

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

  handleCategoryResultSelect = (e, result) => this.setState({ categoryValue: result.title });

  handleCategoryOnBlur = (e, value) => {
    if (value.value !== '') {
      const categoryFound = this.state.categoriesObject.filter((categoriesObject) => {
        const categoryName = categoriesObject.title;
        return categoryName.toLowerCase().indexOf(value.value) !== -1;
      });

      if (categoryFound.length === 0) {
        this.setState({ categoryValue: '' });
      }
    }
  }

  handleCategorySearchChange = (e, value) => {
    this.setState({ categoryIsLoading: true, categoryValue: value });

    setTimeout(() => {
      if (this.state.categoryValue.length < 1) return this.resetComponent();

      const re = new RegExp(_.escapeRegExp(this.state.categoryValue), 'i');
      const isMatch = (result) => re.test(result.title);

      this.setState({
        categoryIsLoading: false,
        categoryResults: _.filter(this.state.categoriesObject, isMatch),
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
          title: itemVal.businessName,
          description: itemVal.businessAddress,
          image: itemVal.businessImageUrl,
        };
        keys.push(source);
      });
      this.setState({ businessObject: keys });
    });
  }

  loadCategories() {
    const keys = [];
    const advertRef = firebase.database().ref('categories');
    advertRef.on('value', (snapshot) => {
      snapshot.forEach((item) => {
        const itemVal = item.val();
        const source = {
          title: itemVal.name,
        };
        keys.push(source);
      });
      this.setState({ categoriesObject: keys });
    });
  }

  loadAdverts() {
    const keys = [];
    const advertRef = firebase.database().ref('adverts');
    advertRef.on('value', (snapshot) => {
      snapshot.forEach((item) => {
        const itemVal = item.val();
        if (itemVal.active) {
          keys.push(itemVal);
        }
      });
      this.setState({ advertObject: keys });
      this.setState({ advertDataIsLoading: false });
    });
  }

  filterAdverts = () => {
    if (this.state.advertSearch !== '') {
      const advertObjectArray = this.state.advertObject;
      const filteredAdvertObject = advertObjectArray.filter((advertObject) => {
        const advertName = advertObject.advertName;
        return advertName.toLowerCase().indexOf(this.state.advertSearch) !== -1;
      });
      this.setState({ advertObject: filteredAdvertObject });
    } else {
      this.loadAdverts();
    }
  }

  statusLabel = (date) => {
    const expirationDate = moment(date).format();
    if (moment().format() < expirationDate) {
      return <Label color="green" key="green">Activo</Label>;
    }
    return <Label color="red" key="red">Expirado</Label>;
  };

  generateAdvertList = () => {
    if (this.state.advertObject.length > 0) {
      return this.state.advertObject.map((advert) =>
        <Table.Row key={advert.advertId}>
          <Table.Cell>
            <Checkbox
              name="checkAdvert"
              value={advert.advertId}
              checked={this.state.checkAdvert === advert.advertId}
              onChange={this.handleChange}
            />
          </Table.Cell>
          <Table.Cell><Image src={advert.advertImageUrl} size="small" /></Table.Cell>
          <Table.Cell>{advert.advertName}</Table.Cell>
          <Table.Cell>{advert.advertDescription}</Table.Cell>
          <Table.Cell>{advert.advertBusinessName}</Table.Cell>
          <Table.Cell>{advert.advertCategoryName}</Table.Cell>
          <Table.Cell>{moment(advert.advertCreationDate).format('LL')}</Table.Cell>
          <Table.Cell>{moment(advert.advertExpireDate).format('LL')}</Table.Cell>
          <Table.Cell>{this.statusLabel(advert.advertExpireDate)}</Table.Cell>
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
    this.setState({ advertName: '' });
    this.setState({ advertDescription: '' });
    this.setState({ advertExpireDate: '' });
    this.setState({ advertImageUrl: this.defaultImage });
    this.setState({ showAddModal: false });
  }

  openEditModal = () => {
    this.state.advertObject.forEach((advert) => {
      if (this.state.checkAdvert === advert.advertId) {
        this.advertObject = advert;
      }
    });

    if (this.advertObject) {
      this.setState({ advertName: this.advertObject.advertName });
      this.setState({ advertDescription: this.advertObject.advertDescription });
      this.setState({ advertExpireDate: moment(this.advertObject.advertExpireDate) });
      this.setState({ advertImageUrl: this.advertObject.advertImageUrl });
      this.setState({ value: this.advertObject.advertBusinessName });
      this.setState({ isEditingModal: true });
      this.setState({ modalTitle: 'Modificar Promoción' });
      this.setState({ showAddModal: true });
    }
  }

  deleteAdvert = (e) => {
    e.preventDefault();
    this.setState({ advertIsLoading: true });
    const advertId = this.state.checkAdvert;

    this.state.advertObject.forEach((advert) => {
      if (advertId === advert.advertId) {
        this.advertObject = advert;
      }
    });
    const postData = {
      advertId,
      advertName: this.advertObject.advertName,
      advertDescription: this.advertObject.advertDescription,
      advertExpireDate: this.advertObject.advertExpireDate,
      advertImageUrl: this.advertObject.advertImageUrl,
      advertBusinessName: this.advertObject.advertBusinessName,
      advertCategoryName: this.advertObject.advertCategoryName,
      active: false,
    };
    const updates = {};
    updates[`/adverts/${advertId}`] = postData;
    firebase.database().ref().update(updates).then(() => {
      this.setState({ advertIsLoading: false });
      this.loadAdverts();
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

  writeAdvertData = (e) => {
    e.preventDefault();
    this.setState({ advertIsLoading: true });

    const { advertName, advertDescription, advertExpireDate, advertImageUrl, businessValue, categoryValue } = this.state;
    if (this.validateAdvertModal(advertName, advertDescription, advertExpireDate.format(), advertImageUrl, businessValue, categoryValue)) {
      if (this.state.isEditingModal) {
        const advertId = this.state.checkAdvert;
        const postData = {
          advertId,
          advertName,
          advertDescription,
          advertExpireDate: advertExpireDate.format(),
          advertImageUrl,
          advertBusinessName: businessValue,
          advertCategoryName: categoryValue,
          active: true,
        };
        const updates = {};
        updates[`/adverts/${advertId}`] = postData;
        firebase.database().ref().update(updates).then(() => {
          this.setState({ advertIsLoading: false });
          this.setState({ checkAdvert: '' });
          this.loadAdverts();
          this.closeAddModal();
          this.setState({ openMessageModal: true });
          this.setState({ modalMessage: 'Promoción actualizada exitosamente' });
        });
      } else {
        const newGuid = generateGUID();
        firebase.database().ref(`adverts/${newGuid}`).set({
          advertId: newGuid,
          advertName,
          advertDescription,
          advertExpireDate: advertExpireDate.format(),
          advertImageUrl,
          advertBusinessName: businessValue,
          advertCategoryName: categoryValue,
          advertCreationDate: moment().format(),
          active: true,
        }).then(() => {
          this.setState({ advertIsLoading: false });
          this.closeAddModal();
          this.setState({ openMessageModal: true });
          this.setState({ modalMessage: 'Promoción agregada exitosamente' });
        });
      }
    } else {
      this.setState({ advertIsLoading: false });
      this.setState({ openMessageModal: true });
      this.setState({ modalMessage: 'Favor llenar todos los campos requeridos' });
    }
  }

  validateAdvertModal = (advertName, advertDescription, advertExpireDate, advertImageUrl, advertBusinessName, advertCategoryName) => {
    if (advertName && advertDescription && advertExpireDate && advertBusinessName && advertCategoryName) {
      if (advertName !== '' && advertDescription !== '' && advertExpireDate !== '' && advertBusinessName !== '' && advertCategoryName !== '' &&
      advertImageUrl !== this.defaultImage) {
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
  // Observe state change events such as progress, pause, and resume
  // See below for more detail
    }, (error) => {
      this.setState({ imageIsLoading: false });
    }, () => {
      const downloadURL = uploadTask.snapshot.downloadURL;
      this.setState({ advertImageUrl: downloadURL });
      this.setState({ imageIsLoading: false });
    });
  };

  render() {
    const advertTable = this.generateAdvertList();
    const { advertDataIsLoading, checkAdvert, showAddModal, modalTitle, advertImageUrl, advertName, advertDescription,
    advertExpireDate, advertIsLoading, imageIsLoading, openConfirmDeleteModal, openMessageModal, modalMessage, advertSearch } = this.state;
    const { businessIsLoading, businessValue, businessResults, categoryIsLoading, categoryResults, categoryValue } = this.state;
    return (
      <div>
        <Segment>
          <Dimmer active={advertDataIsLoading} inverted>
            <Loader />
          </Dimmer>
          <Table celled color="blue">
            <Table.Header >
              <Table.Row>
                <Table.HeaderCell colSpan="9">
                  <Segment inverted color="blue"><Header as="h1">Promociones</Header></Segment></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Header >
              <Table.Row>
                <Table.HeaderCell colSpan="9">
                  <Input
                    action fluid name="advertSearch" value={advertSearch} type="text" placeholder="Buscar Promoción..."
                    onChange={this.handleChange}
                  >
                    <input />
                    <Button color="blue" onClick={this.filterAdverts}>Buscar</Button>
                  </Input>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell></Table.HeaderCell>
                <Table.HeaderCell>Imagen</Table.HeaderCell>
                <Table.HeaderCell>Nombre de Promoción</Table.HeaderCell>
                <Table.HeaderCell>Descripción</Table.HeaderCell>
                <Table.HeaderCell>Tienda</Table.HeaderCell>
                <Table.HeaderCell>Categoría</Table.HeaderCell>
                <Table.HeaderCell>Fecha de Creación</Table.HeaderCell>
                <Table.HeaderCell>Fecha de Expiración</Table.HeaderCell>
                <Table.HeaderCell>Estado</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              { advertTable }
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell colSpan="9">
                  <Button floated="right" icon size="small" color="red" disabled={!checkAdvert} onClick={this.openConfirmDeleteModal}>
                    <Icon name="delete" /> Borrar Promoción
                </Button>
                  <Button floated="right" icon size="small" color="yellow" disabled={!checkAdvert} onClick={this.openEditModal}>
                    <Icon name="edit" /> Editar Promoción
                </Button>
                  <Button floated="right" icon size="small" color="green" onClick={this.openAddModal}>
                    <Icon name="add" /> Agregar Promoción
                </Button>
                </Table.HeaderCell>
              </Table.Row>
              <Table.Row>
                <Table.HeaderCell colSpan="9">
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

        <Modal open={showAddModal}>
          <Segment inverted color="blue"><Modal.Header><Header as="h3" inverted>{modalTitle}</Header></Modal.Header></Segment>
          <Modal.Content image>
            <Modal.Description>
              <Form>
                <Form.Field required>
                  <label>Nombre de Promoción</label>
                  <Form.Input name="advertName" value={advertName} placeholder="Nombre de Promoción" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Descripción</label>
                  <Form.Input name="advertDescription" value={advertDescription} placeholder="Descripción" onChange={this.handleChange} />
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
                        {...this.props}
                      />
                    </Grid.Column>
                  </Grid>
                </Form.Field>
                <Form.Field required>
                  <label>Categoria</label>
                  <Grid>
                    <Grid.Column width={8}>
                      <Search
                        loading={categoryIsLoading}
                        onResultSelect={this.handleCategoryResultSelect}
                        onSearchChange={this.handleCategorySearchChange}
                        results={categoryResults}
                        value={categoryValue}
                        onBlur={this.handleCategoryOnBlur}
                        {...this.props}
                      />
                    </Grid.Column>
                  </Grid>
                </Form.Field>
                <Form.Field required>
                  <label>Fecha de Expiración</label>
                  <SingleDatePicker
                    date={advertExpireDate}
                    onDateChange={(date) => this.setState({ advertExpireDate: date })}
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
                    <Image src={advertImageUrl} size="medium" shape="rounded" />
                  </Segment>
                  <input type="file" id="input" onChange={this.handleFiles} />
                </Form.Field>
                <Button primary floated="right" loading={advertIsLoading} onClick={this.writeAdvertData}>Guardar</Button>
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
            <Button color="red" loading={advertIsLoading} onClick={this.deleteAdvert}>Borrar</Button>
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

PromosPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  // PromosPage: makeSelectPromosPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PromosPage);
