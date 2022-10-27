# Dependencies

The collection of dependencies is consumed by:

* The bundles
* The transversals
* The processors that require dependencies

```typescript
interface IDependenciesContainer {
    application: object;
    distribution: object;
    language: string;
    hash: object;
}
```

## Dependencies interface

```typescript
interface IDependencies extends IDynamicProcessor<Map> {
    container: IDependenciesContainer;
    code: IDependenciesCode;
    declarations: IDependenciesDeclarations;
    errors: string[];
    valid: boolean;

    constructor(container: IDependenciesContainer, Dependency: IDependency);

    _update(): { errors: string[], updated: Map<string, IDependency> };

    _create(resource): IDependency;
}
```

# Dependency interface

```typescript
interface IDependency extends IDynamicProcessor {
    resource: string;
    id: string;
    seeker: IModuleSeeker;
    errors: string[];   // Shortcut to seeker.errors
    valid: boolean;     // Shortcut to seeker.valid
    external;           // Shortcut to seeker.external
    node;               // Shortcut to seeker.node
    bundle;             // Shortcut to seeker.bundle
    kind: string;
    pathname: string;
    declaration: IDependencyDeclaration;
    is: Set<string>;    // What kind of dependency it is ('import' | 'type' | 'reference')

    constructor(resource: string, container: IDependenciesContainer);
}
```

## Dependency declaration interface

```typescript
interface IDependencyDeclaration {
    errros: string[];
    valid: boolean;
    value: string;
    hash: number;
    version: number;

    constructor(application: object, dependency: IDependency);
}
```
