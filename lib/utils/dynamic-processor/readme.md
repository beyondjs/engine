# Introduction

The context on which the DynamicProcessor is designed, is when there is an asynchronous processing, and where you want
to access the processed data synchronously, once the asynchronous processing has finished.

The general logic of the processor is that it starts in an inactive state, and once started, it is kept up-to-date by
processing each time it is invalidated and as long as it has already been started. As the consumption of the
DynamicProcessor data is synchronous, the data must be consumed after waiting for the .ready promise, or after receiving
change notifications ('change' event). The 'change' event guarantees that the data has already been previously
processed.

## Processor usage is as follows:

1- Access the .ready property

* await processor.ready;

2- Listen for changes

* processor.on ('change', listener);

## Characteristics

- The processor does not execute processing until it is initialized.
- If the .ready property (await processor.ready) is accessed, the processor is initialized, therefore processing is
  executed.
- If the processor is invalidated, and it has already been initialized, then the .process method is executed
  automatically.
- It emits change events every time it is processed again, starting from the second processing. The first processing is
  considered the initial state, and each additional processing, a change of the state of the processor.

## Considerations

- The initialise() method internally calls the _process() method. The processor is considered initialized when it has already been processed for the first time.

## Problems that DynamicProcessor solves

* Invalidating the object (execute ._invalidate()) implies reprocessing it, but only if it has already been initialized.
* The _process (request) method receives the request parameter that allows, after executing any asynchronous function,
  to verify if it should continue processing or cancel the execution.

```
_process(request) {
  await asyncMethod ();
  if (this._request! == request) return; // Cancel execution
}
```

* If the object is invalidated while processing, DynamicProcessor rerun the _process method automatically.
