import { connect } from 'react-redux';
import StatusList from '../../../components/status_list';
import { Map as ImmutableMap, OrderedSet as ImmutableOrderedSet } from 'immutable';
import { createSelector } from 'reselect';
import { debounce } from 'lodash';
import { dequeueTimeline } from 'soapbox/actions/timelines';
import { scrollTopTimeline } from '../../../actions/timelines';
import { getSettings } from 'soapbox/actions/settings';
import { shouldFilter } from 'soapbox/utils/timelines';

const makeGetStatusIds = () => createSelector([
  (state, { type }) => getSettings(state).get(type, ImmutableMap()),
  (state, { type }) => state.getIn(['timelines', type, 'items'], ImmutableOrderedSet()),
  (state)           => state.get('statuses'),
  (state)           => state.get('me'),
], (columnSettings, statusIds, statuses, me) => {
  return statusIds.filter(id => {
    const status = statuses.get(id);
    if (!status) return true;
    return !shouldFilter(status, columnSettings);
  });
});

const makeMapStateToProps = () => {
  const getStatusIds = makeGetStatusIds();

  const mapStateToProps = (state, { timelineId }) => {
    const lastStatusId = state.getIn(['timelines', timelineId, 'items'], ImmutableOrderedSet()).last();

    return {
      statusIds: getStatusIds(state, { type: timelineId }),
      lastStatusId: lastStatusId,
      isLoading: state.getIn(['timelines', timelineId, 'isLoading'], true),
      isPartial: state.getIn(['timelines', timelineId, 'isPartial'], false),
      hasMore:   state.getIn(['timelines', timelineId, 'hasMore']),
      totalQueuedItemsCount: state.getIn(['timelines', timelineId, 'totalQueuedItemsCount']),
    };
  };

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onDequeueTimeline(timelineId) {
    dispatch(dequeueTimeline(timelineId, ownProps.onLoadMore));
  },
  onScrollToTop: debounce(() => {
    dispatch(scrollTopTimeline(ownProps.timelineId, true));
  }, 100),
  onScroll: debounce(() => {
    dispatch(scrollTopTimeline(ownProps.timelineId, false));
  }, 100),
});

export default connect(makeMapStateToProps, mapDispatchToProps)(StatusList);
