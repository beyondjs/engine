#Dynamic Processor Model
Interface implemented by objects to be compatible with the **dynamic processor model**.

* Data must be accessed synchronously every time the object has been processed.
* Emit the 'change' event at every change of the processed data.
* When the 'change' event is emitted, the data must already be processed.
* Expose the .processing / .processed properties.
* When processing, processed must be always false.
* Expose the async .initialise() method.
* Expose the .ready property, that returns a promise that resolves when the data is processed and ready to be consumed.
* If the object is not initialized when the .ready property is accessed, then the object is initialized automatically.
* Once initialised (processed for the first time) the event 'initialised' is emitted.

## Minimum interface required:
* on / off (EventListener)
* get ready(): Promise
* initialise = () => void (0);
* get processed() {return true;}
* trigger 'change' event on every change
* trigger 'initialised' event when initialised
