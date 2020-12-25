import { BigInt } from "@graphprotocol/graph-ts";
import {
  Registrar,
  Approval,
  ApprovalForAll,
  RegistryCreated,
  Transfer,
} from "../generated/Registrar/Registrar";
import { Domain } from "../generated/schema";

export function handleRegistrarCreated(event: RegistryCreated): void {
  let id = event.params.tokenId.toString();
  let registry = new Domain(id);
  let parent = Domain.load(event.params.parentId.toString());
  if(parent) {
    let children = parent.children;
    children.push(event.params.domain);
    parent.children = children;
    parent.save();
  }
  registry.parentID = event.params.parentId;
  registry.domain = event.params.domain;
  registry.owner = event.params._owner;
  registry.controller = event.params._controller;
  registry.ref = event.params._ref;
  registry.children = []
  registry.save();
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
