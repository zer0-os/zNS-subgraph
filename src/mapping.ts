import { BigInt, Bytes, crypto } from "@graphprotocol/graph-ts";
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

const zeroAddress = Bytes.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000000000"
) as Bytes;

/*
const ROOT_ID_HASH = crypto.keccak256(
  coder.encode(["uint256", "string"], [zeroBytes32, "ROOT"])
);

const ROOT_ID = BigNumber.from(ROOT_ID_HASH.toString()).toString();

function calcId(_domain: string): string {
  if (_domain === "ROOT") {
    return ROOT_ID;
  }
  const domains = _domain.split(".");
  let hash = ROOT_ID_HASH;
  for (const domain of domains) {
    hash = keccak256(coder.encode(["uint256", "string"], [hash, domain]));
  }
  return BigNumber.from(hash).toString();
}
*/

export function handleDomainCreated(event: DomainCreated): void {
  let id = event.params.tokenId.toString();
  let domain = new Domain(id);
  domain.parent = event.params.parentId;
  domain.name = event.params.name;
  domain.owner = event.params.owner;
  domain.timeCreated = event.block.timestamp.toI32();
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

export function handleLockablePropertiesSet(event: LockablePropertiesSet): void {
  let id = event.params.id.toString();
  let domain = Domain.load(id);
  domain.lockableProperties = event.params.lockableProperties;
  domain.save();
}

export function handleChildCreateLimitSet(event: ChildCreateLimitSet): void {
  let id = event.params.id.toString();
  let domain = Domain.load(id);
  domain.childCreateLimit = event.params.childCreateLimit;
  domain.save()
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

export function handleChildPropertiesRuleSet(event: ChildLockablePropertiesRuleSet): void {
  let id = event.params.id.toString();
  let domain = Domain.load(id);
  domain.childPropertiesRule = event.params.rule;
  domain.save();
}
