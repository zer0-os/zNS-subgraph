import { log } from "@graphprotocol/graph-ts";
import {
  Approval,
  ApprovalForAll,
  DomainCreated,
  Transfer,
  LockablePropertiesSet,
  ChildCreateLimitSet,
  PropertiesSet,
  ControllerSet,
  ChildLockablePropertiesRuleSet
} from "../generated/ZNSRegistry/ZNSRegistry";
import { Domain } from "../generated/schema";
import { ROOT_ID_BIGINT, zeroAddress } from "./utils"

export function handleDomainCreated(event: DomainCreated): void {
  let id = event.params.tokenId;
  let parentId = event.params.parentId;
  let domain = new Domain(id.toString());
  domain.parent = event.params.parentId;
  domain.name = event.params.name;
  domain.owner = event.params.owner;
  domain.timeCreated = event.block.timestamp.toI32();
  log.info("domain name", [domain.name]);
  if (id.equals(ROOT_ID_BIGINT)) {
    domain.domain = event.params.name;
  } else if (parentId.equals(ROOT_ID_BIGINT)) {
    domain.domain = event.params.name;
  } else {
    let parent = Domain.load(parentId.toString());
    log.info("parent name", [parent.name]);
    domain.domain = parent.domain + "." + event.params.name;
  }
  log.info("domain created", [domain.domain]);
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

export function handleLockablePropertiesSet(
  event: LockablePropertiesSet
): void {
  let id = event.params.id.toString();
  let domain = Domain.load(id);
  domain.lockableProperties = event.params.lockableProperties;
  domain.save();
}

export function handleChildCreateLimitSet(event: ChildCreateLimitSet): void {
  let id = event.params.id.toString();
  let domain = Domain.load(id);
  domain.childCreateLimit = event.params.childCreateLimit;
  domain.save();
}

export function handlePropertiesSet(event: PropertiesSet): void {
  let id = event.params.id.toString();
  let domain = Domain.load(id);
  domain.properties = event.params.properties;
  domain.save();
}

export function handleController(event: ControllerSet): void {
  let id = event.params.id.toString();
  let domain = Domain.load(id);
  domain.controller = event.params.newController;
  domain.save();
}

export function handleChildPropertiesRuleSet(
  event: ChildLockablePropertiesRuleSet
): void {
  let id = event.params.id.toString();
  let domain = Domain.load(id);
  domain.childPropertiesRule = event.params.rule;
  domain.save();
}
