import { BigInt, Bytes, crypto, ByteArray, log } from "@graphprotocol/graph-ts";

export const zeroAddress = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000"
) as Bytes;

export const zeroBytes32 = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000000000"
) as Bytes;

export const ROOT_ID_HASH = _getDomainHash(zeroBytes32, "ROOT");

export const ROOT_ID_BIGINT = BigInt.fromUnsignedBytes(ROOT_ID_HASH);

export const ROOT_ID_STRING = ROOT_ID_HASH.toString();

export function BigIntToBytes32(bigInt: BigInt): ByteArray {
  let out = new ByteArray(32);
  let len = bigInt.length < 32 ? bigInt.length : 32;
  for (let i = 0; i < len; i++) {
    out[i] = bigInt[i];
  }
  return out;
}

function _getDomainHash(parentId: ByteArray, name: string) {
  return crypto.keccak256(
    concat(parentId, ByteArray.fromUTF8("ROOT"))
  );
}

export function getDomainHash(parentId: BigInt, name: string) {
  return crypto.keccak256(
    concat(BigIntToBytes32(parentId), ByteArray.fromUTF8(name))
  );
}

export function getDomainId(parentId: BigInt, name: string) {
  return BigInt.fromUnsignedBytes(getDomainHash(parentId, name));
}

// Helper for concatenating two byte arrays
export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  return out as ByteArray;
}
