# merkletreejs

[![npm (scoped)](https://img.shields.io/npm/v/@sinasabet81/merkletreejs.svg)](https://www.npmjs.com/package/@sinasabet81/merkletreejs)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@sinasabet81/merkletreejs.svg)](https://www.npmjs.com/package/@sinasabet81/merkletreejs)

## Usage
```js
const crypto = require('crypto');
const MerkleTree = require('merkletreejs');

const sha256 = preimage =>
  crypto
    .createHash('sha256')
    .update(preimage)
    .digest();

const preimages = ['hello', 'world'];
const leaves = preimages.map(sha256);

const merkleTree = new MerkleTree(leaves, sha256);

console.log(merkleTree.getPrettyLayers());
// [
//   [
//     '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
//     '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7',
//   ],
//   ['7305db9b2abccd706c256db3d97e5ff48d677cfe4d3a5904afb7da0e3950e1e2'],
// ];

const proof = merkleTree.getProof(leaves[0]);
const result = merkleTree.verifyProof(proof);
console.log(result); // true
```

## Notes
Naive use of this library could be vulerable to a second preimage attack; see [this blog post](https://flawed.net.nz/2018/02/21/attacking-merkle-trees-with-a-second-preimage-attack/) or [this wikipedia section](https://en.wikipedia.org/wiki/Merkle_tree#Second_preimage_attack) for more info. This attack can be avoided by using a separate hash function for your leaves and inner nodes. An example copied from the test file:
```js
const leafHashFunction = inputBuffer =>
  sha256(Buffer.concat([Buffer.alloc(1, 0), inputBuffer]));
const innerHashFunction = inputBuffer =>
  sha256(Buffer.concat([Buffer.alloc(1, 1), inputBuffer]));

const tree1Preimages = ['hello', 'world', 'foo', 'bar'].map(
  Buffer.from,
);
const tree1Leaves = tree1Preimages.map(leafHashFunction);
const tree1 = new MerkleTree(tree1Leaves, innerHashFunction);
const tree1Root = tree1.getRoot();

const tree2Preimages = [
  Buffer.concat([tree1Leaves[0], tree1Leaves[1]]),
  Buffer.concat([tree1Leaves[2], tree1Leaves[3]]),
];
const tree2Leaves = tree2Preimages.map(leafHashFunction);
const tree2 = new MerkleTree(tree2Leaves, innerHashFunction);
const tree2Root = tree2.getRoot();

expect(tree1Root.equals(tree2Root)).toBeFalsy();
```
