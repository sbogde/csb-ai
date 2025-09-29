import Joyride, { STATUS } from 'react-joyride';

const steps = [
  {
    target: '.explore__plot',
    title: 'Interactive map',
    content: 'Each dot is a small patch of carving.'
  },
  {
    target: '.explore__legend',
    title: 'Colour groupings',
    content: 'Colours group carvings that look alike.'
  },
  {
    target: '.explore__sidebar select',
    title: 'Filter options',
    content: 'Filter by family or by one ball.'
  },
  {
    target: '.explore__plot .plotly .scatterlayer .points path',
    title: 'Hover for ball',
    content: 'Hover to see which ball a patch came from.',
    disableBeacon: true
  },
  {
    target: '.explore__compare',
    title: 'Compare patches',
    content: 'Click two dots to compare them side by side.'
  }
];

export default function Tour({ run, onClose }) {
  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      disableScrolling
      styles={{
        options: {
          primaryColor: '#2563eb'
        }
      }}
      callback={(data) => {
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
          onClose();
        }
      }}
    />
  );
}
