# The "css" (less & scss) processors

The "css" processors (less & scss) are not only used in the bundles, but are additionally required to process the
application style sheets:

* template.application (where the custom properties are expected to be located)
* template.global (included in every shadow dom of the widgets).

## Template styles functions

The template functions are two processors (one for less and one for scss) which in turn are required by the less and
scss processors.

The reason why the functions are implemented as a processor is that it is required to evaluate if they generate any css
code. In which case it would cause the same css code to be replicated across all processors.
