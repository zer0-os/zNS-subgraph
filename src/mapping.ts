import { BigInt } from "@graphprotocol/graph-ts";
import {
  Registrar,
  Approval,
  ApprovalForAll,
  DomainCreated,
  Transfer,
} from "../generated/Registrar/Registrar";
import { Domain } from "../generated/schema";

export function handleDomainCreated(event: DomainCreated): void {
  let id = event.params.tokenId.toString();
  let domain = new Domain(id);
  let parent = Domain.load(event.params.parentId.toString());
  if(parent) {
    let children = parent.children;
    children.push(event.params.domain);
    parent.children = children;
    parent.save();
  }
  domain.parentID = event.params.parentId;
  domain.domain = event.params.domain;
  domain.owner = event.params._owner;
  domain.controller = event.params._controller;
  domain.ref = event.params._ref;
  domain.children = []
  domain.save();
}

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleTransfer(event: Transfer): void {
  let id = event.params.tokenId.toString();
  let domain = Domain.load(id);
  if (domain) {
    domain.owner = event.params.to;
    domain.save();
  }
}
