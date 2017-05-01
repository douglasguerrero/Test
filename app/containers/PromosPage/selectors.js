import { createSelector } from 'reselect';

/**
 * Direct selector to the promosPage state domain
 */
const selectPromosPageDomain = () => (state) => state.get('promosPage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by PromosPage
 */

const makeSelectPromosPage = () => createSelector(
  selectPromosPageDomain(),
  (substate) => substate.toJS()
);

export default makeSelectPromosPage;
export {
  selectPromosPageDomain,
};
