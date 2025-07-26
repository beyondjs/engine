# validator

Checks the skeleton values.

The skeleton items can be strings or objects.

#Object properties

You can use an object value when you specify details about how the property needs to be validated.

The options to define are exposed below

- **name:** The property name
- **type** Type of value, could be one of the next:
    - Regular javascript dataTypes
    - eoc
    - aoc.
- **pipe**: callback function to executed as validation
- **values**: An array of values that can be received. If the filed gets a value that was not specified in the array, the
  validator will return an invalid field.
- **properties**: object to define properties of a nested object property.

