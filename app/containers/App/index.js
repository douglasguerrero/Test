/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import { Divider, Grid, Segment } from 'semantic-ui-react';
import Header from 'components/Header';
import Footer from 'components/Footer';
import withProgressBar from 'components/ProgressBar';
import Menu from 'components/Menu';

const AppWrapper = styled.div`
  max-width: calc(768px + 16px * 2);
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

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
