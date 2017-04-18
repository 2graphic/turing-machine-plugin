import { TypescriptPluginLoader } from "sinap-typescript";
import { getPluginInfo, Model } from "sinap-core";
import { expect } from "chai";
import { Type, Value } from "sinap-types";
import * as process from "process";

async function test() {
    const loader = new TypescriptPluginLoader();
    const info = await getPluginInfo(".");
    const plugin = await loader.load(info);

    const model = new Model(plugin);
    const q1 = model.makeNode();
    q1.set("label", new Value.Primitive(new Type.Primitive("string"), model.environment, "q1"));
    q1.set("isStartState", new Value.Primitive(new Type.Primitive("boolean"), model.environment, true));
    const q2 = model.makeNode();
    q2.set("label", new Value.Primitive(new Type.Primitive("string"), model.environment, "q2"));
    q2.set("isAcceptState", new Value.Primitive(new Type.Primitive("boolean"), model.environment, true));

    const edge = model.makeEdge(undefined, q1, q2);
    edge.set("read", new Value.Primitive(new Type.Primitive("string"), model.environment, "1"));
    edge.set("write", new Value.Primitive(new Type.Primitive("string"), model.environment, "1"));
    const RightT = new Type.Literal("Right");
    const Right = new Value.Literal(RightT, model.environment);
    const rU = new Value.Union(new Type.Union([RightT]), model.environment);
    rU.value = Right;
    edge.set("move", rU);

    const program = plugin.makeProgram(model);
    {
        const result = await program.run([new Value.Primitive(new Type.Primitive("string"), model.environment, "1")]);
        expect(result.result).to.instanceof(Value.Primitive);
        expect((result.result as Value.Primitive).value).to.equal(true);
    }
    {
        const result = await program.run([new Value.Primitive(new Type.Primitive("string"), model.environment, "0")]);
        expect(result.result).to.instanceof(Value.Primitive);
        expect((result.result as Value.Primitive).value).to.equal(false);
    }
}

test().then(() => {
    console.log("test passed");
    process.exit(0);
}).catch((err) => {
    console.log("test failed", err);
    process.exit(1);
});