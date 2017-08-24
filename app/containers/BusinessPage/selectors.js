import { createSelector } from 'reselect';

/**
 * Direct selector to the businessPage state domain
 */
const selectBusinessPageDomain = () => (state) => state.get('businessPage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by BusinessPage
 */

const makeSelectBusinessPage = () => createSelector(
  selectBusinessPageDomain(),
  (substate) => substate.toJS()
);

export default makeSelectBusinessPage;
export {
  selectBusinessPageDomain,
};
