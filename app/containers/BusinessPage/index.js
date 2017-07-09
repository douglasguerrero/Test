/*
 *
 * BusinessPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Icon, Menu, Table, Button, Checkbox, Image, Modal, Form, Segment, Header, Loader, Dimmer, Input } from 'semantic-ui-react';
import firebase from 'firebase';
import { generateGUID } from '../../utils/guidGenerator';

export class BusinessPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  state = {
    imageIsLoading: false,
    showAddModal: false,
    businessIsLoading: false,
    businessDataIsLoading: false,
    checkBusiness: false,
    isEditingModal: false,
    openMessageModal: false,
    openConfirmDeleteModal: false,
    modalMessage: '',
    businessSearch: '',
  };

  componentWillMount() {
    this.setState({ businessImage: this.defaultImage });
    this.loadBusiness();
  }

  defaultImage = 'https://react.semantic-ui.com/assets/images/wireframe/square-image.png';

  loadBusiness() {
    this.setState({ businessDataIsLoading: true });
    this.setState({ businessObject: [] });
    const keys = [];
    const businessRef = firebase.database().ref('business');
    businessRef.on('value', (snapshot) => {
      snapshot.forEach((item) => {
        const itemVal = item.val();
        if (itemVal.active) {
          keys.push(itemVal);
        }
      });
      this.setState({ businessObject: keys });
      this.setState({ businessDataIsLoading: false });
    });
  }

  filterBusiness = () => {
    if (this.state.businessSearch !== '') {
      const businessObjectArray = this.state.businessObject;
      const filteredBusinessObject = businessObjectArray.filter((businessObject) => {
        const businessName = businessObject.businessName;
        return businessName.toLowerCase().indexOf(this.state.businessSearch) !== -1;
      });
      this.setState({ businessObject: filteredBusinessObject });
    } else {
      this.loadBusiness();
    }
  }

  generateBusinessList = () => {
    if (this.state.businessObject.length > 0) {
      return this.state.businessObject.map((business) =>
        <Table.Row key={business.businessId}>
          <Table.Cell>
            <Checkbox
              name="checkBusiness"
              value={business.businessId}
              checked={this.state.checkBusiness === business.businessId}
              onChange={this.handleChange}
            />
          </Table.Cell>
          <Table.Cell><Image src={business.businessImageUrl} size="small" /></Table.Cell>
          <Table.Cell>{business.businessName}</Table.Cell>
          <Table.Cell>{business.businessAddress}</Table.Cell>
          <Table.Cell>{business.businessPhone}</Table.Cell>
          <Table.Cell>{business.businessLocation}</Table.Cell>
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
      if (this.state.checkBusiness === business.businessId) {
        this.businessObject = business;
      }
    });

    if (this.businessObject) {
      this.setState({ businessName: this.businessObject.businessName });
      this.setState({ businessAddress: this.businessObject.businessAddress });
      this.setState({ businessPhone: this.businessObject.businessPhone });
      this.setState({ businessLocation: this.businessObject.businessLocation });
      this.setState({ businessImage: this.businessObject.businessImageUrl });
      this.setState({ isEditingModal: true });
      this.setState({ modalTitle: 'Modificar Tienda' });
      this.setState({ showAddModal: true });
    }
  }

  closeAddModal = () => {
    this.setState({ businessName: '' });
    this.setState({ businessAddress: '' });
    this.setState({ businessPhone: '' });
    this.setState({ businessLocation: '' });
    this.setState({ businessImage: this.defaultImage });
    this.setState({ showAddModal: false });
  }
  closeMessageModal = () => {
    this.setState({ openMessageModal: false });
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
      this.setState({ businessImage: downloadURL });
      this.setState({ imageIsLoading: false });
    });
  };

  writeBusinessData = (e) => {
    e.preventDefault();
    this.setState({ businessIsLoading: true });

    const { businessName, businessAddress, businessPhone, businessLocation, businessImage } = this.state;

    if (this.validateBusinessModal(businessName, businessAddress, businessPhone, businessLocation, businessImage)) {
      if (this.state.isEditingModal) {
        const businessId = this.state.checkBusiness;
        const postData = {
          businessId,
          businessName,
          businessAddress,
          businessPhone,
          businessLocation,
          businessImageUrl: businessImage,
          active: true,
        };
        const updates = {};
        updates[`/business/${businessId}`] = postData;
        firebase.database().ref().update(updates).then(() => {
          this.setState({ businessIsLoading: false });
          this.setState({ checkBusiness: '' });
          this.loadBusiness();
          this.closeAddModal();
          this.setState({ openMessageModal: true });
          this.setState({ modalMessage: 'Tienda actualizada exitosamente' });
        });
      } else {
        const newGuid = generateGUID();
        firebase.database().ref(`business/${newGuid}`).set({
          businessId: newGuid,
          businessName,
          businessAddress,
          businessPhone,
          businessLocation,
          businessImageUrl: businessImage,
          active: true,
        }).then(() => {
          this.setState({ businessIsLoading: false });
          this.closeAddModal();
          this.setState({ openMessageModal: true });
          this.setState({ modalMessage: 'Tienda agregada exitosamente' });
        });
      }
    } else {
      this.setState({ businessIsLoading: false });
      this.setState({ openMessageModal: true });
      this.setState({ modalMessage: 'Favor llenar todos los campos requeridos' });
    }
  }

  deleteBusiness = (e) => {
    e.preventDefault();
    this.setState({ businessIsLoading: true });
    const businessId = this.state.checkBusiness;
    this.state.businessObject.forEach((business) => {
      if (businessId === business.businessId) {
        this.businessObject = business;
      }
    });
    const postData = {
      businessId,
      businessName: this.businessObject.businessName,
      businessAddress: this.businessObject.businessAddress,
      businessPhone: this.businessObject.businessPhone,
      businessLocation: this.businessObject.businessLocation,
      businessImageUrl: this.businessObject.businessImageUrl,
      active: false,
    };
    const updates = {};
    updates[`/business/${businessId}`] = postData;
    firebase.database().ref().update(updates).then(() => {
      this.setState({ businessIsLoading: false });
      this.loadBusiness();
      this.closeConfirmDeleteModal();
      this.setState({ openMessageModal: true });
      this.setState({ modalMessage: 'Tienda borrada exitosamente' });
    });
  }

  closeConfirmDeleteModal = () => {
    this.setState({ openConfirmDeleteModal: false });
  }

  OpenConfirmDeleteModal = () => {
    this.setState({ openConfirmDeleteModal: true });
  }

  validateBusinessModal = (businessName, businessAddress, businessPhone, businessLocation, businessImage) => {
    if (businessName && businessAddress && businessPhone && businessLocation) {
      if (businessName !== '' && businessAddress !== '' && businessPhone !== '' && businessLocation !== '' && businessImage !== this.defaultImage) {
        return true;
      }
    }
    this.setState({ openMessageModal: true });
    return false;
  }

  render() {
    const businessTable = this.generateBusinessList();
    const { businessImage, imageIsLoading, showAddModal, businessIsLoading, businessName, openConfirmDeleteModal, modalMessage,
      businessAddress, businessPhone, businessLocation, checkBusiness, modalTitle, openMessageModal, businessDataIsLoading, businessSearch } = this.state;
    return (
      <div>
        <Segment>
          <Dimmer active={businessDataIsLoading} inverted>
            <Loader />
          </Dimmer>
          <Table celled>
            <Table.Header >
              <Table.Row>
                <Table.HeaderCell colSpan="6">
                  <Segment inverted color="blue"><Header as="h1">Tiendas</Header></Segment></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Header >
              <Table.Row>
                <Table.HeaderCell colSpan="6">
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
                <Table.HeaderCell></Table.HeaderCell>
                <Table.HeaderCell>Imagen</Table.HeaderCell>
                <Table.HeaderCell>Nombre</Table.HeaderCell>
                <Table.HeaderCell>Dirección</Table.HeaderCell>
                <Table.HeaderCell>Teléfono</Table.HeaderCell>
                <Table.HeaderCell>Ciudad</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              { businessTable }
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell colSpan="6">
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

        <Modal open={showAddModal}>
          <Segment inverted color="blue"><Modal.Header><Header as="h3" inverted>{modalTitle}</Header></Modal.Header></Segment>
          <Modal.Content image>
            <Modal.Description>
              <Form>
                <Form.Field required>
                  <label>Nombre de Tienda</label>
                  <Form.Input name="businessName" value={businessName} placeholder="Nombre de Tienda" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Dirección</label>
                  <Form.Input name="businessAddress" value={businessAddress} placeholder="Dirección" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Teléfono</label>
                  <Form.Input name="businessPhone" value={businessPhone} placeholder="Teléfono" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Ciudad</label>
                  <Form.Input name="businessLocation" value={businessLocation} placeholder="Ciudad" onChange={this.handleChange} />
                </Form.Field>
                <Form.Field required>
                  <label>Imagen</label>
                  <Segment>
                    <Dimmer active={imageIsLoading}>
                      <Loader indeterminate>Cargando Imagen</Loader>
                    </Dimmer>
                    <Image src={businessImage} size="medium" shape="rounded" />
                  </Segment>
                  <input type="file" id="input" onChange={this.handleFiles} />
                </Form.Field>
                <Button primary floated="right" loading={businessIsLoading} onClick={this.writeBusinessData}>Guardar</Button>
                <Button floated="right" color="red" onClick={this.closeAddModal}>Cancelar</Button>
              </Form>
            </Modal.Description>
          </Modal.Content>
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

BusinessPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  // BusinessPage: makeSelectBusinessPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessPage);
