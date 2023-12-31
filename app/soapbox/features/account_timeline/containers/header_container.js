import React from 'react';
import { connect } from 'react-redux';
import { makeGetAccount } from '../../../selectors';
import Header from '../components/header';
import {
  followAccount,
  unfollowAccount,
  blockAccount,
  unblockAccount,
  unmuteAccount,
  // pinAccount,
  // unpinAccount,
  subscribeAccount,
  unsubscribeAccount,

} from '../../../actions/accounts';
import {
  mentionCompose,
  directCompose,
} from '../../../actions/compose';
import { initMuteModal } from '../../../actions/mutes';
import { initReport } from '../../../actions/reports';
import { openModal } from '../../../actions/modal';
import { blockDomain, unblockDomain } from '../../../actions/domain_blocks';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { List as ImmutableList } from 'immutable';
import { getSettings } from 'soapbox/actions/settings';
import { startChat, openChat } from 'soapbox/actions/chats';
import { deactivateUserModal, deleteUserModal } from 'soapbox/actions/moderation';
import { tagUsers, untagUsers } from 'soapbox/actions/admin';
import snackbar from 'soapbox/actions/snackbar';

const messages = defineMessages({
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
  blockConfirm: { id: 'confirmations.block.confirm', defaultMessage: 'Block' },
  blockDomainConfirm: { id: 'confirmations.domain_block.confirm', defaultMessage: 'Hide entire domain' },
  blockAndReport: { id: 'confirmations.block.block_and_report', defaultMessage: 'Block & Report' },
  userVerified: { id: 'admin.users.user_verified_message', defaultMessage: '@{acct} was verified' },
  userUnverified: { id: 'admin.users.user_unverified_message', defaultMessage: '@{acct} was unverified' },
});

const isMobile = width => width <= 1190;

const makeMapStateToProps = () => {
  const getAccount = makeGetAccount();

  const mapStateToProps = (state, { accountId }) => ({
    account: getAccount(state, accountId),
    identity_proofs: state.getIn(['identity_proofs', accountId], ImmutableList()),
  });

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { intl }) => ({

  onFollow(account) {
    dispatch((_, getState) => {
      const unfollowModal = getSettings(getState()).get('unfollowModal');
      if (account.getIn(['relationship', 'following']) || account.getIn(['relationship', 'requested'])) {
        if (unfollowModal) {
          dispatch(openModal('CONFIRM', {
            message: <FormattedMessage id='confirmations.unfollow.message' defaultMessage='Are you sure you want to unfollow {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
            confirm: intl.formatMessage(messages.unfollowConfirm),
            onConfirm: () => dispatch(unfollowAccount(account.get('id'))),
          }));
        } else {
          dispatch(unfollowAccount(account.get('id')));
        }
      } else {
        dispatch(followAccount(account.get('id')));
      }
    });
  },

  onBlock(account) {
    if (account.getIn(['relationship', 'blocking'])) {
      dispatch(unblockAccount(account.get('id')));
    } else {
      dispatch(openModal('CONFIRM', {
        message: <FormattedMessage id='confirmations.block.message' defaultMessage='Are you sure you want to block {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
        confirm: intl.formatMessage(messages.blockConfirm),
        onConfirm: () => dispatch(blockAccount(account.get('id'))),
        secondary: intl.formatMessage(messages.blockAndReport),
        onSecondary: () => {
          dispatch(blockAccount(account.get('id')));
          dispatch(initReport(account));
        },
      }));
    }
  },

  onMention(account, router) {
    dispatch(mentionCompose(account, router));
  },

  onDirect(account, router) {
    dispatch(directCompose(account, router));
  },

  onReblogToggle(account) {
    if (account.getIn(['relationship', 'showing_reblogs'])) {
      dispatch(followAccount(account.get('id'), false));
    } else {
      dispatch(followAccount(account.get('id'), true));
    }
  },

  onSubscriptionToggle(account) {
    if (account.getIn(['relationship', 'subscribing'])) {
      dispatch(unsubscribeAccount(account.get('id')));
    } else {
      dispatch(subscribeAccount(account.get('id')));
    }
  },

  // onEndorseToggle(account) {
  //   if (account.getIn(['relationship', 'endorsed'])) {
  //     dispatch(unpinAccount(account.get('id')));
  //   } else {
  //     dispatch(pinAccount(account.get('id')));
  //   }
  // },

  onReport(account) {
    dispatch(initReport(account));
  },

  onMute(account) {
    if (account.getIn(['relationship', 'muting'])) {
      dispatch(unmuteAccount(account.get('id')));
    } else {
      dispatch(initMuteModal(account));
    }
  },

  onBlockDomain(domain) {
    dispatch(openModal('CONFIRM', {
      message: <FormattedMessage id='confirmations.domain_block.message' defaultMessage='Are you really, really sure you want to block the entire {domain}? In most cases a few targeted blocks or mutes are sufficient and preferable. You will not see content from that domain in any public timelines or your notifications. Your followers from that domain will be removed.' values={{ domain: <strong>{domain}</strong> }} />,
      confirm: intl.formatMessage(messages.blockDomainConfirm),
      onConfirm: () => dispatch(blockDomain(domain)),
    }));
  },

  onUnblockDomain(domain) {
    dispatch(unblockDomain(domain));
  },

  onAddToList(account) {
    dispatch(openModal('LIST_ADDER', {
      accountId: account.get('id'),
    }));
  },

  onChat(account, router) {
    // TODO make this faster
    dispatch(startChat(account.get('id'))).then(chat => {
      if (isMobile(window.innerWidth)) {
        router.push(`/chats/${chat.id}`);
      } else {
        dispatch(openChat(chat.id));
      }
    }).catch(() => {});
  },

  onDeactivateUser(account) {
    dispatch(deactivateUserModal(intl, account.get('id')));
  },

  onDeleteUser(account) {
    dispatch(deleteUserModal(intl, account.get('id')));
  },

  onVerifyUser(account) {
    const message = intl.formatMessage(messages.userVerified, { acct: account.get('acct') });
    dispatch(tagUsers([account.get('id')], ['verified'])).then(() => {
      dispatch(snackbar.success(message));
    }).catch(() => {});
  },

  onUnverifyUser(account) {
    const message = intl.formatMessage(messages.userUnverified, { acct: account.get('acct') });
    dispatch(untagUsers([account.get('id')], ['verified'])).then(() => {
      dispatch(snackbar.info(message));
    }).catch(() => {});
  },
});

export default injectIntl(connect(makeMapStateToProps, mapDispatchToProps)(Header));
