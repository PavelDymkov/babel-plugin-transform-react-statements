const {assert} = require("chai");
const isEquil = require("./tools");


describe("Combining child node tests", () => {
    it("should wrap contitions in div element", () => {
        let input = `
            let x =
                <If true={1}>
                    <div> foo </div>
                    <div> bar </div>
                </If>
        `;
        let output = `
            let x =
                <div>
                    {1 && <div> foo </div>}
                    {1 && <div> bar </div>}
                </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should", () => {
        let input = `
            let x =
                <p>
                    <If true={1}>
                        <div> foo </div>
                        <div> bar </div>
                    </If>
                </p>
        `;
        let output = `
            let x =
                <p>
                    {1 && <div> foo </div>}
                    {1 && <div> bar </div>}
                </p>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should", () => {
        let input = `
            let x =
                <p>
                    <For each="item" in={list}>
                        <If true={1}>
                            <div> foo </div>
                            <div> bar </div>
                        </If>
                    </For>
                </p>
        `;
        let output = `
            let x =
                <p>
                    {
                        Array.prototype.map.call(list, function (item) {
                            return <div>
                                {1 && <div> foo </div>}
                                {1 && <div> bar </div>}
                            </div>
                        }, this)
                    }
                    
                </p>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("should wrap in custom element", () => {
        let options = {
            wrapper: '<span class="x" data-attr="0" />'
        };
        let input = `
            let x =
                <For each="item" in={array}>
                    <div> foo </div>
                    <div> bar </div>
                </For>
        `;
        let output = `
            let x =
                <span class="x" data-attr="0">
                    {
                        Array.prototype.map.call(array, function (item) {
                            return <div> foo </div>;
                        }, this)
                    }
                    {
                        Array.prototype.map.call(array, function (item) {
                            return <div> bar </div>;
                        }, this)
                    }
                </span>;
        `;

        assert.isTrue(isEquil(input, output, options));
    });

    it("should", () => {
        let input = `
            let x =
                <Switch value={x}>
                    <Case value={1}>
                        <For each="item" in={list}>
                            <If true={1}>
                                <div> foo </div>
                                <div> bar </div>
                            </If>
                        </For>
                    </Case>
                    
                    <Case value={2}>
                        <div> text </div>
                    
                        <For each="item" in={list}>
                            <If true={1}>
                                <div> foo </div>
                                <div> bar </div>
                            </If>
                        </For>
                    </Case>
                </Switch>
        `;
        let output = `
            let x = function (value, case1, case2) {
                switch (value) {
                    case case1:
                        return Array.prototype.map.call(list, function (item) {
                            return <div>
                                {1 && <div> foo </div>}
                                {1 && <div> bar </div>}
                            </div>;
                        }, this);
            
                    case case2:
                        return <div>
                            <div> text </div>
                            {
                                Array.prototype.map.call(list, function (item) {
                                    return <div>
                                        {1 && <div> foo </div>}
                                        {1 && <div> bar </div>}
                                    </div>;
                                }, this)
                            }
                        </div>;
                }
            }.call(this, x, 1, 2);
        `;

        assert.isTrue(isEquil(input, output));
    });
});