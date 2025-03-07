import reactLogo from '@/assets/react.svg';
import { Button } from '@workspace/ui/components/button';
import '@workspace/ui/globals.css';
import { useState } from 'react';
import wxtLogo from '/wxt.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <Button
          className='hover:scale-105 transition-all duration-300'
          variant={'destructive'}
        >
          Click me
        </Button>
        <a href='https://wxt.dev' target='_blank' className=''>
          <img src={wxtLogo} className='logo' alt='WXT logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1 className='text-xl uppercase font-bold'>WXT + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the WXT and React logos to learn more
      </p>
    </>
  );
}

export default App;
