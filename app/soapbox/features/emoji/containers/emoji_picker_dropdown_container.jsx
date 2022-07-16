import classNames from 'classnames';
import { Map as ImmutableMap } from 'immutable';
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { IconButton } from 'soapbox/components/ui';

import { useEmoji } from '../../../actions/emojis';
import { getSettings, changeSetting } from '../../../actions/settings';
import EmojiPickerDropdown from '../components/emoji_picker_dropdown';

const perLine = 8;
const lines   = 2;

const DEFAULTS = [
  '+1',
  'grinning',
  'kissing_heart',
  'heart_eyes',
  'laughing',
  'stuck_out_tongue_winking_eye',
  'sweat_smile',
  'joy',
  'yum',
  'disappointed',
  'thinking_face',
  'weary',
  'sob',
  'sunglasses',
  'heart',
  'ok_hand',
];

const getFrequentlyUsedEmojis = createSelector([
  state => state.getIn(['settings', 'frequentlyUsedEmojis'], ImmutableMap()),
], emojiCounters => {
  let emojis = emojiCounters
    .keySeq()
    .sort((a, b) => emojiCounters.get(a) - emojiCounters.get(b))
    .reverse()
    .slice(0, perLine * lines)
    .toArray();

  if (emojis.length < DEFAULTS.length) {
    const uniqueDefaults = DEFAULTS.filter(emoji => !emojis.includes(emoji));
    emojis = emojis.concat(uniqueDefaults.slice(0, DEFAULTS.length - emojis.length));
  }

  return emojis;
});

const getCustomEmojis = createSelector([
  state => state.get('custom_emojis'),
], emojis => emojis.filter(e => e.get('visible_in_picker')).sort((a, b) => {
  const aShort = a.get('shortcode').toLowerCase();
  const bShort = b.get('shortcode').toLowerCase();

  if (aShort < bShort) {
    return -1;
  } else if (aShort > bShort) {
    return 1;
  } else {
    return 0;
  }
}));

const mapStateToProps = state => ({
  custom_emojis: getCustomEmojis(state),
  skinTone: getSettings(state).get('skinTone'),
  frequentlyUsedEmojis: getFrequentlyUsedEmojis(state),
});

const mapDispatchToProps = (dispatch, props) => ({
  onSkinTone: skinTone => {
    dispatch(changeSetting(['skinTone'], skinTone));
  },

  onPickEmoji: emoji => {
    dispatch(useEmoji(emoji)); // eslint-disable-line react-hooks/rules-of-hooks

    if (props.onPickEmoji) {
      props.onPickEmoji(emoji);
    }
  },
});

const Container = connect(mapStateToProps, mapDispatchToProps)(EmojiPickerDropdown);

const EmojiPickerDropdownWrapper = (props) => {
  return (
    <Container
      render={
        ({ setPopperReference, title, visible, loading, handleToggle }) => (
          <IconButton
            className={classNames({
              'text-gray-400 hover:text-gray-600': true,
              'pulse-loading': visible && loading,
            })}
            ref={setPopperReference}
            src={require('@tabler/icons/mood-happy.svg')}
            title={title}
            aria-label={title}
            aria-expanded={visible}
            role='button'
            onClick={handleToggle}
            onKeyDown={handleToggle}
            tabIndex={0}
          />
        )
      }

      {...props}
    />
  );
};


export default EmojiPickerDropdownWrapper;
