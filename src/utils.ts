import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  ipfs,
  json,
  JSONValue,
  log,
} from "@graphprotocol/graph-ts";
import { Domain } from "../generated/schema";
import { RegExp } from "./lib/assemblyscript-regex/assembly";

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

export function domainGroupId(registrar: Address, groupId: BigInt): string {
  return registrar.toHex().concat("-group-").concat(groupId.toString());
}

// Fetches metadata and will save it onto the domain object if found
export function fetchAndSaveDomainMetadata(domain: Domain): void {
  const metadataUri = domain.metadata;
  if (metadataUri === null) {
    log.log(log.Level.WARNING, "No metadata uri for " + domain.id);
    return;
  }

  let reg = new RegExp(".+(Qm.+)");
  let match = reg.exec(metadataUri);
  if (match) {
    let qmLocation = match.matches[1];
    let contents = ipfs.cat(qmLocation);
    if (contents) {
      let metadataContents = contents.toString();
      domain.metadataContents = metadataContents;
      domain.save();

      let metadataAsJson = json.try_fromBytes(contents);
      if (metadataAsJson.isOk) {
        handleMetadata(domain, metadataAsJson.value);
        domain.save();
      }
    } else {
      log.log(log.Level.WARNING, "unable to fetch ipfs file: " + qmLocation);
    }
  }
}
