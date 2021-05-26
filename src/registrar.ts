import { BigInt } from "@graphprotocol/graph-ts";
import {
  DomainCreated,
  Transfer,
  MetadataLocked,
  MetadataUnlocked,
  MetadataChanged,
  RoyaltiesAmountChanged,
} from "../generated/Registrar/Registrar";
import {
  Account,
  Domain,
  DomainTransferred,
  DomainMetadataChanged,
  DomainMetadataLocked,
  DomainRoyaltyChanged,
} from "../generated/schema";

import { uint256ToByteArray, containsAny } from "./utils";

// event DomainCreated(
//   uint256 indexed id,
//   string name,
//   uint256 indexed nameHash,
//   uint256 indexed parent,
//   address minter,
//   address controller
// );
export function handleDomainCreated(event: DomainCreated): void {
  let account = new Account(event.params.minter.toHex());
  account.save();

  let domainId = uint256ToByteArray(event.params.id);
  let domain = Domain.load(domainId.toHex());

  let parentId = uint256ToByteArray(event.params.parent);
  let domainParent = Domain.load(parentId.toHex());
  domain.owner = account.id;
  domain.minter = account.id;

  let hasBadCharacters = containsAny(event.params.name, "\n,./<>?;':\"[]{}=+`~!@#$%^&*()|\\ ");
  if (hasBadCharacters) {
    return;
  }

  if (domainParent.name == null) {
    domain.name = event.params.name;
  } else {
    domain.name = domainParent.name + "." + event.params.name;
  }
  domain.label = event.params.name;
  domain.labelHash = event.params.nameHash.toHex();
  domain.parent = parentId.toHex();
  domain.creationTimestamp = event.block.timestamp;

  domain.save();
}

// event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
export function handleTransfer(event: Transfer): void {
  let account = new Account(event.params.to.toHex());
  account.save();

  let domainId = uint256ToByteArray(event.params.tokenId);
  let domain = Domain.load(domainId.toHex());
  if (domain == null) {
    domain = new Domain(domainId.toHex());
    domain.isLocked = false;
    domain.royaltyAmount = BigInt.fromI32(0);
  }
  domain.owner = account.id;
  domain.save();

  let transferEvent = new DomainTransferred(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  transferEvent.domain = domainId.toHex();
  transferEvent.blockNumber = event.block.number.toI32();
  transferEvent.transactionID = event.transaction.hash;
  transferEvent.timestamp = event.block.timestamp;
  transferEvent.save();
}

export function handleMetadataChanged(event: MetadataChanged): void {
  let domainId = uint256ToByteArray(event.params.id);
  let domain = Domain.load(domainId.toHex());
  if (domain == null) {
    domain = new Domain(domainId.toHex());
  }
  domain.metadata = event.params.uri;
  domain.save();

  let dmc = new DomainMetadataChanged(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  dmc.domain = domainId.toHex();
  dmc.blockNumber = event.block.number.toI32();
  dmc.transactionID = event.transaction.hash;
  dmc.timestamp = event.block.timestamp;
  dmc.metadataUri = event.params.uri;

  dmc.save();
}

export function handleMetadataLocked(event: MetadataLocked): void {
  let account = new Account(event.params.locker.toHex());
  account.save();

  let domainId = uint256ToByteArray(event.params.id);
  let domain = Domain.load(domainId.toHex());
  if (domain == null) {
    domain = new Domain(domainId.toHex());
  }
  domain.isLocked = true;
  domain.lockedBy = account.id;
  domain.save();

  let dml = new DomainMetadataLocked(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  dml.domain = domainId.toHex();
  dml.blockNumber = event.block.number.toI32();
  dml.transactionID = event.transaction.hash;
  dml.timestamp = event.block.timestamp;
  dml.isLocked = true;
  dml.save();
}

export function handleMetadataUnlocked(event: MetadataUnlocked): void {
  let domainId = uint256ToByteArray(event.params.id);
  let domain = Domain.load(domainId.toHex());
  if (domain == null) {
    domain = new Domain(domainId.toHex());
  }
  domain.isLocked = false;
  domain.lockedBy = null;
  domain.save();

  let dml = new DomainMetadataLocked(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  dml.domain = domainId.toHex();
  dml.blockNumber = event.block.number.toI32();
  dml.transactionID = event.transaction.hash;
  dml.timestamp = event.block.timestamp;
  dml.isLocked = false;

  dml.save();
}

export function handleRoyaltiesAmountChanged(event: RoyaltiesAmountChanged): void {
  let domainId = uint256ToByteArray(event.params.id);
  let domain = Domain.load(domainId.toHex());
  if (domain == null) {
    domain = new Domain(domainId.toHex());
  }
  domain.royaltyAmount = event.params.amount;
  domain.save();

  let drc = new DomainRoyaltyChanged(
    event.block.number.toString().concat("-").concat(event.logIndex.toString()),
  );
  drc.domain = domainId.toHex();
  drc.blockNumber = event.block.number.toI32();
  drc.transactionID = event.transaction.hash;
  drc.timestamp = event.block.timestamp;
  drc.royaltyAmount = event.params.amount;
  drc.save();
}
