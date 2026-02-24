import { Slide } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';

const SlideUpTransition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />;
});

export default SlideUpTransition;
