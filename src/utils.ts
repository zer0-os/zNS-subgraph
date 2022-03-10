import { BigInt, ByteArray, Bytes, JSONValue, log, Value } from "@graphprotocol/graph-ts";
import { Domain } from "../generated/schema";

export function byteArrayFromHex(s: string): ByteArray {
  if (s.length % 2 !== 0) {
    throw new TypeError("Hex string must have an even number of characters");
  }
  let out = new Uint8Array(s.length / 2);
  for (let i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.substring(i, i + 2), 16) as u32;
  }
  return changetype<Bytes>(out);
}

export function toPaddedHexString(i: BigInt): string {
  let hex = i.toHex();
  let padded = hex.substr(0, 2) + hex.substr(2).padStart(64, "0");
  return padded;
}

export function containsAny(target: string, search: string): boolean {
  for (let i = 0; i < search.length; ++i) {
    if (target.includes(search.charAt(i))) {
      return true;
    }
  }

  return false;
}

export function handleMetadata(domain: Domain, value: JSONValue): void {
  let obj = value.toObject();

  let name = obj.get("name");
  if (name && !name.isNull()) {
    domain.metadataName = name.toString();
  }

  let image = obj.get("image");
  if (image && !image.isNull()) {
    domain.metadataImage = image.toString();
  }

  let animation = obj.get("animation_url");
  if (animation && !animation.isNull()) {
    domain.metadataAnimation = animation.toString();
  }

  domain.save();
}
