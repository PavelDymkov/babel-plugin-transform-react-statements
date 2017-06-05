# babel-plugin-transform-react-statements

Плагин добавляет выражения в виде React-компонентов, такие, как \<For />, \<If />, \<Switch />.


### Example

**in**

```jsx
<div>
    <Switch value={props.current}>
        <Case value="foo">
            <If true={props.bar}>
                <div> Foo..bar </div>
            </If>
        </Case>
        
        <Case value={props.name}>
            <For each="item" in={props.items}>
                <Item key={item.id} content={item.value} />
            </For>
        </Case>
        
        <Default>
            <For in={props.defaultItems} key-is="id">
                <Item />
            </For>
        </Default>
    </Switch>
</div>
```

**out**

```jsx
<div>
    {function (value, case1, case2) {
        switch (value) {
            case case1:
                return props.bar && <div> Foo..bar </div>;

            case case2:
                return <span>{Array.prototype.map.call(props.items, function (item, index) {
                    return <Item key={item.id} content={item.value} />;
                }, this)}</span>;
        }

        return <span>{Array.prototype.map.call(props.defaultItems, function (value, index) {
            return <Item key={value.id} {...value} />;
        }, this)}</span>;
    }.call(this, props.current, "foo", props.name)}
</div>;

```


# Table of Contents

* [Installation](#installation)
* [For](#for)
* [If](#if)
* [Switch](#switch)
* [Component](#component)


# Installation

```sh
npm install --save-dev babel-plugin-transform-react-statements
```


# For

### Attributes:

* **in** _(expression)_ - iterable object.
* **each** _(string)_ - variable name for each items of iterable object. Not mandatory.
* **counter** _(string)_ - the name of index variable. By default, index.
* **key-is** _(string)_ - the name of the property that stores the unique identifier of the element. Not required.

### Example:

**in**

```jsx
<For in={props.items} key-is="id">
    <Item />
</For>
```

**out**

```jsx
<span>{Array.prototype.map.call(props.items, function (value, index) {
    return <Item key={value.id} {...value} />;
}, this)}</span>;
```


# If

### Attributes:

* **true/false** _(expression)_ - condition statement.

### Example:

```jsx
<If false={props.hidden}>
    <div> Text </div>
</If>
```


# Switch

### Attributes:

* **value** _(expression)_ - condition statement.

### Child components:

* **\<Case value={string | expression} />**
* **\<Default />**

### Example:

```jsx
<Switch value={props.axle}>
    <Case value="x">
        <div> X </div>
    </Case>
    
    <Case value="y">
        <div> Y </div>
    </Case>
</Switch>
```


# Component

### Attributes:

* **props** _(string)_ - the name of first attribute. By default, props.

### Example:

**in**

```jsx
<Component props="item">
    <div> Item: <span>{item.name}</span> </div>
</Component>
```

**out**

```jsx
item => <div> Item: <span>{item.name}</span> </div>;
```

