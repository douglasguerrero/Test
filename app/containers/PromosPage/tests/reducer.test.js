
import { fromJS } from 'immutable';
import promosPageReducer from '../reducer';

describe('promosPageReducer', () => {
  it('returns the initial state', () => {
    expect(promosPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
