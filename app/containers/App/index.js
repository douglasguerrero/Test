/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import { Divider, Grid, Segment } from 'semantic-ui-react';
import Menu from 'components/Menu';

export default class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  static propTypes = {
    children: React.PropTypes.node,
  };

  render() {
    return (
      <div>
        <Grid columns={2} relaxed>
          <Grid.Column width={3}>
            <Segment basic>
              <Menu />
            </Segment>
          </Grid.Column>
          <Divider vertical>Or</Divider>
          <Grid.Column width={12}>
            <Segment basic>
              <div>
                {React.Children.toArray(this.props.children)}
              </div>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
