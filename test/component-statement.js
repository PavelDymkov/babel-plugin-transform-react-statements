const {assert} = require("chai");
const isEquil = require("./tools");


describe("Component statement", () => {
    it("case 1", () => {
        let input = `
            <Component>
                <div> text </div>
            </Component>;
        `;
        let output = `
            props => <div> text </div>;
        `;

        assert.isTrue(isEquil(input, output));
    });

    it("case 2", () => {
        let input = `
            <Component props="item">
                <div {...item} />
            </Component>;
        `;
        let output = `
            item => <div {...item} />;
        `;

        assert.isTrue(isEquil(input, output));
    });
});
