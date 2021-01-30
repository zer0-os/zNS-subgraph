import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  Approval,
  ApprovalForAll,
  DomainCreated,
  Transfer,
  ImageSet
} from "../generated/Registry/Registry";
import { Domain } from "../generated/schema";

const zeroAddress = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000000000"
) as Bytes;

export function handleDomainCreated(event: DomainCreated): void {
  let id = event.params.tokenId.toString();
  let domain = new Domain(id);
  domain.parent = event.params.parentId;
  domain.domain = event.params.domain;
  domain.owner = event.params.owner;
  domain.controller = event.params.controller;
  domain.resolver = event.params.resolver;
  domain.image = event.params.image;
  domain.approval = null;
  domain.save();
}

export function handleApproval(event: Approval): void {
  let domain = Domain.load(event.params.tokenId.toString());
  domain.approval = event.params.approved.equals(zeroAddress)
    ? null
    : event.params.approved;
  domain.save();
}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleTransfer(event: Transfer): void {
  let id = event.params.tokenId.toString();
  let domain = Domain.load(id);
  if (domain) {
    domain.owner = event.params.to;
    domain.save();
  }
}

export function handleImageSet(event: ImageSet): void {
  let id = event.params.id.toString();
  let domain = Domain.load(id);
  domain.image = event.params.image;
  domain.save();
}
