import { BigInt, ByteArray } from "@graphprotocol/graph-ts";

export function byteArrayFromHex(s: string): ByteArray {
  if (s.length % 2 !== 0) {
    throw new TypeError("Hex string must have an even number of characters");
  }
  let out = new Uint8Array(s.length / 2);
  for (let i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.substring(i, i + 2), 16) as u32;
  }
  return out as ByteArray;
}

export function uint256ToByteArray(i: BigInt): ByteArray {
  let hex = i.toHex().slice(2).padStart(64, "0");
  return byteArrayFromHex(hex);
}

export function containsAny(target: string, search: string): boolean {
  for (let i = 0; i < search.length; ++i) {
    if (target.includes(search.charAt(i))) {
      return true;
    }
  }

  return false;
}
