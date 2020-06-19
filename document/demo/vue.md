---
order: 1
title: demo1
---

PC模板

````jsx
import { Button } from 'antd';
import { createSandbox, destroySandbox } from './vue';

ReactDOM.render(
  <div>
    <Button key={1} onClick={createSandbox}>Create Sandbox</Button>&nbsp;
    <Button key={2} type="primary" onClick={destroySandbox}>Destroy Sandbox</Button>
  </div>,
  mountNode,
);
````
