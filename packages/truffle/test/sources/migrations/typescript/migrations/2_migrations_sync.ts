/// <reference types="./global" />
/* global artifacts */
const Example = artifacts.require("Example");
const UsesExample = artifacts.require("UsesExample");

export default function (deployer: any) {
  deployer
    .deploy(Example)
    .then(() => deployer.deploy(UsesExample, Example.address));
}
