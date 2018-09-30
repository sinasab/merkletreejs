const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

class MerkleTree {
  constructor(leaves = [], hash) {
    assert(
      Array.isArray(leaves),
      `Error, leaves should be an array! Got ${leaves}`,
    );
    assert(
      leaves.length > 0,
      `Error, you need at least one leaf, got ${leaves.length}`,
    );
    leaves.forEach(leaf =>
      assert(
        Buffer.isBuffer(leaf),
        `Error, leaves should only have buffers, got ${leaf}`,
      ),
    );
    leaves.forEach((leaf, idx) =>
      assert(
        leaves.every((leaf2, idx2) => !leaf.equals(leaf2) || idx === idx2),
        `Error, duplicate leaf found, ${leaf} at index ${idx} has a duplicate`,
      ),
    );

    this.leaves = leaves;
    this.hash = hash;

    this.layers = [leaves];
    let currentLayer = leaves;
    while (currentLayer.length > 1) {
      const newLayer = [];
      for (let i = 0; i < currentLayer.length - 1; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1];
        const preimage = Buffer.concat([left, right]);
        const digest = this.hash(preimage);
        assert(
          Buffer.isBuffer(digest),
          `Hash function should output a buffer! Got ${digest}`,
        );
        newLayer.push(digest);
      }
      if (currentLayer.length % 2 === 1) {
        newLayer.push(currentLayer[currentLayer.length - 1]);
      }
      this.layers.push(newLayer);
      currentLayer = newLayer;
    }
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  getPrettyRoot() {
    return this.getRoot().toString('hex');
  }

  getLayers() {
    return this.layers;
  }

  getPrettyLayers() {
    return this.getLayers().map(layer =>
      layer.map(node => node.toString('hex')),
    );
  }

  toString() {
    return JSON.stringify(this.getPrettyLayers());
  }

  getProof(leaf) {
    let currentIdx = this.layers[0].findIndex(item => item.equals(leaf));
    if (currentIdx === -1) {
      return { leaf, siblings: [], root: this.getRoot() };
    }
    const siblings = [];
    for (let i = 0; i < this.layers.length - 1; i += 1) {
      const layer = this.layers[i];
      const nodePos = currentIdx % 2 === 0 ? 'left' : 'right';
      const siblingOffset = nodePos === 'left' ? 1 : -1;
      if (layer.length > currentIdx + siblingOffset) {
        const siblingHash = layer[currentIdx + siblingOffset];
        const siblingPosition = nodePos === 'left' ? 'right' : 'left';
        siblings.push({
          siblingHash,
          siblingPosition,
        });
      }
      currentIdx = Math.floor(currentIdx / 2);
    }
    return { leaf, siblings, root: this.getRoot() };
  }

  getPrettyProof(leaf) {
    const {
      siblings: uglySiblings,
      root: uglyRoot,
      leaf: uglyLeaf,
    } = this.getProof(leaf);
    return {
      siblings: uglySiblings.map(({ siblingHash, siblingPosition }) => ({
        siblingPosition,
        siblingHash: siblingHash.toString('hex'),
      })),
      leaf: uglyLeaf.toString('hex'),
      root: uglyRoot.toString('hex'),
    };
  }

  verifyProof({ leaf, siblings, root }) {
    const potentialRoot = siblings.reduce(
      (accumulator, { siblingHash, siblingPosition }) => {
        const preimage =
          siblingPosition === 'left'
            ? Buffer.concat([siblingHash, accumulator])
            : Buffer.concat([accumulator, siblingHash]);
        return this.hash(preimage);
      },
      leaf,
    );
    return root.equals(potentialRoot);
  }
}
module.exports = { MerkleTree };

// const a = new MerkleTree(['hi', 'world', 'blarg'].map(defaultHashSha256));
// console.log(a.toString());
// const leaf = defaultHashSha256('hi');
// const proof = a.getProof(leaf);
// console.log(a.getPrettyProof(leaf));
// const res = a.verifyProof(leaf, proof.proof, proof.root);
// console.log(res);
