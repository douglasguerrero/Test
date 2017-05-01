/*
 *
 * BusinessPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import makeSelectBusinessPage from './selectors';
import { Icon, Menu, Table, Button, Checkbox, Image } from 'semantic-ui-react';

export class BusinessPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  state = {}
  handleChange = (e, { value }) => this.setState({ value })
  render() {
    return (
      <div>
        <Table celled color="blue">
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
            <Table.Row>
              <Table.Cell>
                <Checkbox
                name="checkboxRadioGroup"
                value="this"
                checked={this.state.value === 'this'}
                onChange={this.handleChange}
              />
              </Table.Cell>
              <Table.Cell><Image src="data:image/jpeg;base64,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" size="small" /></Table.Cell>
              <Table.Cell>Diunsa</Table.Cell>
              <Table.Cell>Barrio San Fernando, 1ra calle entre 11-12 avenida N.E. Autopista hacia el Aeropuerto Internacional Ramon Villeda Morales.</Table.Cell>
              <Table.Cell>2555-5555</Table.Cell>
              <Table.Cell>SPS</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <Checkbox
                name="checkboxRadioGroup"
                value="that"
                checked={this.state.value === 'that'}
                onChange={this.handleChange}
              />
              </Table.Cell>
              <Table.Cell><Image src="http://static.panoramio.com/photos/large/43900722.jpg" size="small" /></Table.Cell>
              <Table.Cell>Kielsa</Table.Cell>
              <Table.Cell>Frente Policlinica, 7 Calle, San Pedro Sula</Table.Cell>
              <Table.Cell>2555-5555</Table.Cell>
              <Table.Cell>SPS</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
              <Checkbox
              name="checkboxRadioGroup"
              value="test"
              checked={this.state.value === 'test'}
              onChange={this.handleChange}
            />
            </Table.Cell>
              <Table.Cell><Image src="http://www.lanoticia.hn/wp-content/uploads/2014/11/IMG_4528.jpg" size="small" /></Table.Cell>
              <Table.Cell>Lady Lee</Table.Cell>
              <Table.Cell>Autopista al Aeropuerto, San Pedro Sula 21101</Table.Cell>
              <Table.Cell>2555-5555</Table.Cell>
              <Table.Cell>SPS</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
              <Checkbox
              name="checkboxRadioGroup"
              value="test2"
              checked={this.state.value === 'test2'}
              onChange={this.handleChange}
            />
            </Table.Cell>
              <Table.Cell><Image src="data:image/jpeg;base64,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" size="small" /></Table.Cell>
              <Table.Cell>Ferreteria Monterroso</Table.Cell>
              <Table.Cell>3 Avenida NE, San Pedro Sula 21101</Table.Cell>
              <Table.Cell>2555-5555</Table.Cell>
              <Table.Cell>SPS</Table.Cell>
            </Table.Row>
          </Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell colSpan="6">
                <Button floated="right" icon size="small" color="red">
                  <Icon name="delete" /> Borrar Tienda
                </Button>
                <Button floated="right" icon size="small" color="yellow">
                  <Icon name="edit" /> Editar Tienda
                </Button>
                <Button floated="right" icon size="small" color="green">
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
