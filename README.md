## 微应用沙箱

为微应用提供封闭运行环境的容器。

由两部分构成，

1. 一个是JS沙箱，提供模拟的window，使用@ice/sandbox；
2. 一个是UI沙箱，提供模拟的document，基于Shadow DOM。

一般的沙箱，主要会专注于解决JS执行环境的隔离问题，主要在模拟window。JS隔离的几个核心的问题是：全局变量污染、事件监听、定时器等。

但是，对于一个完整的前端应用，除了JS执行环境的隔离，还会样式污染问题，以及由DOM操作带来的副作用(如动态插入元素等)。

样式污染问题，容易想到的解决方案有：CSS Module、Shadow DOM等。

从原理上来说，Shadow DOM提供了天然的样式隔离沙箱。同时，它对与样式对应的HTML也有约束，需要样式、HTML在同一个ShadowRoot中。

HTML的操作，其实就涉及DOM操作了，而元素创建、插入很多与document、document.body相关，所以需要模拟document，否则会出现DOM逃逸。

这样一来，将内容渲染到ShadowDOM里需要对组件库做的修正，就不需要了。因为对于程序来说，整个生命周期都在沙箱里，代码依然在按照自己既定的逻辑执行。
