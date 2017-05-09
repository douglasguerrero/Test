/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import { Divider, Grid, Segment } from 'semantic-ui-react';
import withProgressBar from 'components/ProgressBar';
import Menu from 'components/Menu';

export function App(props) {
  return (
    <div>
      <Grid columns={2} relaxed>
        <Grid.Column width={3}>
          <Segment basic>
            <Menu />
          </Segment>
        </Grid.Column>
        <Divider vertical>Or</Divider>
        <Grid.Column>
          <Segment basic>
            <div>
              {React.Children.toArray(props.children)}
            </div>
          </Segment>
        </Grid.Column>
      </Grid>
    </div>
  );
}

App.propTypes = {
  children: React.PropTypes.node,
};

export default withProgressBar(App);
