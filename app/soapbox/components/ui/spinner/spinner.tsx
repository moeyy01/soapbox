import React from 'react';
import { FormattedMessage } from 'react-intl';

import Stack from '../stack/stack';
import Text from '../text/text';

import './spinner.css';

interface ILoadingIndicator {
  size?: number,
  withText?: boolean
}

const LoadingIndicator = ({ size = 30, withText = true }: ILoadingIndicator) => (
  <Stack space={2} justifyContent='center' alignItems='center'>
    <div className='spinner' style={{ width: size, height: size }}>
      {Array.from(Array(12).keys()).map(i => (
        <div key={i}>&nbsp;</div>
      ))}
    </div>

    {withText && (
      <Text theme='muted' tracking='wide'>
        <FormattedMessage id='loading_indicator.label' defaultMessage='Loading…' />
      </Text>
    )}
  </Stack>
);

export default LoadingIndicator;